var rotateDiv = document.getElementById('rot');
var rotateIcons = document.getElementById('rot-icons');
var clickRotateDiv = document.getElementById('click-rot');
var angle = 0;

clickRotateDiv.onclick = function () {
  angle += 60;
  rotateDiv.style.transform = 'rotate(' + angle + 'deg)';
  rotateIcons.style.transform = 'rotate(' + angle + 'deg)';
};

var step = 2;
var color1 = 'rgba(0,0,0,0.5)';
var color2 = 'rgba(0,0,0,0.1)';

var gradient = 'conic-gradient(';
for (var i = 0; i < 360; i += step) {
  var color = i % (2 * step) === 0 ? color1 : color2;
  gradient += color + ' ' + i + 'deg, ';
}
gradient = gradient.slice(0, -2) + '), rgb(85 93 108)';

rotateDiv.style.background = gradient;

var toggles = document.querySelectorAll('.toggle');
var tempElement = document.querySelector('.temp');

let isAnimating = false;
let currentTempC = 0; // Celsius temp
let currentWeatherData = null;
let index = 0; // segment index
let sixths = []; // segment elements
let temp; // temp display element

// API configuration
const API_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";

// Weather code to segment mapping
const WEATHER_SEGMENTS = {
  0: 0, 1: 1, 2: 1, 3: 3, 45: 3, 48: 3, 51: 3, 53: 3, 55: 3,
  56: 5, 57: 5, 61: 3, 63: 4, 65: 4, 66: 5, 67: 5, 71: 5, 73: 5,
  75: 5, 77: 5, 80: 3, 81: 4, 82: 4, 85: 5, 86: 5, 95: 4, 96: 4, 99: 4
};

// Get user location from localStorage or default
function getUserLocation() {
  const savedLocation = localStorage.getItem('weatherLocation');
  if (savedLocation) {
    return JSON.parse(savedLocation);
  }
  return { name: "London", latitude: 51.5072, longitude: -0.1276 };
}

// Save location to localStorage
function saveLocation(location) {
  localStorage.setItem('weatherLocation', JSON.stringify(location));
}

// Fetch weather data
async function fetchWeather(latitude, longitude) {
  try {
    const response = await fetch(
      `${API_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

// Geocode location
async function geocodeLocation(name) {
  try {
    const response = await fetch(`${GEOCODING_API}?name=${encodeURIComponent(name)}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return {
        name: data.results[0].name,
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Apply segment visuals
function applySegment(segmentIndex) {
  sixths.forEach((s, i) => {
    s.classList.toggle('active', i === segmentIndex);
  });

  const mountains = document.getElementById('mountains');
  mountains.classList.remove("sunset", "moon", "clouds", "storm", "snow");

  if (segmentIndex === 1) mountains.classList.add("sunset");
  else if (segmentIndex === 2) mountains.classList.add("moon");
  else if (segmentIndex === 3) mountains.classList.add("clouds");
  else if (segmentIndex === 4) mountains.classList.add("storm");
  else if (segmentIndex === 5) mountains.classList.add("snow");
}

// Update weather display
async function updateWeatherDisplay(location) {
  const weatherData = await fetchWeather(location.latitude, location.longitude);
  if (!weatherData || !weatherData.current_weather) return;

  currentWeatherData = weatherData;
  currentTempC = weatherData.current_weather.temperature;

  const activeToggle = document.querySelector('.toggle.active');
  if (activeToggle && activeToggle.id === 'toggle-far') {
    const fahrenheit = Math.round(currentTempC * 9 / 5 + 32);
    tempElement.textContent = fahrenheit + '°F';
  } else {
    tempElement.textContent = Math.round(currentTempC) + '°C';
  }

  const weatherCode = weatherData.current_weather.weathercode;
  const segmentIndex = WEATHER_SEGMENTS[weatherCode] || 0;
  index = segmentIndex;
  applySegment(segmentIndex);
}

// Init weather
async function initWeather() {
  const location = getUserLocation();
  document.getElementById('location-search').value = location.name;
  await updateWeatherDisplay(location);
}

// Toggle temperature unit
toggles.forEach(function (toggle) {
  toggle.addEventListener('click', function () {
    if (this.classList.contains('active') || isAnimating) return;
    toggles.forEach(function (t) { t.classList.remove('active'); });
    this.classList.add('active');

    if (!currentWeatherData) return;

    if (this.id === 'toggle-cel') {
      tempElement.textContent = Math.round(currentTempC) + '°C';
    } else if (this.id === 'toggle-far') {
      const fahrenheit = Math.round(currentTempC * 9 / 5 + 32);
      tempElement.textContent = fahrenheit + '°F';
    }
  });
});

window.onload = function () {
  sixths = Array.from(document.querySelectorAll('.sixths'));
  temp = document.querySelector('.temp');

  // Wheel rotation — change mountain & visuals too
  document.querySelector('#rot-icons').addEventListener('click', () => {
    // Move to next segment visually
    sixths[index].classList.remove('active');
    index = (index + 1) % sixths.length;
    sixths[index].classList.add('active');

    // Apply mountain & background for the new index
    applySegment(index);

    // Keep showing current temp from API
    if (currentWeatherData && currentWeatherData.current_weather) {
      const tempC = Math.round(currentWeatherData.current_weather.temperature);
      const activeToggle = document.querySelector('.toggle.active');

      if (activeToggle && activeToggle.id === 'toggle-far') {
        const fahrenheit = Math.round(tempC * 9 / 5 + 32);
        tempElement.textContent = fahrenheit + '°F';
      } else {
        tempElement.textContent = tempC + '°C';
      }
    }

    // Loading animation
    let loadingBar = document.querySelector('.loading-bar');
    loadingBar.classList.add('active');
    setTimeout(() => {
      loadingBar.classList.remove('active');
    }, 1200);
  });

  // Search functionality
  document.getElementById('search-btn').addEventListener('click', async () => {
    const locationInput = document.getElementById('location-search').value.trim();
    if (!locationInput) return;

    const location = await geocodeLocation(locationInput);
    if (location) {
      saveLocation(location);
      await updateWeatherDisplay(location);
    } else {
      alert("Location not found");
    }
  });

  // Initial load
  initWeather();

  // Auto refresh every 30 min
  setInterval(() => {
    const location = getUserLocation();
    updateWeatherDisplay(location);
  }, 30 * 60 * 1000);
};
