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

const searchInput = document.querySelector('.search-input');
const searchIcon = document.querySelector('.search-icon');

// Store original placeholder text
const originalPlaceholder = searchInput.placeholder;
const searchResults = document.getElementById('searchResults');
searchResults.style.display = 'none'; // Hide search results initially

// Hide icon & placeholder on click/focus
searchInput.addEventListener('focus', () => {
  searchIcon.style.display = 'none';
  searchInput.placeholder = '';
  searchResults.style.display = 'none'; // Show search results on focus
});

// Show icon & placeholder back on click outside (blur) ONLY if empty
searchInput.addEventListener('blur', () => {
  if (searchInput.value.trim() === '') {
    searchIcon.style.display = 'block';
    searchInput.placeholder = originalPlaceholder;
  }
});

// Map Open-Meteo WMO weather codes to your icon files
function getWeatherIcon(code) {
    if (code === 0) return './assets/images/icon-sunny.webp';                    // Clear sky
    if (code === 1 || code === 2) return './assets/images/icon-partly-cloudy.webp'; // Mainly clear / partly cloudy
    if (code === 3) return './assets/images/icon-overcast.webp';               // Overcast
    if (code === 45 || code === 48) return './assets/images/icon-fog.webp';    // Fog
    if (code >= 51 && code <= 57) return './assets/images/icon-drizzle.webp';  // Drizzle
    if (code >= 61 && code <= 67) return './assets/images/icon-rain.webp';     // Rain
    if (code >= 71 && code <= 77) return './assets/images/icon-snow.webp';     // Snow
    if (code >= 80 && code <= 82) return './assets/images/icon-rain.webp';     // Rain showers
    if (code >= 85 && code <= 86) return './assets/images/icon-snow.webp';     // Snow showers
    if (code >= 95 && code <= 99) return './assets/images/icon-storm.webp';    // Thunderstorm
    return './assets/images/icon-sunny.webp'; // fallback
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

function renderDailyForecast(daily) {
    const container = document.getElementById('dailyForecastContainer');
    container.innerHTML = ''; 

    daily.time.forEach((dateStr, i) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dayName = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });

        const code = daily.weather_code[i];
        const iconSrc = getWeatherIcon(code);
        const iconLabel = getWeatherLabel(code);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);

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

// Reusable: fetch weather for a given lat/lon and update the DOM
async function updateWeatherDisplay(latitude, longitude) {

    const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    document.getElementById('currentLocation').textContent = locationLabel;

    // Date — use the API's current time so it matches the city's local date
    const cityDate = new Date(weatherData.current.time);
    document.getElementById('currentDate').textContent = cityDate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    document.getElementById('currentTemp').textContent =
        `${weatherData.current.temperature_2m}°`;

    document.getElementById('feelsLikeVal').textContent =
        `${weatherData.current.apparent_temperature}°`;

    document.getElementById('humidityVal').textContent =
        `${weatherData.current.relative_humidity_2m}%`;

    document.getElementById('windVal').textContent =
        `${weatherData.current.wind_speed_10m} km/h`;

    document.getElementById('precipVal').textContent =
        `${weatherData.current.precipitation} mm`;

         renderDailyForecast(weatherData.daily);
}

// Typing in the search box shows the dropdown of matching cities
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
                await updateWeatherDisplay(city.latitude, city.longitude,  locationLabel = `${city.name}, ${city.country}`);
            });

            searchResults.appendChild(cityElement);

        });

        searchResults.style.display = 'block';

    } catch (error) {
        console.error('Error fetching city data:', error);
    }

});

// Clicking Search geocodes whatever is currently typed and shows weather for the top match
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

        await updateWeatherDisplay(city.latitude, city.longitude, locationLabel = `${city.name}, ${city.country}`);

    } catch (error) {
        console.error('Error fetching weather for search:', error);
    }

});


