DROP DATABASE IF EXISTS reviews;

CREATE DATABASE reviews;

\c reviews;

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  rating INT NOT NULL,
  date DATE NOT NULL,
  summary VARCHAR(555) NOT NULL,
  body VARCHAR(555) NOT NULL,
  recommend INT NOT NULL,
  reported INT NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  reviewer_email VARCHAR(255) NOT NULL,
  response VARCHAR(555) NOT NULL,
  helpfulness INT NOT NULL
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  review_id INT REFERENCES reviews(id) NOT NULL,
  url VARCHAR(255) NOT NULL
);

CREATE TABLE characteristics (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  name VARCHAR(30) NOT NULL
);

CREATE TABLE characteristic_reviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INT NOT NULL,
  review_id INT NOT NULL,
  value INT NOT NULL
);

CREATE INDEX product_index ON reviews(product_id);
CREATE INDEX photos_index ON photos(review_id);
CREATE INDEX char_index ON characteristics(product_id);
CREATE INDEX char_reviews_index ON characteristic_reviews(characteristic_id);
CREATE INDEX char_reviews_reviews ON characteristic_reviews(review_id);



