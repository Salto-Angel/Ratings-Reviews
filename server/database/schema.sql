DROP DATABASE IF EXISTS reviewDB

CREATE DATABASE reviewDB

USE reviewDB

CREATE TABLE reviews (
  review_id INT NOT NULL UNIQUE PRIMARY KEY,
  product_id INT,
  rating INT,
  date DATE,
  summary VARCHAR(255),
  body VARCHAR(255),
  recommend VARCHAR(255),
  reported VARCHAR(255),
  reviewer_name VARCHAR(255),
  reviewer_email VARCHAR(255),
  response VARCHAR(255),
  helpfulness INT
);

CREATE TABLE photos (
  photo_id INT NOT NULL UNIQUE PRIMARY KEY,
  review_id INT,
  url VARCHAR(255)
);

CREATE TABLE characteristics (
  characteristic_id INT NOT NULL UNIQUE PRIMARY KEY,
  product_id INT,
  name VARCHAR(255),
  value INT
)