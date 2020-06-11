const request = require('supertest');
const app = require('../server/index');
const db = require('../server/database/postgres');

// Set up build/teardown processes
beforeAll(() => {
  // Create the requisite tables in reviews_test
  return Promise.all([
    // For each table, create the table then create the requisite indexes
    // REVIEWS
    db
      .query(
        'CREATE TABLE reviews (id SERIAL PRIMARY KEY, product_id INT NOT NULL,rating INT NOT NULL,date DATE NOT NULL,summary VARCHAR(555) NOT NULL,body VARCHAR(555) NOT NULL,recommend INT NOT NULL,reported INT NOT NULL,reviewer_name VARCHAR(255) NOT NULL,reviewer_email VARCHAR(255) NOT NULL,response VARCHAR(555) NOT NULL,helpfulness INT NOT NULL)'
      )
      .then(() => {
        db.query('CREATE INDEX product_index ON reviews(product_id)');
      }),

    // PHOTOS
    db
      .query(
        'CREATE TABLE photos (id SERIAL PRIMARY KEY,review_id INT REFERENCES reviews(id) NOT NULL,url VARCHAR(255) NOT NULL)'
      )
      .then(() => {
        db.query('CREATE INDEX photos_index ON photos(review_id)');
      }),

    // CHARACTERISTICS
    db
      .query(
        'CREATE TABLE characteristics (id SERIAL PRIMARY KEY, product_id INT NOT NULL, name VARCHAR(30) NOT NULL )'
      )
      .then(() => {
        db.query('CREATE INDEX char_index ON characteristics(product_id)');
      }),

    // CHARACTERISTIC REVIEWS
    db
      .query(
        'CREATE TABLE characteristic_reviews (id SERIAL PRIMARY KEY,characteristic_id INT NOT NULL, review_id INT NOT NULL, value INT NOT NULL)'
      )
      .then(() => {
        Promise.all([
          db.query(
            'CREATE INDEX char_reviews_index ON characteristic_reviews(characteristic_id)'
          ),
          db.query(
            'CREATE INDEX char_reviews_reviews ON characteristic_reviews(review_id)'
          ),
        ]);
      }),
  ]).then(() => {
    db.end();
  });
});

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
          0,
        ]
      )
      .then((results) => {
        db.query('INSERT INTO photos(review_id, url) VALUES ($1, $2)', [
          results[0].id,
          'www.photos.com',
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
      ),
    ]),
  ]);
});

afterEach(() => {
  return Promise.all([
    db.query('DELETE FROM photos'),
    db.query('DELETE FROM characteristic_reviews'),
    db.query('DELETE FROM characteristics'),
    db.query('DELETE FROM reviews'),
  ]);
});

afterAll(() => {
  return Promise.all([
    db.query('DROP TABLE photos'),
    db.query('DROP TABLE characteristics'),
    db.query('DROP TABLE characteristic_reviews'),
    db.query('DROP TABLE reviews'),
  ]).then(() => {
    db.end();
  });
});

// Get a list of reviews for a product
describe('GET reviews list', () => {
  it('should return results', async () => {
    let response = await request(app).get('/reviews/1/list');
    expect(response.statusCode).toBe(200);
  });
  it('should return the correct product_id', async () => {
    let response = await request(app).get('/reviews/1/list');

    expect(response.body).toHaveProperty('product');
    expect(response.body.product).toBe('1');
  });
  it('should return the correct page number', async () => {
    let response = await request(app).get('/reviews/1/list');

    expect(response.body).toHaveProperty('page');
    expect(response.body.page).toBe(0);
  });
  it('should return the correct result count', async () => {
    let response = await request(app).get('/reviews/1/list');

    expect(response.body).toHaveProperty('count');
    expect(response.body.count).toBe(5);
  });
  it('should return an array of reviews', async () => {
    let response = await request(app).get('/reviews/1/list');

    expect(response.body).toHaveProperty('results');
    expect(Array.isArray(response.body.results)).toBe(true);
  });
  it('should display an empty array if there are no reviews', async () => {
    let response = await request(app).get('/reviews/-1/list');

    expect(response.body.results.length).toBe(0);
  });
  it('should display the correct review properties, if there are any reviews', async () => {
    let response = await request(app).get('/reviews/1/list');
    expect(response.body.results[0]).toEqual(
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
        photos: expect.any(Array),
      })
    );
  });
});

// Get the metadata for all the reviews for a product
describe('GET meta data', () => {
  it('should return results', async () => {
    let response = await request(app).get('/reviews/1/meta');

    expect(response.statusCode).toBe(200);
  });
  it('should return the three requisite characteristics', async () => {
    let response = await request(app).get('/reviews/1/meta');

    expect(response.body).toEqual(
      expect.objectContaining({
        ratings: expect.any(Object),
        recommended: expect.any(Object),
        characteristics: expect.any(Object),
      })
    );
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
      characteristics: { '6': 2, '7': 3, '8': 1, '9': 2, '10': 4 },
    };
    it('should create a new review', async () => {
      let response = await request(app).post('/reviews/1/').send(reviewBody);

      expect(response.statusCode).toBe(201);
      expect(response.body[0].reviewer_name).toBe('William');
    });
    it('should create corresponding photos', async () => {
      let response = await request(app).post('/reviews/1/').send(reviewBody);

      expect(response.body[1][0].url).toBe('www.photo.com');
      expect(response.body[2][0].url).toBe('www.photo2.com');
    });
    it('should create corresponding characteristics', async () => {
      let response = await request(app).post('/reviews/1/').send(reviewBody);

      expect(response.body[3][0].value).toBe(2);
      expect(response.body[4][0].characteristic_id).toBe(7);
    });

    it('should return status code 400 if incorrect body is provided', async () => {
      let incompleteBody = {
        name: 'Will',
      };
      let response = await request(app)
        .post('/reviews/1/')
        .send(incompleteBody);
      expect(response.statusCode).toEqual(400);
    });
  });

  // Update a review's helpfulness
  describe('PUT helpfulness', () => {
    it("should increment the review's helpfulness", async () => {
      let reviewBody = {
        rating: 3,
        summary: 'This is another summary',
        body: 'This is another body',
        recommend: 0,
        name: 'William',
        email: 'William@William.com',
        photos: ['www.photo.com', 'www.photo2.com'],
        characteristics: { '6': 2, '7': 3, '8': 1, '9': 2, '10': 4 },
      };

      // Post a new review
      let postReview = await request(app).post('/reviews/1/').send(reviewBody);

      // Update that review's helpfulness
      let updateHelpful = await request(app).put(
        `/reviews/helpful/${postReview.body[0].id}`
      );

      // Check that this update is reflected
      expect(updateHelpful.body[0].helpfulness).toBe(
        postReview.body[0].helpfulness + 1
      );
    });
  });

  // Report a review
  describe('PUT reported', () => {
    it('should report the review', async () => {
      let reviewBody = {
        rating: 3,
        summary: 'This is another summary',
        body: 'This is another body',
        recommend: 0,
        name: 'William',
        email: 'William@William.com',
        photos: ['www.photo.com', 'www.photo2.com'],
        characteristics: { '6': 2, '7': 3, '8': 1, '9': 2, '10': 4 },
      };

      // Post a new review
      let postReview = await request(app).post('/reviews/1/').send(reviewBody);

      // Update that review's helpfulness
      let reportReview = await request(app).put(
        `/reviews/report/${postReview.body[0].id}`
      );

      // Check that this update is reflected
      expect(reportReview.body[0].reported).toBe(1);
    });

    it('should not return a reported review', async () => {
      let reviewBody = {
        rating: 3,
        summary: 'This is another summary',
        body: 'This is another body',
        recommend: 0,
        name: 'William',
        email: 'William@William.com',
        photos: ['www.photo.com', 'www.photo2.com'],
        characteristics: { '6': 2, '7': 3, '8': 1, '9': 2, '10': 4 },
      };

      // Post a new review
      let postReview = await request(app).post('/reviews/1/').send(reviewBody);

      // Update that review's helpfulness
      let reportReview = await request(app).put(
        `/reviews/report/${postReview.body[0].id}`
      );

      // Retrieve all reviews
      let getReviews = await request(app).get('/reviews/1/list');

      // Make sure the recently reported review is not present
      expect(getReviews.body.results.length).toBe(1);
    });
  });
});
