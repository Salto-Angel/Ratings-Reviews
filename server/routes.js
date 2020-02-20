const controllers = require('./controller.js');
const router = require('express').Router();

router.get('/:product_id/list', controllers.getReviewsList);
router.get('/:product_id/meta', controllers.getMeta);
router.post('/:product_id', controllers.addReview);
router.put('/helpful/:review_id', controllers.setHelpful);
router.put('/report/:review_id', controllers.reportReview);

module.exports = router;
