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

    // Don't search if the input is empty
    if (searchText === '') {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }

    try {

        // Request city data from Open-Meteo
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchText)}&count=10&language=en&format=json`
        );

        const data = await response.json();

        console.log(data);

        // Clear previous search results
        searchResults.innerHTML = '';

        // Check if locations were found
        if (!data.results) {
            searchResults.style.display = 'none';
            return;
        }

        // Go through every returned city
        data.results.forEach(city => {

            const cityElement = document.createElement('div');

            // Display city and country
            cityElement.textContent = `${city.name}, ${city.country}`;

            // Add your existing CSS class
            cityElement.classList.add('search-result-item');

            // When a city is clicked
            cityElement.addEventListener('click', () => {

                searchInput.value = city.name;

                // Hide results
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';

                // For now, display coordinates in console
                console.log('Selected city:', city.name);
                console.log('Latitude:', city.latitude);
                console.log('Longitude:', city.longitude);

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


