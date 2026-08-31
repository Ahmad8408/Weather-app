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

// Hide icon & placeholder on click/focus
searchInput.addEventListener('focus', () => {
  searchIcon.style.display = 'none';
  searchInput.placeholder = '';
});

// Show icon & placeholder back on click outside (blur) ONLY if empty
searchInput.addEventListener('blur', () => {
  if (searchInput.value.trim() === '') {
    searchIcon.style.display = 'block';
    searchInput.placeholder = originalPlaceholder;
  }
});