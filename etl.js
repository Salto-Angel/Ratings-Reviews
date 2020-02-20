const fs = require('fs');
const etl = require('etl');

// characteristics
let count1 = 0;
fs.createReadStream('./data/characteristics.csv')
  .pipe(etl.csv())
  .on('data', chunk => {
    if (count1 < 4) {
      console.log(chunk);
      count1++;
    }
  });

// characteristic_reviews
let count2 = 0;
fs.createReadStream('./data/characteristic_reviews.csv')
  .pipe(etl.csv())
  .on('data', chunk => {
    if (count2 < 4) {
      console.log(chunk);
      count2++;
    }
  });

// reviews
let count3 = 0;
fs.createReadStream('./data/reviews.csv')
  .pipe(etl.csv())
  .on('data', chunk => {
    if (count3 < 4) {
      console.log(chunk);
      count3++;
    }
  });

// review_photos
let count4 = 0;
fs.createReadStream('./data/reviews_photos.csv')
  .pipe(etl.csv())
  .on('data', chunk => {
    if (count4 < 4) {
      console.log(chunk);
      count4++;
    }
  });
