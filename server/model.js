const db = require('./database/postgres.js'); //Postgres
module.exports = {
  getReviewsList: (productID, page, count, sort) => {
    // CHONKY VERSION
    let queryString = `SELECT reviews.id AS review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, (SELECT COALESCE(json_agg(photos), '[]') FROM (SELECT id, url FROM photos WHERE review_id = reviews.id ORDER BY id ASC) photos) AS photos FROM reviews WHERE id IN (SELECT id FROM reviews WHERE product_id = ${productID} AND reported = 0) ORDER BY ${sort} DESC LIMIT ${count} OFFSET ${page *
      count}`;
    return db.any(queryString);
  },
  getMeta: productID => {
    let ratingsCount =
      'SELECT rating, COUNT(*) as count FROM reviews WHERE id IN (SELECT id FROM reviews WHERE reviews.product_id = $1) GROUP BY rating ORDER BY rating ASC';
    let recommendCount =
      'SELECT recommend, COUNT(*) as count FROM reviews WHERE id IN (SELECT id FROM reviews WHERE reviews.product_id = $1) GROUP BY recommend ORDER BY recommend ASC';
    let charQuery =
      'SELECT c.id, name, SUM(value) as SUM, COUNT(value) as COUNT FROM characteristics c INNER JOIN characteristic_reviews cr ON c.id = cr.characteristic_id WHERE c.id IN (SELECT id FROM characteristics WHERE product_id = $1) GROUP BY c.id, name ORDER BY c.id ASC';

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
      // .then(meta => {
      //   let returnObj = {};
      //   meta.forEach(recommend => {
      //     returnObj[recommend.recommend] = Number(recommend.count);
      //   });
      //   return returnObj;
      // })
    ]);
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
