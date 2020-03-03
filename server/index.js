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

app.get('/loaderio-7b4882aff9643bdd6a7b8b70669624c3', (req, res) => {
  res.send('loaderio-7b4882aff9643bdd6a7b8b70669624c3');
});
app.use('/reviews', routes);

module.exports = app;
