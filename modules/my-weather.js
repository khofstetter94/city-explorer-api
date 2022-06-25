'use strict';

let axios = require('axios');


async function getWeather(request, response, next){
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
}


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

module.exports = getWeather;
