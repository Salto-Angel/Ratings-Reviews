const db = require('./database/mongo.js'); //Mongo
const Reviews = db.base.models.Reviews;
const Characteristics = db.base.models.Characteristics;
const Ratings = db.base.models.Ratings;
const Recommendations = db.base.models.Recommendations;
// const db = require('./database/sql.js'); //Postgres

module.exports = {
  getReviewsList: (productID, page, count, sort) => {
    return Reviews.find().exec();
  },
  getMeta: productID => {},
  addReview: body => {
    return Reviews.create(body);
  },
  setHelpful: reviewID => {},
  reportReview: reviewID => {}
};
