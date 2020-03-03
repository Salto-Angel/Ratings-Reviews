const db = require('./database/postgres.js'); //Postgres
const redis = require('redis');
const { promisify } = require('bluebird');

const redisClient = redis.createClient(process.env.REDIS_PORT || 6379);
/*
 To start Redis Server:
  - Open Ubuntu WSL
  - sudo service redis-server start
  */
redisClient.on('connect', function() {
  console.log('Redis is connected');
});

redisClient.on('ready', function() {
  console.log('Redis is ready');
});

redisClient.on('error', function(err) {
  console.log('Something went wrong ', err);
});

const existsAsync = promisify(redisClient.exists).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

module.exports = {
  getReviewsList: (productID, page, count, sort) => {
    if (sort === 'newest') {
      sort = 'date';
    } else if (sort === 'helpfulness' || sort === 'relevant') {
      sort = 'helpfulness';
    } else {
      sort = 'No Sorting';
    }
    // let queryString = `SELECT reviews.id AS review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, (SELECT COALESCE(json_agg(photos), '[]') FROM (SELECT id, url FROM photos WHERE review_id = reviews.id ORDER BY id ASC) photos) AS photos FROM reviews WHERE id IN (SELECT id FROM reviews WHERE product_id = ${productID} AND reported = 0) ORDER BY ${sort} DESC LIMIT ${count} OFFSET ${page *
    //   count}`;
    let queryString = `SELECT reviews.id AS review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, (SELECT COALESCE(json_agg(photos), '[]') FROM (SELECT id, url FROM photos WHERE review_id = reviews.id ORDER BY id ASC) photos) AS photos FROM reviews WHERE id IN (SELECT id FROM reviews WHERE product_id = ${productID} AND reported = 0 AND id > ${page *
      count}) ORDER BY ${sort} DESC LIMIT ${count} `;
    return db.any(queryString);
  },
  getMeta: productID => {
    // Get the ratings totals
    let ratingsCount =
      'SELECT rating, COUNT(*) as count FROM reviews WHERE id IN (SELECT id FROM reviews WHERE reviews.product_id = $1) GROUP BY rating ORDER BY rating ASC';
    // let ratingsCount =
    //   'SELECT rating, COUNT(*) as count FROM reviews WHERE product_id = $1 GROUP BY rating ORDER BY rating ASC';

    // Get the recommendation totals
    let recommendCount =
      'SELECT recommend, COUNT(*) as count FROM reviews WHERE id IN (SELECT id FROM reviews WHERE reviews.product_id = $1) GROUP BY recommend ORDER BY recommend ASC';
    // let recommendCount =
    //   'SELECT recommend, COUNT(*) as count FROM reviews WHERE product_id = $1 GROUP BY recommend ORDER BY recommend ASC';

    // Get all characteristic data
    let charQuery =
      'SELECT c.id, name, SUM(value) as SUM, COUNT(value) as COUNT FROM characteristics c INNER JOIN characteristic_reviews cr ON c.id = cr.characteristic_id WHERE c.id IN (SELECT id FROM characteristics WHERE product_id = $1) GROUP BY c.id, name ORDER BY c.id ASC';
    // let charQuery =
    //   'SELECT c.id, name, SUM(value) as SUM, COUNT(value) as COUNT FROM characteristics c INNER JOIN characteristic_reviews cr ON c.id = cr.characteristic_id WHERE c.product_id = $1 GROUP BY c.id, name ORDER BY c.id ASC';

    return existsAsync(productID).then(exists => {
      if (exists === 1) {
        return getAsync(productID).then(reply => {
          return JSON.parse(reply);
        });
      } else {
        return Promise.all([
          db.any(ratingsCount, productID).then(meta => {
            let returnObj = {};
            meta.forEach(rating => {
              returnObj[rating.rating] = Number(rating.count);
            });
            return returnObj;
          }),
          db.any(recommendCount, productID).then(meta => {
            let returnObj = {};
            meta.forEach(recommend => {
              returnObj[recommend.recommend] = Number(recommend.count);
            });
            return returnObj;
          }),
          db.any(charQuery, productID).then(meta => {
            let avgMap = [];
            meta.forEach(char => {
              avgMap.push({
                id: char.id,
                name: char.name,
                value: (Number(char.sum) / Number(char.count)).toFixed(4)
              });
            });
            return avgMap;
          })
        ]).then(results => {
          setAsync(productID, JSON.stringify(results));
        });
      }
    });
  },
  addReview: (body, productID) => {
    let addReview =
      'INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';
    let addPhotos =
      'INSERT INTO photos(review_id, url) VALUES ($1, $2) RETURNING *';
    let addCharacteristics =
      'INSERT INTO characteristic_reviews(characteristic_id, review_id, value) VALUES($1, $2, $3) RETURNING *';
    return db.task(task => {
      return task
        .one(addReview, [
          productID,
          body.rating,
          body.date || new Date(),
          body.summary,
          body.body,
          body.recommend,
          0,
          body.name,
          body.email,
          '',
          0
        ])
        .then(data => {
          let reviewID = data.id;
          let photoAdditionPromises = body.photos
            ? body.photos.map(photo => task.any(addPhotos, [reviewID, photo]))
            : [];
          let addPromises = [...photoAdditionPromises];
          Object.entries(body.characteristics).forEach(([key, value]) => {
            addPromises.push(
              task.any(addCharacteristics, [key, reviewID, value])
            );
          });
          return Promise.all([data].concat(addPromises));
        });
    });
  },
  setHelpful: reviewID => {
    return db.any(
      'UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = $1 RETURNING helpfulness',
      reviewID
    );
  },
  reportReview: reviewID => {
    return db.any(
      'UPDATE reviews SET reported = 1 WHERE id = $1 RETURNING reported',
      reviewID
    );
  }
};
