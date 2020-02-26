const db = require('./database/postgres.js'); //Postgres
module.exports = {
  getReviewsList: (productID, page, count, sort) => {
    let queryString = `SELECT reviews.id AS review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, (SELECT COALESCE(json_agg(photos), '[]') FROM (SELECT id, url FROM photos WHERE review_id = reviews.id ORDER BY id ASC) photos) AS photos FROM reviews WHERE id IN (SELECT id FROM reviews WHERE product_id = ${productID} AND reported = 0) ORDER BY ${sort} DESC LIMIT ${count} OFFSET ${page *
      count}`;
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
    ]);
  },
  addReview: (body, productID) => {
    let addReview =
      'INSERT INTO reviews(product_id, rating, summary, body, recommend, reviewer_name, reviewer_email) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id';
    let addPhotos = 'INSERT INTO photos(review_id, url) VALUES ($1, $2)';
    let addCharacteristics =
      'INSERT INTO characteristic_reviews(characteristic_id, review_id, value) VALUES($1, $2, $3)';
    return db.task(task => {
      return task
        .one(addReview, [
          productID,
          body.rating,
          body.summary,
          body.body,
          body.recommend,
          body.name,
          body.email
        ])
        .then(data => {
          let reviewID = data.id;
          let photoAdditionPromises = body.photos
            ? body.photos.map(photo => task.none(addPhotos, [reviewID, photo]))
            : [];
          let addPromises = [...photoAdditionPromises];
          Object.entries(body.characteristics).forEach(([key, value]) => {
            addPromises.push(
              task.none(addCharacteristics, [key, reviewID, value])
            );
          });
          return Promise.all(addPromises);
        });
    });
  },
  setHelpful: reviewID => {
    return db.none(
      'UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = $1',
      reviewID
    );
  },
  reportReview: reviewID => {
    return db.none('UPDATE reviews SET reported = 1 WHERE id = $1', reviewID);
  }
};
