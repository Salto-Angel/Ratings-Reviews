const model = require('./model.js');

module.exports = {
  getReviewsList: (req, res) => {
    const productID = req.params.product_id;
    const { page = 1, count = 5, sort } = req.query;
    model
      .getReviewsList(productID, page, count, sort)
      .then(reviews => {
        let resultObj = {
          product: productID,
          page: page,
          count: count,
          results: reviews
        };
        res.json(resultObj);
      })
      .catch(err => {
        console.log(err, `Error getting reviews in server for ${productID}`);
      });
  },
  getMeta: (req, res) => {
    const productID = req.params.product_id;
    model
      .getMeta(productID)
      .then(meta => {
        res.json(meta);
      })
      .catch(err => {
        console.log(err, `Error getting meta in server for ${productID}`);
      });
  },
  addReview: (req, res) => {
    const productID = req.params.product_id;
    model
      .addReview(req.body)
      .then(() => res.sendStatus(201))
      .catch(err => {
        console.log(err, `Error adding review in server for ${productID}`);
      });
  },
  setHelpful: (req, res) => {
    const reviewID = req.params.review_id;
    model
      .setHelpful(reviewID)
      .then(() => res.sendStatus(204))
      .catch(err => {
        console.log(
          err,
          `Error updating helpfulness in server for ${reviewID}`
        );
      });
  },
  reportReview: (req, res) => {
    const reviewID = req.params.review_id;
    model
      .reportReview(reviewID)
      .then(() => res.sendStatus(204))
      .catch(err => {
        console.log(err, `Error reporting review in server for ${reviewID}`);
      });
  }
};
