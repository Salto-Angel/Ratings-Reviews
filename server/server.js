const app = require('./index');

const port = process.env.PORT || 12345;

app.listen(port, err => {
  console.log('Environment: ', process.env.NODE_ENV);
  if (err) {
    console.log(`Error connecting to ${port}`, err);
  } else {
    console.log(`Connected to port ${port}`);
  }
});
