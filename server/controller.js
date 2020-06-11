const model = require('./model.js');

module.exports = {
  getReviewsList: async (req, res) => {
    try {
      const productID = req.params.product_id;
      const { page = 0, count = 5, sort = 'helpfulness' } = req.query;
      const reviewsList = await model.getReviewsList(
        productID,
        page,
        count,
        sort
      );
      res.json(reviewsList);
    } catch (error) {
      res.sendStatus(500);
    }
  },
  getMeta: async (req, res) => {
    try {
      const productID = req.params.product_id;
      const finalMetaObj = await model.getMeta(productID);
      res.json(finalMetaObj);
    } catch (error) {
      res.sendStatus(500);
    }
  },
  addReview: async (req, res) => {
    try {
      const productID = req.params.product_id;
      const addedReview = await model.addReview(req.body, productID);
      res.status(201).json(addedReview);
    } catch (error) {
      res.sendStatus(400);
    }
  },
  setHelpful: (req, res) => {
    try {
      const reviewID = req.params.review_id;

      const updatedReview = model.setHelpful(reviewID);
      res.status(201).json(updatedReview);
    } catch (error) {
      res.sendStatus(500);
    }
  },
  reportReview: (req, res) => {
    try {
      const reviewID = req.params.review_id;
      const updatedReview = model.reportReview(reviewID);
      res.status(201).json(updatedReview);
    } catch (error) {
      res.sendStatus(500);
    }
  },
};
