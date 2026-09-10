// --- Dropdown open/close ---
const unitBtn = document.querySelector('.unit-button');
const dropdownMenu = document.querySelector('.dropdown-menu');

unitBtn.addEventListener('click', () => {
  const isOpen = dropdownMenu.classList.toggle('show');
  unitBtn.setAttribute('aria-expanded', isOpen);
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!unitBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.remove('show');
    unitBtn.setAttribute('aria-expanded', 'false');
  }
});

// --- Unit state + conversions ---
let currentWeatherData = null; // raw API response, always in metric

const units = {
  temperature: 'C',   // 'C' or 'F'
  wind: 'km/h',       // 'km/h' or 'mph'
  precipitation: 'mm' // 'mm' or 'in'
};

function celsiusToFahrenheit(c) {
  return (c * 9 / 5) + 32;
}

function kmhToMph(kmh) {
  return kmh * 0.621371;
}

function mmToInches(mm) {
  return mm * 0.0393701;
}

// --- Unit toggle buttons ---
document.querySelectorAll('.menu-section').forEach(section => {
  const optionBtns = section.querySelectorAll('.option-btn');

  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Turn off all options in this section
      optionBtns.forEach(b => {
        b.classList.remove('active');
        const check = b.querySelector('.checkmark');
        if (check) check.remove();
      });

      // Turn on the clicked option
      btn.classList.add('active');
      const checkmark = document.createElement('span');
      checkmark.className = 'checkmark';
      checkmark.textContent = ' ✓';
      btn.appendChild(checkmark);

      // Figure out which unit was picked, based on button text
      const label = btn.textContent.trim();

      if (label.startsWith('Celsius')) units.temperature = 'C';
      else if (label.startsWith('Fahrenheit')) units.temperature = 'F';
      else if (label.startsWith('km/h')) units.wind = 'km/h';
      else if (label.startsWith('mph')) units.wind = 'mph';
      else if (label.startsWith('Millimeters')) units.precipitation = 'mm';
      else if (label.startsWith('Inches')) units.precipitation = 'in';

      // Re-render with the new units, using data we already have (no re-fetch)
      if (currentWeatherData) {
        renderAllWeather(currentWeatherData);
      }
    });
  });
});

// --- Search box ---
const searchInput = document.querySelector('.search-input');
const searchIcon = document.querySelector('.search-icon');
const originalPlaceholder = searchInput.placeholder;
const searchResults = document.getElementById('searchResults');
searchResults.style.display = 'none';

searchInput.addEventListener('focus', () => {
  searchIcon.style.display = 'none';
  searchInput.placeholder = '';
  searchResults.style.display = 'none';
});

searchInput.addEventListener('blur', () => {
  if (searchInput.value.trim() === '') {
    searchIcon.style.display = 'block';
    searchInput.placeholder = originalPlaceholder;
  }
});

// --- Weather icon/label helpers ---
function getWeatherIcon(code) {
  if (code === 0) return './assets/images/icon-sunny.webp';
  if (code === 1 || code === 2) return './assets/images/icon-partly-cloudy.webp';
  if (code === 3) return './assets/images/icon-overcast.webp';
  if (code === 45 || code === 48) return './assets/images/icon-fog.webp';
  if (code >= 51 && code <= 57) return './assets/images/icon-drizzle.webp';
  if (code >= 61 && code <= 67) return './assets/images/icon-rain.webp';
  if (code >= 71 && code <= 77) return './assets/images/icon-snow.webp';
  if (code >= 80 && code <= 82) return './assets/images/icon-rain.webp';
  if (code >= 85 && code <= 86) return './assets/images/icon-snow.webp';
  if (code >= 95 && code <= 99) return './assets/images/icon-storm.webp';
  return './assets/images/icon-sunny.webp';
}

function getWeatherLabel(code) {
  if (code === 0) return 'Clear';
  if (code === 1 || code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95 && code <= 99) return 'Storm';
  return 'Clear';
}

// --- Daily forecast (unit-aware) ---
function renderDailyForecast(daily) {
  const container = document.getElementById('dailyForecastContainer');
  container.innerHTML = '';

  daily.time.forEach((dateStr, i) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayName = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });

    const code = daily.weather_code[i];
    const iconSrc = getWeatherIcon(code);
    const iconLabel = getWeatherLabel(code);

    let maxTemp = daily.temperature_2m_max[i];
    let minTemp = daily.temperature_2m_min[i];
    if (units.temperature === 'F') {
      maxTemp = celsiusToFahrenheit(maxTemp);
      minTemp = celsiusToFahrenheit(minTemp);
    }
    maxTemp = Math.round(maxTemp);
    minTemp = Math.round(minTemp);

    const card = document.createElement('div');
    card.className = 'daily-card';
    card.innerHTML = `
      <span class="day">${dayName}</span>
      <img src="${iconSrc}" alt="${iconLabel}" class="forecast-icon">
      <div class="temps">
        <span class="max-temp">${maxTemp}°</span>
        <span class="min-temp">${minTemp}°</span>
      </div>
    `;
    container.appendChild(card);
  });
}

let hourlyData = null; // store globally so the dropdown/day-select handler can reuse it

function populateDaySelector(dailyTime) {
  const select = document.querySelector('.day-select');
  select.innerHTML = '';

  dailyTime.forEach((dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayName = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });

    const option = document.createElement('option');
    option.value = dateStr;
    option.textContent = dayName;
    select.appendChild(option);
  });
}

// --- Hourly forecast (unit-aware) ---
function renderHourlyForecast(hourly, selectedDate) {
  const container = document.getElementById('hourlyForecastContainer');
  container.innerHTML = '';

  hourly.time.forEach((isoString, i) => {
    const [datePart, timePart] = isoString.split('T');
    if (datePart !== selectedDate) return;

    const [hourStr] = timePart.split(':');
    const hour24 = parseInt(hourStr, 10);
    const hourLabel = formatHour(hour24);

    const code = hourly.weather_code[i];
    const iconSrc = getWeatherIcon(code);
    const iconLabel = getWeatherLabel(code);

    let temp = hourly.temperature_2m[i];
    if (units.temperature === 'F') temp = celsiusToFahrenheit(temp);
    temp = Math.round(temp);

    const item = document.createElement('div');
    item.className = 'hourly-item';
    item.innerHTML = `
      <div class="hourly-left">
        <img src="${iconSrc}" alt="${iconLabel}" class="hourly-icon">
        <span class="hour-time">${hourLabel}</span>
      </div>
      <span class="hour-temp">${temp}°</span>
    `;
    container.appendChild(item);
  });
}

function formatHour(hour24) {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12} ${period}`;
}

// --- Render everything using currently selected units (no re-fetch needed) ---
function renderAllWeather(weatherData) {
  const tempC = weatherData.current.temperature_2m;
  const feelsC = weatherData.current.apparent_temperature;
  const windKmh = weatherData.current.wind_speed_10m;
  const precipMm = weatherData.current.precipitation;

  const tempDisplay = units.temperature === 'F' ? Math.round(celsiusToFahrenheit(tempC)) : Math.round(tempC);
  const feelsDisplay = units.temperature === 'F' ? Math.round(celsiusToFahrenheit(feelsC)) : Math.round(feelsC);
  const windDisplay = units.wind === 'mph' ? Math.round(kmhToMph(windKmh)) : Math.round(windKmh);
  const precipDisplay = units.precipitation === 'in' ? mmToInches(precipMm).toFixed(2) : precipMm;

  document.getElementById('currentTemp').textContent = `${tempDisplay}°`;
  document.getElementById('feelsLikeVal').textContent = `${feelsDisplay}°`;
  document.getElementById('humidityVal').textContent = `${weatherData.current.relative_humidity_2m}%`;
  document.getElementById('windVal').textContent = `${windDisplay} ${units.wind}`;
  document.getElementById('precipVal').textContent = `${precipDisplay} ${units.precipitation}`;

  renderDailyForecast(weatherData.daily);

  hourlyData = weatherData.hourly;
  const daySelect = document.querySelector('.day-select');
  renderHourlyForecast(hourlyData, daySelect.value);
}

// --- Fetch weather for a given lat/lon and render it (single definition, used everywhere) ---
async function updateWeatherDisplay(latitude, longitude) {

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&hourly=temperature_2m,weather_code` +
    `&timezone=auto`
  );
  const weatherData = await weatherRes.json();

  currentWeatherData = weatherData; // keep raw data so unit toggles can re-render without re-fetching

  document.getElementById('currentLocation').textContent = locationLabel;

  const cityDate = new Date(weatherData.current.time);
  document.getElementById('currentDate').textContent = cityDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  populateDaySelector(weatherData.daily.time);
  renderAllWeather(weatherData);

  const daySelect = document.querySelector('.day-select');
  daySelect.addEventListener('change', () => {
    renderHourlyForecast(hourlyData, daySelect.value);
  });
}

// --- City search (autocomplete dropdown) ---
searchInput.addEventListener('input', async () => {
  const searchText = searchInput.value.trim();

  if (searchText === '') {
    searchResults.innerHTML = '';
    searchResults.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchText)}&count=5&language=en&format=json`
    );
    const data = await response.json();
    searchResults.innerHTML = '';

    if (!data.results) {
      searchResults.style.display = 'none';
      return;
    }

    data.results.forEach(city => {
      const cityElement = document.createElement('div');
      cityElement.textContent = `${city.name}, ${city.country}`;
      cityElement.classList.add('search-result-item');

      cityElement.addEventListener('click', async () => {
        searchInput.value = city.name;
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        locationLabel = `${city.name}, ${city.country}`;
        await updateWeatherDisplay(city.latitude, city.longitude);
      });

      searchResults.appendChild(cityElement);
    });

    searchResults.style.display = 'block';

  } catch (error) {
    console.error('Error fetching city data:', error);
  }
});

// --- Search button (top match) ---
const searchButton = document.querySelector('.search-button');

searchButton.addEventListener('click', async () => {
  const searchText = searchInput.value.trim();
  if (searchText === '') return;

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchText)}&count=1&language=en&format=json`
    );
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn('No matching city found');
      return;
    }

    const city = data.results[0];
    searchInput.value = city.name;
    searchResults.innerHTML = '';
    searchResults.style.display = 'none';
    locationLabel = `${city.name}, ${city.country}`;

    await updateWeatherDisplay(city.latitude, city.longitude);

  } catch (error) {
    console.error('Error fetching weather for search:', error);
  }
});