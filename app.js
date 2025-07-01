// Filter- und Sortierfunktionen
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function filterProducts(products, searchText, category) {
  return products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = category === 'Alle Kategorien' || product.category === category;
    return matchesSearch && matchesCategory;
  });
}

function sortProducts(products, sortOrder) {
  // Sortiere nach Preis aufsteigend oder absteigend
  return [...products].sort((a, b) =>
    sortOrder === 'Aufsteigend' || sortOrder === 'Preis: Aufsteigend'
      ? a.price - b.price
      : b.price - a.price
  );
}

// Produktdaten laden
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Fehler beim Laden der Produkte:', error);
    return [];
  }
}

// Produktgrid rendern
function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.map(product => `
    <div class="col">
      <div class="card h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description}</p>
          <div class="mb-2">
            ${product.variants ? Object.entries(product.variants).map(([key, values]) =>
              `<select class="form-select form-select-sm mb-2">
                ${values.map(v => `<option>${v}</option>`).join('')}
              </select>`
            ).join('') : ''}
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="h5">€${product.price.toFixed(2)}</span>
            <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
              <i class="bi bi-cart-plus me-2"></i>In den Warenkorb
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  initializeAddToCartButtons();
}

// Warenkorb-Initialisierung
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Warenkorb-Funktionen
function addToCart(productId) {
  loadProducts().then(products => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existingItem = cartItems.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cartItems.push({ ...product, quantity: 1 });
    }

    updateCart();
    showAlert('Produkt wurde zum Warenkorb hinzugefügt');
  });
}

function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartCounter();
}

function calculateTotal() {
  return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
}

// UI-Update Funktionen
function updateCartCounter() {
  const counter = document.getElementById('cartCounter');
  if (counter) {
    counter.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
}

function showAlert(message) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-success position-fixed top-0 end-0 m-3';
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

// Add-to-cart Buttons initialisieren
function initializeAddToCartButtons() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(button.dataset.productId);
      addToCart(productId);
    });
  });
}

// Filter- und Sortier-Event-Listener
document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter();

  const searchInput = document.querySelector('input[type="search"]');
  const categoryFilter = document.getElementById('categoryFilter');
  const priceSort = document.getElementById('priceSort');

  const updateFilters = debounce(() => {
    loadProducts().then(products => {
      const filtered = filterProducts(
        products,
        searchInput ? searchInput.value : '',
        categoryFilter ? categoryFilter.value : 'Alle Kategorien'
      );
      const sorted = sortProducts(
        filtered,
        priceSort ? priceSort.value : 'Aufsteigend'
      );
      renderProducts(sorted);
    });
  }, 300);

  if (searchInput) searchInput.addEventListener('input', updateFilters);
  if (categoryFilter) categoryFilter.addEventListener('change', updateFilters);
  if (priceSort) priceSort.addEventListener('change', updateFilters);

  // Initiales Laden und Rendern
  loadProducts().then(products => {
    const filtered = filterProducts(
      products,
      searchInput ? searchInput.value : '',
      categoryFilter ? categoryFilter.value : 'Alle Kategorien'
    );
    const sorted = sortProducts(
      filtered,
      priceSort ? priceSort.value : 'Aufsteigend'
    );
    renderProducts(sorted);
  });
});