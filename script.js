var rotateDiv = document.getElementById('rot');
var rotateIcons = document.getElementById('rot-icons');
var clickRotateDiv = document.getElementById('click-rot');
var angle = 0;

clickRotateDiv.onclick = function() {
  angle += 60;
  rotateDiv.style.transform = 'rotate(' + angle + 'deg)';
  rotateIcons.style.transform = 'rotate(' + angle + 'deg)';
};

var step = 2;
var color1 = 'rgba(0,0,0,0.5)';
var color2 = 'rgba(0,0,0,0.1)';

var gradient = ' conic-gradient(';
for (var i = 0; i < 360; i += step) {
  var color = i % (2 * step) === 0 ? color1 : color2;
  gradient += color + ' ' + i + 'deg, ';
}
gradient = gradient.slice(0, -2) + '), rgb(85 93 108)'; 

rotateDiv.style.background = gradient;


var toggles = document.querySelectorAll('.toggle');
var tempElement = document.querySelector('.temp');

let isAnimating = false; // Add flag to indicate if animation is active

toggles.forEach(function(toggle) {
  toggle.addEventListener('click', function() {
    if (this.classList.contains('active') || isAnimating) { // Check if animation is active
      return;
    }
    toggles.forEach(function(toggle) {
      toggle.classList.remove('active');
    });
    this.classList.add('active');
    var tempValue = parseFloat(tempElement.textContent);
    if (this.id === 'toggle-cel') {
      var celsius = Math.round((tempValue - 32) * 5 / 9);
      tempElement.textContent = celsius + '°C';
    } else if (this.id === 'toggle-far') {
      var fahrenheit = Math.round(tempValue * 9 / 5 + 32);
      tempElement.textContent = fahrenheit + '°F';
    }
  });
});

let currentTempF = 34; // Initialize with the initial temperature in Fahrenheit

// cubic ease in/out function
function easeInOutCubic(t) {
  return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
}

function changeTemp(element, newTemp) {
  let unit = element.innerHTML.includes("F") ? "°F" : "°C";
  let currentTemp = unit === "°F" ? currentTempF : Math.round((currentTempF - 32) * 5 / 9);
  let finalTemp = unit === "°F" ? newTemp : Math.round((newTemp - 32) * 5 / 9);

  let duration = 2000; // Duration of the animation in milliseconds
  let startTime = null;

  function animate(currentTime) {
    if (startTime === null) {
      startTime = currentTime;
    }

    let elapsed = currentTime - startTime;
    let progress = Math.min(elapsed / duration, 1);
    progress = easeInOutCubic(progress);

    let tempNow = Math.round(currentTemp + (progress * (finalTemp - currentTemp)));
    element.innerHTML = `${tempNow}${unit}`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Update currentTempF once the animation is complete
      currentTempF = newTemp;
      isAnimating = false; // Reset the flag when animation is done
    }
  }

  isAnimating = true; // Set flag when animation starts
  requestAnimationFrame(animate);
}


window.onload = function() {
  const sixths = Array.from(document.querySelectorAll('.sixths'));
  let index = 0;
  let temp = document.querySelector('.temp');

  document.querySelector('#rot-icons').addEventListener('click', () => {
    sixths[index].classList.remove('active');
    index = (index + 1) % sixths.length;
    sixths[index].classList.add('active');
    if (index == 0 ) {
      changeTemp(temp, 34);
      console.log("sun")
      document.querySelector('#mountains').classList.remove("snow");
      document.querySelector('#mountains').classList.remove("clouds");
    } else if (index == 1) {
      changeTemp(temp, 27);
      console.log("sunset")
      document.querySelector('#mountains').classList.add("sunset");
    } else if (index == 2) {
      changeTemp(temp, 14);
      console.log("moon")
      document.querySelector('#mountains').classList.remove("sunset");
      document.querySelector('#mountains').classList.add("moon");
    } else if (index == 3) {
      changeTemp(temp, 16);
      console.log("clouds")
      document.querySelector('#mountains').classList.add("clouds");
    } else if (index == 4) {
      changeTemp(temp, 8);
      console.log("storm")
      document.querySelector('#mountains').classList.add("storm");
    } else if (index == 5) {
      changeTemp(temp, -4);
      console.log("snow")
      document.querySelector('#mountains').classList.remove("moon");
      document.querySelector('#mountains').classList.remove("storm");
      document.querySelector('#mountains').classList.add("snow");
    }

    let loadingBar = document.querySelector('.loading-bar');
    loadingBar.classList.add('active');
  
    setTimeout(() => {
      loadingBar.classList.remove('active');
    }, 1200);
  });
}; 




/** var rotateDiv = document.getElementById('rot');
var rotateIcons = document.getElementById('rot-icons');
var clickRotateDiv = document.getElementById('click-rot');
var angle = 0;

clickRotateDiv.onclick = function() {
  angle += 60;
  rotateDiv.style.transform = 'rotate(' + angle + 'deg)';
  rotateIcons.style.transform = 'rotate(' + angle + 'deg)';
};

var step = 2;
var color1 = 'rgba(0,0,0,0.5)';
var color2 = 'rgba(0,0,0,0.1)';

var gradient = ' conic-gradient(';
for (var i = 0; i < 360; i += step) {
  var color = i % (2 * step) === 0 ? color1 : color2;
  gradient += color + ' ' + i + 'deg, ';
}
gradient = gradient.slice(0, -2) + '), rgb(85 93 108)';

rotateDiv.style.background = gradient;

var toggles = document.querySelectorAll('.toggle');
var tempElement = document.querySelector('.temp');

let isAnimating = false;
let currentTempF = null; // Live temp will be stored here

// Fetch today's temperature from Open-Meteo API
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await res.json();
    currentTempF = Math.round((data.current_weather.temperature * 9) / 5 + 32); // Store °F
    tempElement.textContent = `${currentTempF}°F`;
  } catch (error) {
    console.error("Weather fetch failed:", error);
    tempElement.textContent = "N/A";
  }
}

// Detect location or use fallback
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
    () => fetchWeather(25.9861981, 80.7663697) // Fallback: Delhi
  );
} else {
  fetchWeather(25.9861981, 80.7663697);
}

toggles.forEach(function(toggle) {
  toggle.addEventListener('click', function() {
    if (this.classList.contains('active') || isAnimating) {
      return;
    }
    toggles.forEach(function(toggle) {
      toggle.classList.remove('active');
    });
    this.classList.add('active');
    var tempValue = parseFloat(tempElement.textContent);
    if (this.id === 'toggle-cel') {
      var celsius = Math.round((tempValue - 32) * 5 / 9);
      tempElement.textContent = celsius + '°C';
    } else if (this.id === 'toggle-far') {
      var fahrenheit = Math.round(tempValue * 9 / 5 + 32);
      tempElement.textContent = fahrenheit + '°F';
    }
  });
});

// cubic ease in/out function
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function changeTemp(element, newTemp) {
  if (currentTempF === null) return; // No data yet
  
  let unit = element.innerHTML.includes("F") ? "°F" : "°C";
  let currentTemp = unit === "°F" ? currentTempF : Math.round((currentTempF - 32) * 5 / 9);
  let finalTemp = unit === "°F" ? newTemp : Math.round((newTemp - 32) * 5 / 9);
  
  let duration = 2000;
  let startTime = null;
  
  function animate(currentTime) {
    if (startTime === null) startTime = currentTime;
    
    let elapsed = currentTime - startTime;
    let progress = Math.min(elapsed / duration, 1);
    progress = easeInOutCubic(progress);
    
    let tempNow = Math.round(currentTemp + (progress * (finalTemp - currentTemp)));
    element.innerHTML = `${tempNow}${unit}`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      currentTempF = newTemp;
      isAnimating = false;
    }
  }
  
  isAnimating = true;
  requestAnimationFrame(animate);
}

window.onload = function() {
  const sixths = Array.from(document.querySelectorAll('.sixths'));
  let index = 0;
  let temp = document.querySelector('.temp');
  
  document.querySelector('#rot-icons').addEventListener('click', () => {
    sixths[index].classList.remove('active');
    index = (index + 1) % sixths.length;
    sixths[index].classList.add('active');
    
    // Always use live temp for today
    if (currentTempF !== null) {
      changeTemp(temp, currentTempF);
    }
    
    if (index == 0) {
      console.log("sun");
      document.querySelector('#mountains').classList.remove("snow", "clouds");
    } else if (index == 1) {
      console.log("sunset");
      document.querySelector('#mountains').classList.add("sunset");
    } else if (index == 2) {
      console.log("moon");
      document.querySelector('#mountains').classList.remove("sunset");
      document.querySelector('#mountains').classList.add("moon");
    } else if (index == 3) {
      console.log("clouds");
      document.querySelector('#mountains').classList.add("clouds");
    } else if (index == 4) {
      console.log("storm");
      document.querySelector('#mountains').classList.add("storm");
    } else if (index == 5) {
      console.log("snow");
      document.querySelector('#mountains').classList.remove("moon", "storm");
      document.querySelector('#mountains').classList.add("snow");
    }
    
    let loadingBar = document.querySelector('.loading-bar');
    loadingBar.classList.add('active');
    
    setTimeout(() => {
      loadingBar.classList.remove('active');
    }, 1200);
  });
}; **/







// script.js
/** const API_URL = "https://api.open-meteo.com/v1/forecast";

var rotateDiv = document.getElementById('rot');
var rotateIcons = document.getElementById('rot-icons');
var clickRotateDiv = document.getElementById('click-rot');
var angle = 0;

clickRotateDiv.onclick = function() {
  angle += 60;
  rotateDiv.style.transform = 'rotate(' + angle + 'deg)';
  rotateIcons.style.transform = 'rotate(' + angle + 'deg)';
};

var step = 2;
var color1 = 'rgba(0,0,0,0.5)';
var color2 = 'rgba(0,0,0,0.1)';

var gradient = ' conic-gradient(';
for (var i = 0; i < 360; i += step) {
  var color = i % (2 * step) === 0 ? color1 : color2;
  gradient += color + ' ' + i + 'deg, ';
}
gradient = gradient.slice(0, -2) + '), rgb(85 93 108)'; 

rotateDiv.style.background = gradient;

var toggles = document.querySelectorAll('.toggle');
var tempElement = document.querySelector('.temp');
var locationElement = document.querySelector('.location'); // Add this element in HTML

let isAnimating = false;
let currentTempC = 0; // Store temperature in Celsius
let currentUnit = '°C'; // Track current unit
let currentLocation = null; // Store location data

// Scene mapping
const SCENES = {
  0: { name: "sun", temp: 0 },
  1: { name: "sunset", temp: 0 },
  2: { name: "moon", temp: 0 },
  3: { name: "clouds", temp: 0 },
  4: { name: "storm", temp: 0 },
  5: { name: "snow", temp: 0 }
};

// Check for saved location
function getSavedLocation() {
  const savedLocation = localStorage.getItem('weatherLocation');
  return savedLocation ? JSON.parse(savedLocation) : null;
}

// Save location to localStorage
function saveLocation(location) {
  const locationData = {
    name: location.name,
    lat: location.latitude,
    lon: location.longitude,
    timestamp: Date.now()
  };
  localStorage.setItem('weatherLocation', JSON.stringify(locationData));
  return locationData;
}

// Get weather data from Open-Meteo API
async function getWeather(lat, lon) {
  try {
    const response = await fetch(
      `${API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

// Update UI with weather data
function updateWeatherUI(weatherData) {
  if (!weatherData) return;
  
  // Update location name
  if (locationElement && currentLocation) {
    locationElement.textContent = currentLocation.name;
  }

  // Update temperature
  currentTempC = weatherData.current_weather.temperature;
  updateTemperatureDisplay();
  
  // Update weather scene based on weather code
  updateWeatherScene(weatherData.current_weather.weathercode);
}

// Update temperature display based on current unit
function updateTemperatureDisplay() {
  if (currentUnit === '°C') {
    tempElement.textContent = Math.round(currentTempC) + '°C';
  } else {
    const fahrenheit = Math.round(currentTempC * 9/5 + 32);
    tempElement.textContent = fahrenheit + '°F';
  }
}

// Update weather scene based on weather code
function updateWeatherScene(weatherCode) {
  const mountains = document.querySelector('#mountains');
  mountains.className = 'mountains'; // Reset classes
  
  // Map weather codes to scenes
  const codeMap = {
    0: 'sun',       // Clear sky
    1: 'sun',       // Mainly clear
    2: 'clouds',    // Partly cloudy
    3: 'clouds',    // Overcast
    45: 'clouds',   // Fog
    48: 'clouds',   // Depositing rime fog
    51: 'storm',    // Light drizzle
    53: 'storm',    // Moderate drizzle
    55: 'storm',    // Dense drizzle
    56: 'storm',    // Light freezing drizzle
    57: 'storm',    // Dense freezing drizzle
    61: 'storm',    // Slight rain
    63: 'storm',    // Moderate rain
    65: 'storm',    // Heavy rain
    66: 'storm',    // Light freezing rain
    67: 'storm',    // Heavy freezing rain
    71: 'snow',     // Slight snow
    73: 'snow',     // Moderate snow
    75: 'snow',     // Heavy snow
    77: 'snow',     // Snow grains
    80: 'storm',    // Slight rain showers
    81: 'storm',    // Moderate rain showers
    82: 'storm',    // Violent rain showers
    85: 'snow',     // Slight snow showers
    86: 'snow',     // Heavy snow showers
    95: 'storm',    // Thunderstorm
    96: 'storm',    // Thunderstorm with hail
    99: 'storm'     // Thunderstorm with heavy hail
  };

  const sceneName = codeMap[weatherCode] || 'sun';
  mountains.classList.add(sceneName);
  
  // Set active scene in the dial
  const sceneIndex = Object.values(SCENES).findIndex(scene => scene.name === sceneName);
  if (sceneIndex !== -1) {
    const sixths = document.querySelectorAll('.sixths');
    sixths.forEach((sixth, i) => {
      sixth.classList.toggle('active', i === sceneIndex);
    });
  }
}

// cubic ease in/out function
function easeInOutCubic(t) {
  return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
}

function changeTemp(element, newTempC) {
  let currentDisplayValue = parseFloat(element.textContent) || 0;
  let unit = currentUnit;
  
  // Convert to correct unit if needed
  let targetValue;
  if (unit === '°F') {
    targetValue = Math.round(newTempC * 9/5 + 32);
  } else {
    targetValue = Math.round(newTempC);
  }

  let duration = 2000;
  let startTime = null;

  function animate(currentTime) {
    if (startTime === null) {
      startTime = currentTime;
    }

    let elapsed = currentTime - startTime;
    let progress = Math.min(elapsed / duration, 1);
    progress = easeInOutCubic(progress);

    let tempNow = Math.round(currentDisplayValue + (progress * (targetValue - currentDisplayValue)));
    element.textContent = `${tempNow}${unit}`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      currentTempC = newTempC;
      isAnimating = false;
    }
  }

  isAnimating = true;
  requestAnimationFrame(animate);
}

// Handle toggle clicks
toggles.forEach(function(toggle) {
  toggle.addEventListener('click', function() {
    if (this.classList.contains('active') || isAnimating) {
      return;
    }
    
    toggles.forEach(function(toggle) {
      toggle.classList.remove('active');
    });
    this.classList.add('active');
    
    currentUnit = this.id === 'toggle-cel' ? '°C' : '°F';
    updateTemperatureDisplay();
  });
});

// Get location and fetch weather
/** async function initWeather() {
  let locationData = getSavedLocation();
  
  // Use saved location if less than 1 hour old
  if (locationData && (Date.now() - locationData.timestamp < 3600000)) {
    currentLocation = locationData;
    const weather = await getWeather(locationData.lat, locationData.lon);
    updateWeatherUI(weather);
    return;
  }

  // Get new location
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    });
    
    // Reverse geocoding to get location name
    const reverseGeoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&language=en`
    );
    const reverseGeoData = await reverseGeoResponse.json();
    
    const newLocation = {
      name: reverseGeoData.results?.[0]?.name || 'Your Location',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    const weather = await getWeather(newLocation.latitude, newLocation.longitude);
    if (weather) {
      currentLocation = saveLocation(newLocation);
      updateWeatherUI(weather);
    }
  } catch (error) {
    console.error('Geolocation error:', error);
    // Fallback to default location (New York)
    const fallbackLocation = {
      name: 'New York',
      latitude: 25.985110,
      longitude: 80.765875
    };
    const weather = await getWeather(fallbackLocation.latitude, fallbackLocation.longitude);
    if (weather) {
      currentLocation = saveLocation(fallbackLocation);
      updateWeatherUI(weather);
    }
  }
} **/

/** async function initWeather() {
  let locationData = getSavedLocation();
  
  if (locationData && (Date.now() - locationData.timestamp < 3600000)) {
    currentLocation = locationData;
    const weather = await getWeather(locationData.lat, locationData.lon);
    updateWeatherUI(weather);
    return;
  }
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 0
      });
    });
    
    const reverseGeoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&language=en`
    );
    const reverseGeoData = await reverseGeoResponse.json();
    
    const newLocation = {
      name: reverseGeoData.results?.[0]?.name || 'Your Location',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    const weather = await getWeather(newLocation.latitude, newLocation.longitude);
    if (weather) {
      currentLocation = saveLocation(newLocation);
      updateWeatherUI(weather);
    }
  } catch (error) {
    console.error(`Geolocation error (code ${error.code}): ${error.message}`);
    
    // Fallback location: Chitaura, Fatehpur approx
    const fallbackLocation = {
      name: 'Chitaura, Fatehpur',
      latitude: 25.9626,
      longitude: 80.7980
    };
    const weather = await getWeather(fallbackLocation.latitude, fallbackLocation.longitude);
    if (weather) {
      currentLocation = saveLocation(fallbackLocation);
      updateWeatherUI(weather);
    }
  }
}


// On window load
window.onload = function() {
  const sixths = Array.from(document.querySelectorAll('.sixths'));
  let index = 0;
  let temp = document.querySelector('.temp');

  // Initialize weather
  initWeather();

  // Rotate dial click handler
  document.querySelector('#rot-icons').addEventListener('click', () => {
    sixths[index].classList.remove('active');
    index = (index + 1) % sixths.length;
    sixths[index].classList.add('active');
    
    // Manually set scene based on dial position
    const mountains = document.querySelector('#mountains');
    mountains.className = 'mountains';
    mountains.classList.add(SCENES[index].name);
    
    // Refresh weather
    if (currentLocation) {
      getWeather(currentLocation.lat, currentLocation.lon)
        .then(weatherData => {
          if (weatherData) {
            currentTempC = weatherData.current_weather.temperature;
            updateTemperatureDisplay();
          }
        });
    }

    // Loading animation
    let loadingBar = document.querySelector('.loading-bar');
    loadingBar.classList.add('active');
  
    setTimeout(() => {
      loadingBar.classList.remove('active');
    }, 1200);
  });
}; **/



// script.js
/** const API_URL = "https://api.open-meteo.com/v1/forecast";

var rotateDiv = document.getElementById('rot');
var rotateIcons = document.getElementById('rot-icons');
var clickRotateDiv = document.getElementById('click-rot');
var angle = 0;

clickRotateDiv.onclick = function() {
  angle += 60;
  rotateDiv.style.transform = 'rotate(' + angle + 'deg)';
  rotateIcons.style.transform = 'rotate(' + angle + 'deg)';
};

var step = 2;
var color1 = 'rgba(0,0,0,0.5)';
var color2 = 'rgba(0,0,0,0.1)';

var gradient = ' conic-gradient(';
for (var i = 0; i < 360; i += step) {
  var color = i % (2 * step) === 0 ? color1 : color2;
  gradient += color + ' ' + i + 'deg, ';
}
gradient = gradient.slice(0, -2) + '), rgb(85 93 108)'; 

rotateDiv.style.background = gradient;

var toggles = document.querySelectorAll('.toggle');
var tempElement = document.querySelector('.temp');
var locationElement = document.querySelector('.location'); // HTML में लोकेशन नाम दिखाने के लिए
var updateTimeElement = document.querySelector('.update-time'); // HTML में अपडेट टाइम दिखाने के लिए

let isAnimating = false;
let currentTempC = 0;
let currentUnit = '°C';
let currentLocation = null;

// Scene mapping
const SCENES = {
  0: { name: "sun", temp: 0 },
  1: { name: "sunset", temp: 0 },
  2: { name: "moon", temp: 0 },
  3: { name: "clouds", temp: 0 },
  4: { name: "storm", temp: 0 },
  5: { name: "snow", temp: 0 }
};

// Save location to localStorage (optional, can keep for reusing lat/lon)
function saveLocation(location) {
  const locationData = {
    name: location.name,
    lat: location.latitude,
    lon: location.longitude,
    timestamp: Date.now()
  };
  localStorage.setItem('weatherLocation', JSON.stringify(locationData));
  return locationData;
}

// Get weather data fresh from Open-Meteo (no caching)
async function getWeather(lat, lon) {
  try {
    const response = await fetch(
      `${API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

// Update UI with weather data including time
function updateWeatherUI(weatherData) {
  if (!weatherData) return;

  if (locationElement && currentLocation) {
    locationElement.textContent = currentLocation.name;
  }

  currentTempC = weatherData.current_weather.temperature;
  updateTemperatureDisplay();

  // Show the time when data was recorded
  if (updateTimeElement) {
    updateTimeElement.textContent = "Updated: " + weatherData.current_weather.time;
  }

  updateWeatherScene(weatherData.current_weather.weathercode);
}

// Temperature display update
function updateTemperatureDisplay() {
  if (currentUnit === '°C') {
    tempElement.textContent = Math.round(currentTempC) + '°C';
  } else {
    const fahrenheit = Math.round(currentTempC * 9 / 5 + 32);
    tempElement.textContent = fahrenheit + '°F';
  }
}

// Weather scene update
function updateWeatherScene(weatherCode) {
  const mountains = document.querySelector('#mountains');
  mountains.className = 'mountains';

  const codeMap = {
    0: 'sun', 1: 'sun', 2: 'clouds', 3: 'clouds', 45: 'clouds', 48: 'clouds',
    51: 'storm', 53: 'storm', 55: 'storm', 56: 'storm', 57: 'storm',
    61: 'storm', 63: 'storm', 65: 'storm', 66: 'storm', 67: 'storm',
    71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow',
    80: 'storm', 81: 'storm', 82: 'storm',
    85: 'snow', 86: 'snow',
    95: 'storm', 96: 'storm', 99: 'storm'
  };

  const sceneName = codeMap[weatherCode] || 'sun';
  mountains.classList.add(sceneName);

  const sceneIndex = Object.values(SCENES).findIndex(scene => scene.name === sceneName);
  if (sceneIndex !== -1) {
    const sixths = document.querySelectorAll('.sixths');
    sixths.forEach((sixth, i) => {
      sixth.classList.toggle('active', i === sceneIndex);
    });
  }
}

// Animate temperature change (optional)
function easeInOutCubic(t) {
  return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function changeTemp(element, newTempC) {
  let currentDisplayValue = parseFloat(element.textContent) || 0;
  let unit = currentUnit;

  let targetValue;
  if (unit === '°F') {
    targetValue = Math.round(newTempC * 9 / 5 + 32);
  } else {
    targetValue = Math.round(newTempC);
  }

  let duration = 2000;
  let startTime = null;

  function animate(currentTime) {
    if (startTime === null) {
      startTime = currentTime;
    }

    let elapsed = currentTime - startTime;
    let progress = Math.min(elapsed / duration, 1);
    progress = easeInOutCubic(progress);

    let tempNow = Math.round(currentDisplayValue + (progress * (targetValue - currentDisplayValue)));
    element.textContent = `${tempNow}${unit}`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      currentTempC = newTempC;
      isAnimating = false;
    }
  }

  isAnimating = true;
  requestAnimationFrame(animate);
}

// Toggle C/F units
toggles.forEach(function (toggle) {
  toggle.addEventListener('click', function () {
    if (this.classList.contains('active') || isAnimating) {
      return;
    }

    toggles.forEach(function (toggle) {
      toggle.classList.remove('active');
    });
    this.classList.add('active');

    currentUnit = this.id === 'toggle-cel' ? '°C' : '°F';
    updateTemperatureDisplay();
  });
});

// Initialize weather always fresh, no cache limit
async function initWeather() {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    });

    // Reverse geocoding for location name
    const reverseGeoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&language=en`
    );
    const reverseGeoData = await reverseGeoResponse.json();

    const newLocation = {
      name: reverseGeoData.results?.[0]?.name || 'Your Location',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    const weather = await getWeather(newLocation.latitude, newLocation.longitude);
    if (weather) {
      currentLocation = saveLocation(newLocation);
      updateWeatherUI(weather);
    }
  } catch (error) {
    console.error('Geolocation error:', error);
    // Fallback location (New York)
    const fallbackLocation = {
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.0060
    };
    const weather = await getWeather(fallbackLocation.latitude, fallbackLocation.longitude);
    if (weather) {
      currentLocation = saveLocation(fallbackLocation);
      updateWeatherUI(weather);
    }
  }
}

// Window load init
window.onload = function () {
  const sixths = Array.from(document.querySelectorAll('.sixths'));
  let index = 0;

  initWeather();

  document.querySelector('#rot-icons').addEventListener('click', () => {
    sixths[index].classList.remove('active');
    index = (index + 1) % sixths.length;
    sixths[index].classList.add('active');

    const mountains = document.querySelector('#mountains');
    mountains.className = 'mountains';
    mountains.classList.add(SCENES[index].name);

    if (currentLocation) {
      getWeather(currentLocation.lat, currentLocation.lon)
        .then(weatherData => {
          if (weatherData) {
            currentTempC = weatherData.current_weather.temperature;
            updateTemperatureDisplay();
          }
        });
    }

    let loadingBar = document.querySelector('.loading-bar');
    loadingBar.classList.add('active');

    setTimeout(() => {
      loadingBar.classList.remove('active');
    }, 1200);
  });
}; **/





