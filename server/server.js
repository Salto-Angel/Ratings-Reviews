const app = require('./index');
const redis = require('redis');

const redis_port = 6379;
const port = process.env.PORT || 12345;

const redisClient = redis.createClient(redis_port);

redisClient.on('connect', function () {
  console.log('Redis is connected');
});

redisClient.on('ready', function () {
  console.log('Redis is ready');
});

redisClient.on('error', function (err) {
  console.log('Something went wrong ', err);
});

app.listen(port, (err) => {
  console.log('Environment: ', process.env.NODE_ENV);
  if (err) {
    console.log(`Error connecting to ${port}`, err);
  } else {
    console.log(`Connected to port ${port}`);
  }
});
