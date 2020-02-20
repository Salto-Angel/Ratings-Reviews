const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/reviews', { useNewUrlParser: true });

const photoSchema = mongoose.Schema({
  photo_id: Number,
  url: String
});
const reviewSchema = mongoose.Schema({
  product_id: Number,
  rating: Number,
  summary: String,
  recommend: Number,
  response: String,
  body: String,
  date: Date,
  reviewer_name: String,
  helpfulness: Number,
  reported: Boolean,
  photos: [photoSchema]
});

const charSchema = mongoose.Schema({
  product_id: Number,
  characteristic: String,
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
