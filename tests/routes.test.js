const request = require('supertest');
const app = require('../server/index');
const db = require('../server/database/postgres');

// Set up build/teardown processes
// beforeAll(() => {
//   // Create the requisite tables in reviews_test
//   return Promise.all([
//     // For each table, create the table then create the requisite indexes
//     // REVIEWS
//     db
//       .query(
//         'CREATE TABLE reviews (id SERIAL PRIMARY KEY, product_id INT NOT NULL,rating INT NOT NULL,date DATE NOT NULL,summary VARCHAR(555) NOT NULL,body VARCHAR(555) NOT NULL,recommend INT NOT NULL,reported INT NOT NULL,reviewer_name VARCHAR(255) NOT NULL,reviewer_email VARCHAR(255) NOT NULL,response VARCHAR(555) NOT NULL,helpfulness INT NOT NULL)'
//       )
//       .then(() => {
//         db.query('CREATE INDEX product_index ON reviews(product_id)');
//       }),

//     // PHOTOS
//     db
//       .query(
//         'CREATE TABLE photos (id SERIAL PRIMARY KEY,review_id INT REFERENCES reviews(id) NOT NULL,url VARCHAR(255) NOT NULL)'
//       )
//       .then(() => {
//         db.query('CREATE INDEX photos_index ON photos(review_id)');
//       }),

//     // CHARACTERISTICS
//     db
//       .query(
//         'CREATE TABLE characteristics (id SERIAL PRIMARY KEY, product_id INT NOT NULL, name VARCHAR(30) NOT NULL )'
//       )
//       .then(() => {
//         db.query('CREATE INDEX char_index ON characteristics(product_id)');
//       }),

//     // CHARACTERISTIC REVIEWS
//     db
//       .query(
//         'CREATE TABLE characteristic_reviews (id SERIAL PRIMARY KEY,characteristic_id INT NOT NULL, review_id INT NOT NULL, value INT NOT NULL)'
//       )
//       .then(() => {
//         Promise.all([
//           db.query(
//             'CREATE INDEX char_reviews_index ON characteristic_reviews(characteristic_id)'
//           ),
//           db.query(
//             'CREATE INDEX char_reviews_reviews ON characteristic_reviews(review_id)'
//           )
//         ]);
//       })
//   ]).then(() => {
//     db.end();
//   });
// });

beforeEach(() => {
  // Add a few reviews
  return Promise.all([
    db
      .query(
        'INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
        [
          1,
          1,
          new Date(),
          'This is a summary',
          'This is the body',
          0,
          0,
          'Will',
          'Will@Will.com',
          '',
          0
        ]
      )
      .then(results => {
        db.query('INSERT INTO photos(review_id, url) VALUES ($1, $2)', [
          results[0].id,
          'www.photos.com'
        ]);
      }),
    Promise.all([
      db.query(
        'INSERT INTO characteristic_reviews(characteristic_id, review_id, value) VALUES(1, 1, 2)'
      ),
      db.query(
        'INSERT INTO characteristic_reviews(characteristic_id, review_id, value) VALUES(2, 1, 1)'
      ),
      db.query(
        'INSERT INTO characteristic_reviews(characteristic_id, review_id, value) VALUES(3, 1, 5)'
      ),
      db.query(
        'INSERT INTO characteristic_reviews(characteristic_id, review_id, value) VALUES(4, 1, 3)'
      )
    ])
  ]);
});

afterEach(() => {
  return Promise.all([
    db.query('DELETE FROM photos'),
    db.query('DELETE FROM characteristic_reviews'),
    db.query('DELETE FROM characteristics'),
    db.query('DELETE FROM reviews')
  ]);
});

// afterAll(() => {
//   return Promise.all([
//     db.query('DROP TABLE photos'),
//     db.query('DROP TABLE characteristics'),
//     db.query('DROP TABLE characteristic_reviews'),
//     db.query('DROP TABLE reviews')
//   ]).then(() => {
//     db.end();
//   });
// });

// Get a list of reviews for a product
describe('GET reviews list', () => {
  it('should return results', () => {
    return request(app)
      .get('/reviews/1/list')
      .then(res => {
        expect(res.statusCode).toBe(200);
      });
  });
  it('should return the correct product_id', () => {
    return request(app)
      .get('/reviews/1/list')
      .then(res => {
        expect(res.body).toHaveProperty('product');
        expect(res.body.product).toBe('1');
      });
  });
  it('should return the correct page number', () => {
    return request(app)
      .get('/reviews/1/list')
      .then(res => {
        expect(res.body).toHaveProperty('page');
        expect(res.body.page).toBe(0);
      });
  });
  it('should return the correct result count', () => {
    return request(app)
      .get('/reviews/1/list')
      .then(res => {
        expect(res.body).toHaveProperty('count');
        expect(res.body.count).toBe(5);
      });
  });
  it('should return an array of reviews', () => {
    return request(app)
      .get('/reviews/1/list')
      .then(res => {
        expect(res.body).toHaveProperty('results');
        expect(Array.isArray(res.body.results)).toBe(true);
      });
  });
  it('should display an empty array if there are no reviews', () => {
    return request(app)
      .get('/reviews/3/list')
      .then(res => {
        expect(res.body.results.length).toBe(0);
      });
  });
  it('should display the correct review properties, if there are any reviews', () => {
    return request(app)
      .get('/reviews/1/list')
      .then(res => {
        expect(res.body.results[0]).toEqual(
          expect.objectContaining({
            review_id: expect.any(Number),
            rating: expect.any(Number),
            summary: expect.any(String),
            recommend: expect.any(Number),
            response: expect.any(String),
            body: expect.any(String),
            date: expect.any(String),
            reviewer_name: expect.any(String),
            helpfulness: expect.any(Number),
            photos: expect.any(Array)
          })
        );
      });
  });
});

// Get the metadata for all the reviews for a product
xdescribe('GET meta data', () => {
  it('should return results', () => {
    return request(app)
      .get('/reviews/1/meta')
      .then(res => {
        expect(res.statusCode).toBe(200);
      });
  });
  it('should return the three requisite characteristics', () => {
    return request(app)
      .get('/reviews/1/meta')
      .then(res => {
        expect(res.body).toEqual(
          expect.objectContaining({
            ratings: expect.any(Object),
            recommended: expect.any(Object),
            characteristics: expect.any(Object)
          })
        );
      });
  });
});

// Add a review
describe('POST a review', () => {});

// Update a review's helpfulness
describe('PUT helpfulness', () => {});

// Report a review
describe('POST reported', () => {});
