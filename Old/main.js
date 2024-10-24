require("dotenv").config();

const currentTemp = document.querySelector("#current-temp");
const weatherIcon = document.querySelector("#weather-icon");
const weatherImgWrapper = document.querySelector("#weather-img-wrapper");
const captionDesc = document.querySelector("figcaption");
const recommendationText = document.querySelector("#recommendation-text");
let lon;
let lat;

document.addEventListener("DOMContentLoaded", () => {
  getLocation();
  getWeatherdata();
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      console.log(lat, lon); // testing only
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// const url =
//   "https://api.openweathermap.org/data/2.5/weather?lat=43.82298397846127&lon=-111.79384857810895&appid=a1078278c70be949e15364ecfc53d10e&units=imperial";

// const forecastUrl =
//   "https://api.openweathermap.org/data/2.5/forecast?lat=43.82298397846127&lon=-111.79384857810895&appid=a1078278c70be949e15364ecfc53d10e&units=imperial";

const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=imperial`;

async function getWeatherdata() {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error("ERROR: Unable to fetch weather data");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data); // testing only
      displayResults(data);
      updateRecommendations(data); // Call to update clothing recommendation
    })
    .catch((error) => {
      console.log(error);
    });
}

async function apiFetch() {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log(data); // testing only
      displayResults(data);
      updateRecommendations(data); // Call to update clothing recommendation
    } else {
      throw Error(await response.text());
    }

    const forecastResponse = await fetch(forecastUrl);
    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      displayWeatherForecast(forecastData);
    } else {
      throw Error(await forecastResponse.text());
    }
  } catch (error) {
    console.log(error);
  }
}

function displayResults(data) {
  currentTemp.innerHTML = `${data.main.temp.toFixed(0)}&deg;F`;
  const iconsrc = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  let desc = data.weather[0].description;

  // Create img element and set attributes
  let weatherImg = document.createElement("img");
  weatherImg.setAttribute("src", iconsrc);
  weatherImg.setAttribute("alt", desc);
  weatherImgWrapper.appendChild(weatherImg);
  captionDesc.textContent = desc;
}

function displayWeatherForecast(data) {
  const weatherForecast = document.getElementById("weather-forecast");
  weatherForecast.innerHTML = "<h2>3-Day Forecast</h2>";

  const forecast = {};
  data.list.forEach((item) => {
    const date = new Date(item.dt_txt).toDateString();
    if (!forecast[date]) {
      forecast[date] = [];
    }
    forecast[date].push(item.main.temp);
  });

  const forecastKeys = Object.keys(forecast).slice(0, 3); // Get the first 3 days
  forecastKeys.forEach((day) => {
    const temps = forecast[day];
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";
    forecastDay.innerHTML = `<p>${day}: Average Temperature: ${avgTemp.toFixed(
      0
    )}°F</p>`;

    weatherForecast.appendChild(forecastDay);
  });
}

function updateRecommendations(data) {
  const temp = data.main.temp; // Get actual temperature data from the weather data
  let recommendation = "";

  if (temp < 32) {
    recommendation = "Dress warmly, it’s cold outside.";
  } else if (temp >= 32 && temp < 60) {
    recommendation = "It's a bit chilly, consider wearing a jacket.";
  } else if (temp >= 60 && temp < 80) {
    recommendation = "The weather is nice, dress comfortably.";
  } else {
    recommendation = "It’s warm, don't forget sunscreen!";
  }

  recommendationText.textContent = recommendation;
}

// Fetch weather data on page load
apiFetch();
