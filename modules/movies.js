'use strict';

let axios = require('axios');
let cache = require('./cache.js');

async function getMovies(request, response, next){
  let userCity = request.query.city.toLowerCase();
  const key = 'movies- ' + userCity;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${userCity}`;
  console.log(url);
  if (cache[key] && (Date.now() - cache[key].timestamp < 50000)) {
    console.log('Cache hit (movies)');
  } else {
    console.log('Cache miss (movies)');
    cache[key] = {};
    cache[key].timestamp = Date.now();
    let axiosResponse = await axios.get(url);

    if (axiosResponse.status !== 200) {
      next('Error: no movies matching the city request');
      return;
    }

    let dataToSend = new Movie(axiosResponse.data.results);
    cache[key].data = dataToSend.movie;
  }
  response.send(cache[key].data);
}

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

module.exports = getMovies;
