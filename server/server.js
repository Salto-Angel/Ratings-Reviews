const app = require('./index');

const port = process.env.PORT || 12345;

app.listen(port, err => {
  if (err) {
    console.log(`Error connecting to ${port}`, err);
  } else {
    console.log(`Connected to port ${port}`);
  }
});
