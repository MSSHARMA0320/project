// API Key from OpenWeatherMap (replace with your own API key)
const apiKey = "YOUR_API_KEY";
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const getLocationBtn = document.getElementById("getLocationBtn");
const weatherInfo = document.getElementById("weatherInfo");
const currentWeather = document.getElementById("currentWeather");
const locationName = document.getElementById("locationName");
const temp = document.getElementById("temp");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const errorMessage = document.getElementById("errorMessage");
const recentSearches = document.getElementById("recentSearches");
const recentCities = document.getElementById("recentCities");
const extendedForecast = document.getElementById("extendedForecast");
const forecastList = document.getElementById("forecastList");

// Fetch Weather Data
const fetchWeatherData = async (location) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    
    if (data.cod !== 200) {
      throw new Error("City not found.");
    }

    updateCurrentWeather(data);
    fetchExtendedForecast(data.coord.lat, data.coord.lon);
    saveToRecentSearches(location);
  } catch (error) {
    displayError(error.message);
  }
};

// Fetch Extended Forecast (5-day)
const fetchExtendedForecast = async (lat, lon) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    
    if (data.cod !== "200") {
      throw new Error("Unable to fetch extended forecast.");
    }

    updateExtendedForecast(data.list);
  } catch (error) {
    displayError(error.message);
  }
};

// Update Current Weather on UI
const updateCurrentWeather = (data) => {
  locationName.textContent = `${data.name}, ${data.sys.country}`;
  temp.textContent = `${Math.round(data.main.temp)}°C`;
  description.textContent = data.weather[0].description;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;

  currentWeather.classList.remove("hidden");
  errorMessage.classList.add("hidden");
};

// Update Extended Forecast on UI
const updateExtendedForecast = (forecast) => {
  forecastList.innerHTML = "";
  forecast.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const icon = `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
    const temp = `${Math.round(item.main.temp)}°C`;
    const wind = `${item.wind.speed} m/s`;
    const humidity = `${item.main.humidity}%`;

    const forecastItem = document.createElement("div");
    forecastItem.classList.add("bg-white", "p-4", "rounded-lg", "shadow-lg", "text-center");
    forecastItem.innerHTML = `
      <p class="text-lg font-semibold">${day}</p>
      <img src="${icon}" alt="weather icon" class="mx-auto">
      <p class="text-xl">${temp}</p>
      <p>${wind}</p>
      <p>${humidity}</p>
    `;
    forecastList.appendChild(forecastItem);
  });

  extendedForecast.classList.remove("hidden");
};

// Display Error Message
const displayError = (message) => {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  currentWeather.classList.add("hidden");
};

// Save to Recent Searches (LocalStorage)
const saveToRecentSearches = (location) => {
  let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
  if (!recent.includes(location)) {
    recent.push(location);
    localStorage.setItem("recentSearches", JSON.stringify(recent));
  }
  updateRecentSearchDropdown();
};

// Update Recent Search Dropdown
const updateRecentSearchDropdown = () => {
  let recent = JSON.parse(localStorage.getItem("recentSearches")) || [];
  recentCities.innerHTML = "<option value=''>Select a city</option>";
  recent.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCities.appendChild(option);
  });
  recentSearches.classList.toggle("hidden", recent.length === 0);
};

// Handle Search Button Click
searchBtn.addEventListener("click", () => {
  const location = cityInput.value.trim();
  if (location) {
    fetchWeatherData(location);
  } else {
    displayError("Please enter a city name.");
  }
});

// Handle Use Current Location Button Click
getLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetchExtendedForecast(latitude, longitude);
    }, () => {
      displayError("Unable to fetch current location.");
    });
  } else {
    displayError("Geolocation is not supported by this browser.");
  }
});

// Handle Recently Searched City Selection
recentCities.addEventListener("change", (event) => {
  const location = event.target.value;
  if (location) {
    fetchWeatherData(location);
  }
});

// Initial Setup
updateRecentSearchDropdown();
