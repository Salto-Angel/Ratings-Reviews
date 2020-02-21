const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/reviews', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const photoSchema = mongoose.Schema({
  photo_id: Number,
  url: String
});
const reviewSchema = mongoose.Schema({
  product_id: Number,
  rating: Number,
  date: Date,
  summary: String,
  body: String,
  recommend: String,
  reported: Boolean,
  reviewer_name: String,
  reviewer_email: String,
  response: String,
  helpfulness: Number,
  photos: [photoSchema]
});

const charSchema = mongoose.Schema({
  characteristic_id: Number,
  review_id: Number,
  value: Number
});
const ratingsSchema = mongoose.Schema({
  product_id: Number,
  rating: Number,
  value: Number
});
const recommendedSchema = mongoose.Schema({
  product_id: Number,
  recommendation: Number,
  value: Number
});

const Reviews = mongoose.model('Reviews', reviewSchema);
const Characteristics = mongoose.model('Characteristics', charSchema);
const Ratings = mongoose.model('Ratings', ratingsSchema);
const Recommendations = mongoose.model('Recommendations', recommendedSchema);

module.exports = mongoose.connection;
