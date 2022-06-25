'use strict';

console.log('my first server!');

const express = require('express');
require('dotenv').config();
let cors = require('cors');

//  REQUIRE MODULES
let getWeather = require('./modules/weather.js');
let getMovies = require('./modules/movies.js');

// USE
const app = express();
const PORT = process.env.PORT || 3002;
app.use(cors());

// ROUTES
app.get('/weather', getWeather);
app.get('/movies', getMovies);

app.get('*', (request, response) => {
  response.send('The thing you are looking for doesn\'t exist');
});

// taken from documentation: https://expressjs.com/en/guide/error-handling.html
function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.send(err);
}

app.use(errorHandler);

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
