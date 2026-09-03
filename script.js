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

searchInput.addEventListener('input', async () => {

    const searchText = searchInput.value.trim();

    if (searchText === '') {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }

    try {

        // Search for cities matching the typed text
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

                // NOW you have real coordinates — fetch the actual weather
                const weatherRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
                );
                const weatherData = await weatherRes.json();
                console.log('Weather:', weatherData);

                // Update the DOM with the fetched weather
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


            });

            searchResults.appendChild(cityElement);

        });

        searchResults.style.display = 'block';

    } catch (error) {
        console.error('Error fetching city data:', error);
    }

});
document.addEventListener('click', (e) => {

    if (
        !searchInput.contains(e.target) &&
        !searchResults.contains(e.target)
    ) {
        searchResults.style.display = 'none';
    }

});


