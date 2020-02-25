DROP DATABASE IF EXISTS reviews;

CREATE DATABASE reviews;

\c reviews;

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INT,
  rating INT,
  date DATE,
  summary VARCHAR(555),
  body VARCHAR(555),
  recommend INT,
  reported INT,
  reviewer_name VARCHAR(255),
  reviewer_email VARCHAR(255),
  response VARCHAR(555),
  helpfulness INT
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  review_id INT REFERENCES reviews(id),
  url VARCHAR(255)
);

CREATE TABLE characteristics (
  id SERIAL PRIMARY KEY,
  product_id INT,
  name VARCHAR(30)
);

CREATE TABLE characteristic_reviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INT,
  review_id INT,
  value INT
);