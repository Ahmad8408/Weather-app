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


const countries = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Australia',
    'Austria',
    'azerbaijan',
    'armenia',
    'andolla',
    'Pakistan',
    'Thailand',
    'United States'
];

searchInput.addEventListener('input', () => {
  const searchText = searchInput.value.toLowerCase();

  const results = countries.filter(country =>
    country.toLowerCase().startsWith(searchText)
  );

  searchResults.innerHTML = '';

  results.forEach(country => {
    const countryElement = document.createElement('div');
    countryElement.textContent = country;

    // 1. Add class for styling
    countryElement.classList.add('search-result-item');

    // 2. Optional: Click to select country
    countryElement.addEventListener('click', () => {
      searchInput.value = country;
      searchResults.innerHTML = '';
    });

    searchResults.appendChild(countryElement);
  });

   document.addEventListener('input', (e) => {
    if (searchInput.value === '') {
      searchResults.style.display = 'none';
    }else {
      searchResults.style.display = 'block';
    }
  });

   document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
      }
  });

});


