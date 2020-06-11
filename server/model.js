const db = require('./database/postgres.js'); //Postgres
const redis = require('redis');
const { promisify } = require('bluebird');

const redisClient = redis.createClient(process.env.REDIS_PORT || 6379);

redisClient.on('connect', function () {
  console.log('Redis is connected');
});

redisClient.on('ready', function () {
  console.log('Redis is ready');
});

redisClient.on('error', function (err) {
  console.log('Something went wrong ', err);
});

const existsAsync = promisify(redisClient.exists).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

module.exports = {
  getReviewsList: async (productID, page, count, sort) => {
    // Convert sorting parameter to correct terminology
    if (sort === 'newest') {
      sort = 'date';
    } else if (sort === 'helpfulness' || sort === 'relevant') {
      sort = 'helpfulness';
    } else {
      sort = 'No Sorting';
    }

    let queryString = `SELECT reviews.id AS review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, (SELECT COALESCE(json_agg(photos), '[]') FROM (SELECT id, url FROM photos WHERE review_id = reviews.id ORDER BY id ASC) photos) AS photos FROM reviews WHERE id IN (SELECT id FROM reviews WHERE product_id = ${productID} AND reported = 0 AND id > ${
      page * count
    }) ORDER BY ${sort} DESC LIMIT ${count} `;

    const results = await db.any(queryString);

    return { product: productID, page, count, results };
  },
  getMeta: async (productID) => {
    // Get the ratings totals
    let ratingsCount =
      'SELECT rating, COUNT(*) as count FROM reviews WHERE id IN (SELECT id FROM reviews WHERE reviews.product_id = $1) GROUP BY rating ORDER BY rating ASC';

    // Get the recommendation totals
    let recommendCount =
      'SELECT recommend, COUNT(*) as count FROM reviews WHERE id IN (SELECT id FROM reviews WHERE reviews.product_id = $1) GROUP BY recommend ORDER BY recommend ASC';

    // Get all characteristic data
    let charQuery =
      'SELECT c.id, name, SUM(value) as SUM, COUNT(value) as COUNT FROM characteristics c INNER JOIN characteristic_reviews cr ON c.id = cr.characteristic_id WHERE c.id IN (SELECT id FROM characteristics WHERE product_id = $1) GROUP BY c.id, name ORDER BY c.id ASC';

    const existsInCache = await existsAsync(productID);

    if (existsInCache === 1) {
      const cachedResponse = await getAsync(productID);
      return JSON.parse(cachedResponse);
    }

    // Get total count for ratings
    const dbRatingsCount = await db.any(ratingsCount, productID);
    const finalRatingsCount = {};
    dbRatingsCount.forEach((review) => {
      const { rating, count } = review;
      finalRatingsCount[rating] = Number(count);
    });

    // Get total count for reviews
    const dbRecommendCount = await db.any(recommendCount, productID);
    const finalRecommendCount = {};
    dbRecommendCount.forEach((review) => {
      const { recommend, count } = review;
      finalRecommendCount[recommend] = Number(count);
    });

    // Get all characteristic data
    const dbCharacteristics = await db.any(charQuery, productID);
    const finalCharacteristics = [];
    dbCharacteristics.forEach((char) => {
      const { id, name, sum, count } = char;
      finalCharacteristics.push({
        id,
        name,
        value: (Number(sum) / Number(count)).toFixed(4),
      });
    });

    const finalResultObj = {
      ratings: finalRatingsCount,
      recommended: finalRecommendCount,
      characteristics: finalCharacteristics,
    };

    await setAsync(productID, JSON.stringify(finalResultObj));

    return finalResultObj;
  },
  addReview: async (body, productID) => {
    let addReview =
      'INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';

    let addPhotos =
      'INSERT INTO photos(review_id, url) VALUES ($1, $2) RETURNING *';

    let addCharacteristics =
      'INSERT INTO characteristic_reviews(characteristic_id, review_id, value) VALUES($1, $2, $3) RETURNING *';

    const {
      rating,
      date,
      summary,
      body,
      recommend,
      name,
      email,
      photos,
      characteristics,
    } = body;

    const addedReview = await db.one(addReview, [
      productID,
      rating,
      date || new Date(),
      summary,
      body,
      recommend,
      0,
      name,
      email,
      '',
      0,
    ]);

    const reviewID = addedReview.id;

    const addPhotoPromises = photos
      ? photos.map(async (photo) => await db.any(addPhotos, [reviewID, photo]))
      : [];

    const addCharacteristicPromises = Object.entries(characteristics).map(
      async ([key, value]) => {
        await db.any(addCharacteristics, [key, reviewID, value]);
      }
    );

    return [addedReview, ...addPhotoPromises, ...addCharacteristicPromises];
  },
  setHelpful: (reviewID) => {
    return db.any(
      'UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = $1 RETURNING helpfulness',
      reviewID
    );
  },
  reportReview: (reviewID) => {
    return db.any(
      'UPDATE reviews SET reported = 1 WHERE id = $1 RETURNING reported',
      reviewID
    );
  },
};
