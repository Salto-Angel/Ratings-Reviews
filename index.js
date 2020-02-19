const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 12345;

app.use(bodyParser.json());

app.listen(port, err => {
  if (err) {
    console.log(`Error connecting to ${port}`, err);
  } else {
    console.log(`Connected to port ${port}`);
  }
});
