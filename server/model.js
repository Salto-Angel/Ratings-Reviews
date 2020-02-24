// const db = require('./database/mongo.js'); //Mongo
// const Reviews = db.base.models.Reviews;
// const Characteristics = db.base.models.Characteristics;
// const Ratings = db.base.models.Ratings;
// const Recommendations = db.base.models.Recommendations;
const db = require('./database/postgres.js'); //Postgres
db.any('select * from users').then(results => {
  console.log(results);
});
module.exports = {
  getReviewsList: (productID, page, count, sort) => {
    return Reviews.find().exec();
    // SELECT * from reviews LEFT JOIN photos ON reviews.id = photos.review_id
  },
  getMeta: productID => {},
  addReview: body => {
    return Reviews.create(body);
  },
  setHelpful: reviewID => {
    // UPDATE reviews SET helpful = helpful + 1 WHERE review_id = reviewID
  },
  reportReview: reviewID => {
    // UPDATE reviews SET reported = 1 WHERE review_id = reviewID
  }
};
