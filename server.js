'use strict';

console.log('my first server!');

// REQUIRE
// In our server, we have to use require instead of import. Here we will list the requirements for our server.
const express = require('express');
require('dotenv').config();
let data = require('./data/weather.json');
let cors = require('cors');

// USE
// Once I have required something, we have to use it.
// this is where we assign the required file a variable name
// react does this in one step with import, it says we must use it and assign it to a variable
// express takes 2 steps: require and use
const app = express();
// define my PORT, validate that my dotenv file is working
const PORT = process.env.PORT || 3002;
// 3002 - if my server runs on 3002, I know something is wrong with my .env file or how Im importing the values from it

app.use(cors());

// ROUTES
// we will use these to access our endpoints

// .get() is an express method. It correlates to axios.get. The first parameter is a URL in quotes, the second is a callback function

app.get('/', (request, response) => {
  response.send('hello from my server!');
});

app.get('/hello', (request, response) => {
  console.log(request.query.name);
  let name = request.query.name;
  let lastName = request.query.lastName;
  response.send(`hello ${name} ${lastName}!`);
});

function round(num) {
  return Math.ceil(num * 10) / 10;
}

app.get('/weather', (request, response, next) => {
  let latFromRequest = parseFloat(request.query.lat);
  let lonFromRequest = parseFloat(request.query.lon);
  let searchQueryFromRequest = request.query.searchQuery.toLowerCase();
  let dataToGroom = data.find(forecast => {
    let forecastLat = forecast.lat;
    let forecastLon = forecast.lon;
    if (typeof forecastLat === 'string') {
      forecastLat = parseFloat(forecastLat);
    }
    if (typeof forecastLon === 'string') {
      forecastLon = parseFloat(forecastLon);
    }
    // round each lon and lat
    forecastLat = round(forecastLat);
    forecastLon = round(forecastLon);
    latFromRequest = round(latFromRequest);
    lonFromRequest = round(lonFromRequest);
    return (
      forecastLat === latFromRequest &&
      forecastLon === lonFromRequest &&
      forecast.city_name.toLowerCase() === searchQueryFromRequest
    );
  });
  if (
    dataToGroom === undefined ||
    (searchQueryFromRequest !== 'seattle' && searchQueryFromRequest !== 'paris' && searchQueryFromRequest !== 'amman')
  ) {
    next('Error: incorrect city requested. Must be from the following: ["Seattle", "Paris", "Amman"]');
    return;
  }
  let dataToSend = new Forecast(dataToGroom);
  response.send(dataToSend.forcast);
});

// catchall route - goes at the bottom of our routes
app.get('*', (request, response) => {
  response.send('The thing you are looking for doesn\'t exist');
});

// CLASSSES
class Forecast {
  constructor(weatherObj) {
    this.forcast = [];
    for (let i = 0; i < weatherObj.data.length; i++) {
      let data = weatherObj.data[i];
      let dataForcast = this.formatForcast(data);
      this.forcast.push(dataForcast);
    }
  }

  formatForcast(data) {
    let formatted = {
      date: data.datetime,
      description: `Low of ${data.low_temp}, high of ${data.high_temp} with ${data.weather.description}`
    };
    return formatted;
  }
}

// ERRORS
// handle any errors
// taken from documentation: https://expressjs.com/en/guide/error-handling.html
function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.send(err);
}

app.use(errorHandler);

// LISTEN
// start the server
//  .listen() is an express method that takes in a Port value and a callback funtion
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
