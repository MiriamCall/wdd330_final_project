const API_key = import.meta.env.VITE_API_KEY;

const currentTemp = document.querySelector("#current-temp");
const weatherIcon = document.querySelector("#weather-icon");
const weatherImgWrapper = document.querySelector("#weather-img-wrapper");
const captionDesc = document.querySelector("figcaption");
const recommendationText = document.querySelector("#recommendation-text");

document.addEventListener("DOMContentLoaded", () => {
  getLocation();
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = updateUrl(lat, lon);
      getWeatherdata(url);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function updateUrl(lat, lon) {
  return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=imperial`;
}

async function getWeatherdata(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      displayResults(data);
      updateRecommendations(data);
    } else {
      throw new Error("ERROR: Unable to fetch weather data");
    }
  } catch (error) {
    console.log(error);
  }
}

function displayResults(data) {
  currentTemp.innerHTML = `${data.main.temp.toFixed(0)}&deg;F`;
  const iconsrc = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  const desc = data.weather[0].description;

  const weatherImg = document.createElement("img");
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

  const forecastKeys = Object.keys(forecast).slice(0, 3);
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
  const temp = data.main.temp;
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
