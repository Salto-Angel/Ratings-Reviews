const request = require('supertest');
const app = require('../server/index');

// Get a list of reviews for a product
describe('GET reviews list', () => {
  it('should return results', () => {
    return request(app)
      .get('/reviews/2/list')
      .then(res => {
        expect(res.statusCode).toBe(200);
      });
  });
  it('should return the correct product_id', () => {
    return request(app)
      .get('/reviews/2/list')
      .then(res => {
        expect(res.body).toHaveProperty('product');
        expect(res.body.product).toBe('2');
      });
  });
  it('should return the correct page number', () => {
    return request(app)
      .get('/reviews/2/list')
      .then(res => {
        expect(res.body).toHaveProperty('page');
        expect(res.body.page).toBe(0);
      });
  });
  it('should return the correct result count', () => {
    return request(app)
      .get('/reviews/2/list')
      .then(res => {
        expect(res.body).toHaveProperty('count');
        expect(res.body.count).toBe(5);
      });
  });
  it('should return an array of reviews', () => {
    return request(app)
      .get('/reviews/2/list')
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
      .get('/reviews/2/list')
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
      .get('/reviews/2/meta')
      .then(res => {
        expect(res.statusCode).toBe(200);
      });
  });
  it('should return the three requisite characteristics', () => {
    return request(app)
      .get('/reviews/2/meta')
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
