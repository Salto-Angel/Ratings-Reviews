const model = require('./model.js');

module.exports = {
  getReviewsList: (req, res) => {
    model.getReviewsList();
  },
  getMeta: (req, res) => {
    model.getMeta();
  },
  addReview: (req, res) => {
    model.addReview();
  },
  setHelpful: (req, res) => {
    model.setHelpful;
  },
  reportReview: (req, res) => {
    model.reportReview();
  }
};
