const db = require('./database/postgres.js'); //Postgres
module.exports = {
  getReviewsList: (productID, page, count, sort) => {
    // CHONKY VERSION
    let queryString =
      "SELECT reviews.id AS review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, (SELECT COALESCE(json_agg(photos), '[]') FROM (SELECT id, url FROM photos WHERE review_id = reviews.id ORDER BY id ASC) photos) AS photos FROM reviews WHERE id IN (SELECT id FROM reviews WHERE product_id = $1 AND reported = 0) LIMIT $4";
    return db.any(queryString, [productID, count * page, sort, count]);
  },
  getMeta: productID => {
    let ratingsCount =
      'SELECT rating, coalesce(COUNT(*), 0) as count FROM reviews WHERE id IN (SELECT id FROM reviews WHERE reviews.product_id = $1) GROUP BY rating ORDER BY rating ASC';
    let recommendCount = '';
    let charQuery = '';

    let queryString =
      "SELECT (SELECT COALESCE(json_agg(photos), '[]') FROM (SELECT id, url FROM photos WHERE review_id = reviews.id ORDER BY id ASC) photos) AS photos, (SELECT COALESCE(json_agg(photos), '[]') FROM (SELECT id, url FROM photos WHERE review_id = reviews.id ORDER BY id ASC) photos) AS photos, (SELECT COALESCE(json_agg(photos), '[]') FROM (SELECT id, url FROM photos WHERE review_id = reviews.id ORDER BY id ASC) photos) AS photos FROM reviews WHERE id IN (SELECT id FROM reviews WHERE reviews.product_id = $1) LIMIT $4";
    return db.any(ratingsCount, productID);
  },
  addReview: body => {
    let queryString = '';
    return db.none(queryString);
  },
  setHelpful: reviewID => {
    // UPDATE reviews SET helpful = helpful + 1 WHERE review_id = reviewID
    return db.none(
      'UPDATE reviews SET helpful = helpful + 1 WHERE review_id = $1',
      reviewID
    );
  },
  reportReview: reviewID => {
    // UPDATE reviews SET reported = 1 WHERE review_id = reviewID
    return db.none(
      'UPDATE reviews SET reported = 1 WHERE review_id = $1',
      reviewID
    );
  }
};
