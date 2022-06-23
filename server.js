'use strict';

console.log('my first server!');

const express = require('express');
require('dotenv').config();
// let data = require('./data/weather.json');
let cors = require('cors');
let axios = require('axios');


const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());

app.get('/weather', async (request, response, next) => {
  let userLat = request.query.lat;
  let userLon = request.query.lon;
  let userCity = request.query.city.toLowerCase();

  let url = `http://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&units=I&days=5&lat=${userLat}&lon=${userLon}&city=${userCity}`;
  let axiosResponse = await axios.get(url);

  if (axiosResponse.status !== 200) {
    next('Error: no weather data was found');
    return;
  }

  let dataToSend = new Forecast(axiosResponse.data);
  response.send(dataToSend.forcast);
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

//  BEGIN MOVIE API STUFF
app.get('/movies', async (request, response, next) => {
  let userCity = request.query.city.toLowerCase();

  let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${userCity}`;
  let axiosResponse = await axios.get(url);

  if (axiosResponse.status !== 200) {
    next('Error: no movies matching the city request');
    return;
  }

  let dataToSend = new Movie(axiosResponse.data.results);
  response.send(dataToSend.movie);
});

class Movie {
  constructor(movieArr) {
    this.movie = [];
    for (let i = 0; i < movieArr.length; i++) {
      let data = movieArr[i];
      let dataMovie = this.formatMovie(data);
      this.movie.push(dataMovie);
    }
  }

  formatMovie(data) {
    let formatted = {
      title: data.title,
      overview: data.overview,
      average_votes: data.vote_average,
      total_votes: data.vote_count,
      popularity: data.popularity,
      released_on: data.release_date,
      image_url: `https://image.tmdb.org/t/p/w500${data.poster_path}`
    };
    return formatted;
  }
}

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
