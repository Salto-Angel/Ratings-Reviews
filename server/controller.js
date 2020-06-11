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
    // .then(results => {
    //   let finalObj = {
    //     ratings: results[0],
    //     recommended: results[1],
    //     characteristics: results[2]
    //   };
    //   res.json(finalObj);
    // })
  },
  addReview: async (req, res) => {
    try {
      const productID = req.params.product_id;
      const addedReview = await model.addReview(req.body, productID);
      res.status(201).json(addedReview);
    } catch (error) {
      res.sendStatus(400);
    }
    // .then((result) => {
    //   res.status(201).json(result);
    // })
  },
  setHelpful: (req, res) => {
    try {
      const reviewID = req.params.review_id;

      const updatedReview = model.setHelpful(reviewID);
      res.status(201).json(updatedReview);
    } catch (error) {
      res.sendStatus(500);
    }

    // .then((result) => {
    //   res.status(201).json(result);
    // })
  },
  reportReview: (req, res) => {
    try {
      const reviewID = req.params.review_id;
      const updatedReview = model.reportReview(reviewID);
      res.status(201).json(updatedReview);
    } catch (error) {
      res.sendStatus(500);
    }
    // .then((result) => res.status(201).json(result))
  },
};
