const model = require('./model.js');

module.exports = {
  getReviewsList: (req, res) => {
    const productID = req.params.product_id;
    const { page = 0, count = 5, sort = 'helpfulness' } = req.query;
    console.log('Volume Test');
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
      .catch(() => {
        res.sendStatus(500);
      });
  },
  getMeta: (req, res) => {
    const productID = req.params.product_id;
    model
      .getMeta(productID)
      .then(results => {
        let finalObj = {
          ratings: results[0],
          recommended: results[1],
          characteristics: results[2]
        };
        res.json(finalObj);
      })
      .catch(() => {
        res.sendStatus(500);
      });
  },
  addReview: (req, res) => {
    const productID = req.params.product_id;
    model
      .addReview(req.body, productID)
      .then(result => {
        res.status(201).json(result);
      })
      .catch(() => {
        res.sendStatus(400);
      });
  },
  setHelpful: (req, res) => {
    const reviewID = req.params.review_id;
    model
      .setHelpful(reviewID)
      .then(result => {
        res.status(201).json(result);
      })
      .catch(() => {
        res.sendStatus(500);
      });
  },
  reportReview: (req, res) => {
    const reviewID = req.params.review_id;
    model
      .reportReview(reviewID)
      .then(result => res.status(201).json(result))
      .catch(() => {
        res.sendStatus(500);
      });
  }
};
