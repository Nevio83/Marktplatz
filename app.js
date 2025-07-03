// Warenkorb-Initialisierung
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Produktdaten laden
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const products = await response.json();
    // Füge eine Standardbeschreibung hinzu, falls nicht vorhanden
    return products.map(p => ({
      ...p,
      description: p.description || ''
    }));
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
      <div class="card h-100 border-0 shadow-hover">
        <div class="ratio ratio-4x3">
          <img src="${product.image}" class="card-img-top object-fit-cover" alt="${product.name}">
        </div>
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description || ''}</p>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="h4 text-primary">€${product.price.toFixed(2)}</span>
              <small class="text-muted d-block">inkl. MwSt.</small>
            </div>
            <button class="btn btn-primary rounded-pill px-3 py-2 add-to-cart"
                    data-product-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}">
              <i class="bi bi-cart-plus me-2"></i>Hinzufügen
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  initializeAddToCartButtons();
}

// Add-to-cart Buttons initialisieren
function initializeAddToCartButtons() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = parseInt(button.dataset.productId);
      addToCart(productId);
    });
  });
}

// Warenkorb-Funktionen
function addToCart(productId) {
  loadProducts().then(products => {
    const product = products.find(p => Number(p.id) === Number(productId));
    if (!product) return;
    const existingItem = cartItems.find(item => Number(item.id) === Number(productId));

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cartItems.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCounter();
    showAlert('Produkt wurde zum Warenkorb hinzugefügt');
  });
}

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
  setTimeout(() => alert.remove(), 2000);
}

function changeQuantity(productId, change) {
  productId = Number(productId);
  const item = cartItems.find(i => Number(i.id) === productId);
  if (!item) return;
  if (item.quantity + change < 1) {
    // Entferne das Produkt, wenn die Menge kleiner als 1 wird
    cartItems = cartItems.filter(i => Number(i.id) !== productId);
  } else {
    item.quantity += change;
  }
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartCounter();
  renderCartDropdown();
  // Dropdown nach 1 Sekunde ausblenden, wenn leer
  if (cartItems.length === 0) {
    setTimeout(() => {
      const cartDropdown = document.getElementById('cartDropdown');
      if (cartDropdown) cartDropdown.classList.remove('show');
    }, 1000);
  }
}

function removeFromCart(productId) {
  productId = Number(productId);
  cartItems = cartItems.filter(i => Number(i.id) !== productId);
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartCounter();
  renderCartDropdown();
  // Dropdown nach 1 Sekunde ausblenden, wenn leer
  if (cartItems.length === 0) {
    setTimeout(() => {
      const cartDropdown = document.getElementById('cartDropdown');
      if (cartDropdown) cartDropdown.classList.remove('show');
    }, 1000);
  }
}

function clearCart() {
  cartItems = [];
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartCounter();
  renderCartDropdown();
  // Dropdown nach 1 Sekunde ausblenden
  setTimeout(() => {
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown) cartDropdown.classList.remove('show');
  }, 1000);
}

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
  return [...products].sort((a, b) =>
    sortOrder === 'Aufsteigend' || sortOrder === 'Preis: Aufsteigend'
      ? a.price - b.price
      : b.price - a.price
  );
}

// Warenkorb Dropdown öffnen/schließen und rendern
function initializeCartDropdown() {
  const cartButton = document.getElementById('cartButton');
  const cartDropdown = document.getElementById('cartDropdown');
  const closeCartDropdown = document.getElementById('closeCartDropdown');

  if (cartButton && cartDropdown) {
    cartButton.addEventListener('click', (e) => {
      e.preventDefault();
      renderCartDropdown();
      cartDropdown.classList.toggle('show');
    });
  }
  if (closeCartDropdown && cartDropdown) {
    closeCartDropdown.addEventListener('click', () => {
      cartDropdown.classList.remove('show');
    });
  }
}

function renderCartDropdown() {
  const body = document.getElementById('cartDropdownBody');
  const footer = document.getElementById('cartDropdownFooter');
  const totalElement = document.getElementById('cartTotal');

  if (!body || !footer || !totalElement) return;

  if (cartItems.length === 0) {
    footer.style.display = 'none';
    body.innerHTML = `
      <div class="empty-cart text-center py-4" id="emptyCartMessage">
        <i class="bi bi-cart-x fs-1 text-muted"></i>
        <p class="text-muted mt-2">Ihr Warenkorb ist leer</p>
      </div>
    `;
    return;
  }
  footer.style.display = 'block';
  body.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <img src="${item.image}" class="cart-item-image" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">
          €${item.price.toFixed(2)} x 
          <span class="quantity-display">${item.quantity}</span> = 
          <strong>€${(item.price * item.quantity).toFixed(2)}</strong>
        </div>
      </div>
      <div class="cart-item-controls">
        <button class="quantity-btn" onclick="changeQuantity(${Number(item.id)}, -1)">-</button>
        <span class="quantity-display">${item.quantity}</span>
        <button class="quantity-btn" onclick="changeQuantity(${Number(item.id)}, 1)">+</button>
        <button class="remove-item" onclick="removeFromCart(${Number(item.id)})">&times;</button>
      </div>
    </div>
  `).join('');
  totalElement.textContent = cartItems
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
    .toFixed(2);
}

// Filter- und Sortier-Event-Listener
document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter();
  initializeCartDropdown();

  const searchInput = document.getElementById('searchInput');
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

  const clearCartBtn = document.getElementById('clearCart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      clearCart();
    });
  }
});

// Stelle sicher, dass changeQuantity, removeFromCart und clearCart global verfügbar sind:
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;