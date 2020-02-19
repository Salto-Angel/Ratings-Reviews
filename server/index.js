const express = require('express');

const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

const routes = require('./routes');

const port = process.env.PORT || 12345;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/reviews', routes);

app.listen(port, err => {
  if (err) {
    console.log(`Error connecting to ${port}`, err);
  } else {
    console.log(`Connected to port ${port}`);
  }
});
