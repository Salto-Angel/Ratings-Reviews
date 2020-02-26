const promise = require('bluebird');
const options = { promiseLib: promise };
const pgp = require('pg-promise')(options);

const isProduction = process.env.NODE_ENV === 'production';

const connection = {
  host: process.env.HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};
const db = pgp(isProduction ? process.env.DATABASE_URL : connection);

module.exports = db;
