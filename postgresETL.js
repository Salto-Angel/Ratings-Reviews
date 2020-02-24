const fs = require('fs');
const etl = require('etl');
const db = require('./server/database/postgres');

const pool = db.$pool;
console.log(db, pool);

// characteristics
// fs.createReadStream('./data/characteristics.csv')
//   .pipe(etl.csv())
//   .pipe(etl.postgres.upsert(pool, 'public', 'characteristics'));

// // characteristic_reviews
// fs.createReadStream('./data/characteristic_reviews.csv')
//   .pipe(etl.csv())
//   .pipe(etl.postgres.upsert(pool, 'public', 'characteristic_reviews'));

// // reviews
// fs.createReadStream('./data/reviews.csv')
//   .pipe(etl.csv())
//   .pipe(
//     etl.map(function(obj) {
//       this.push({
//         id: Number(obj.id),
//         product_id: Number(obj.product_id),
//         rating: Number(obj.rating),
//         date: obj.date,
//         summary: obj.summary,
//         body: obj.body,
//         recommend: obj.recommend === 'true' ? 1 : 0,
//         reported: obj.reported === 'true' ? 1 : 0,
//         reviewer_name: obj.reviewer_name,
//         reviewer_email: obj.reviewer_email,
//         response: obj.response,
//         helpfulness: Number(obj.helpfulness)
//       });
//     })
//   )
//   .pipe(etl.postgres.upsert(pool, 'public', 'reviews'));

// // review_photos
fs.createReadStream('./data/reviews_photos.csv')
  .pipe(etl.csv())
  .pipe(etl.postgres.upsert(pool, 'public', 'photos'));
