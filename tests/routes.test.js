const request = require('supertest');
const app = require('../server/index');

describe('GET reviews list', () => {
  it('should get a list of reviews', async () => {
    const res = await request(app).get('/reviews/2/list');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('results');
  });
});
