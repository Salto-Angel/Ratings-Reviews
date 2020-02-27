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
describe('GET meta data', () => {
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
describe('POST a review', () => {
  let reviewBody = {
    rating: 3,
    summary: 'This is another summary',
    body: 'This is another body',
    recommend: 0,
    name: 'William',
    email: 'William@William.com',
    photos: ['www.photo.com', 'www.photo2.com'],
    characteristics: { '6': 2, '7': 3, '8': 1, '9': 2, '10': 4 }
  };
  it('should create a new review', () => {
    return request(app)
      .post('/reviews/1/')
      .send(reviewBody)
      .then(res => {
        expect(res.statusCode).toBe(201);
        expect(res.body[7].reviewer_name).toBe('William');
      });
  });
  it('should create corresponding photos', () => {
    return request(app)
      .post('/reviews/1/')
      .send(reviewBody)
      .then(res => {
        expect(res.body[0][0].url).toBe('www.photo.com');
        expect(res.body[1][0].url).toBe('www.photo2.com');
      });
  });
  it('should create corresponding characteristics', () => {
    return request(app)
      .post('/reviews/1/')
      .send(reviewBody)
      .then(res => {
        expect(res.body[2][0].value).toBe(2);
        expect(res.body[3][0].characteristic_id).toBe(7);
      });
  });
});

// Update a review's helpfulness
describe('PUT helpfulness', () => {
  it("should increment the review's helpfulness", () => {
    let reviewBody = {
      rating: 3,
      summary: 'This is another summary',
      body: 'This is another body',
      recommend: 0,
      name: 'William',
      email: 'William@William.com',
      photos: ['www.photo.com', 'www.photo2.com'],
      characteristics: { '6': 2, '7': 3, '8': 1, '9': 2, '10': 4 }
    };
    return request(app)
      .post('/reviews/1/')
      .send(reviewBody)
      .then(res => {
        return request(app)
          .put(`/reviews/helpful/${res.body[7].id}`)
          .then(response => {
            expect(response.body[0].helpfulness).toBe(
              res.body[7].helpfulness + 1
            );
          });
      });
  });
});

// Report a review
describe('PUT reported', () => {
  it('should report the review', () => {
    let reviewBody = {
      rating: 3,
      summary: 'This is another summary',
      body: 'This is another body',
      recommend: 0,
      name: 'William',
      email: 'William@William.com',
      photos: ['www.photo.com', 'www.photo2.com'],
      characteristics: { '6': 2, '7': 3, '8': 1, '9': 2, '10': 4 }
    };
    return request(app)
      .post('/reviews/1/')
      .send(reviewBody)
      .then(res => {
        return request(app)
          .put(`/reviews/report/${res.body[7].id}`)
          .then(response => {
            expect(response.body[0].reported).toBe(1);
          });
      });
  });

  it('should not return a reported review', () => {
    let reviewBody = {
      rating: 3,
      summary: 'This is another summary',
      body: 'This is another body',
      recommend: 0,
      name: 'William',
      email: 'William@William.com',
      photos: ['www.photo.com', 'www.photo2.com'],
      characteristics: { '6': 2, '7': 3, '8': 1, '9': 2, '10': 4 }
    };
    return request(app)
      .post('/reviews/1/')
      .send(reviewBody)
      .then(res => {
        return request(app)
          .put(`/reviews/report/${res.body[7].id}`)
          .then(() => {
            request(app)
              .get('/reviews/1/list')
              .then(data => {
                // expect(true).toBe(true);
                expect(data.body.results.length).toBe(0);
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log('pls'));
      })
      .catch(err => console.log('why'));
  });
});
