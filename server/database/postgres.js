const promise = require('bluebird');
const options = { promiseLib: promise };
const pgp = require('pg-promise')(options);

const connection = {
  host: 'localhost',
  port: 5432,
  database: 'reviews',
  user: 'postgres',
  password: 'password'
};
const db = pgp(connection);

module.exports = db;
