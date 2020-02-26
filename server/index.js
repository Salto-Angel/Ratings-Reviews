const express = require('express');

const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

const routes = require('./routes');

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/reviews', routes);

module.exports = app;
