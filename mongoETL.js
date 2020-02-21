const fs = require('fs');
const etl = require('etl');
const db = require('./server/database/mongo');

var characteristics = db.then(function(db) {
  return db.collection('characteristics');
});
var characteristic_reviews = db.then(function(db) {
  return db.collection('characteristic_reviews');
});
var reviews = db.then(function(db) {
  return db.collection('reviews');
});
var reviews_photos = db.then(function(db) {
  return db.collection('reviews_photos');
});

// characteristics
fs.createReadStream('./data/characteristics.csv')
  .pipe(etl.csv())
  .pipe(
    etl.map(function(obj) {
      this.push({
        id: Number(obj.id),
        product_id: Number(obj.product_id),
        name: obj.name
      });
    })
  )
  .pipe(etl.collect(1000))
  .pipe(etl.mongo.insert(characteristics));

// // characteristic_reviews
fs.createReadStream('./data/characteristic_reviews.csv')
  .pipe(etl.csv())
  .pipe(
    etl.map(function(obj) {
      this.push({
        id: Number(obj.id),
        characteristic_id: Number(obj.characteristic_id),
        review_id: Number(obj.review_id),
        value: Number(obj.value)
      });
    })
  )
  .pipe(etl.collect(1000))
  .pipe(etl.mongo.insert(characteristic_reviews));

// // reviews
fs.createReadStream('./data/reviews.csv')
  .pipe(etl.csv())
  .pipe(
    etl.map(function(obj) {
      this.push({
        id: Number(obj.id),
        product_id: Number(obj.product_id),
        rating: Number(obj.rating),
        date: obj.date,
        summary: obj.summary,
        body: obj.body,
        recommend: obj.recommend === 'true' ? 1 : 0,
        reported: obj.reported === 'true' ? 1 : 0,
        reviewer_name: obj.reviewer_name,
        reviewer_email: obj.reviewer_email,
        response: obj.response,
        helpfulness: Number(obj.helpfulness)
      });
    })
  )
  .pipe(etl.collect(1000))
  .pipe(etl.mongo.insert(reviews));

// // review_photos
fs.createReadStream('./data/reviews_photos.csv')
  .pipe(etl.csv())
  .pipe(
    etl.map(function(obj) {
      this.push({
        id: Number(obj.id),
        review_id: Number(obj.review_id),
        url: obj.url
      });
    })
  )
  .pipe(etl.collect(1000))
  .pipe(etl.mongo.insert(reviews_photos));
