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

// Warenkorb Dropdown Funktionalität
function initializeCartDropdown() {
    const cartButton = document.getElementById('cartButton');
    const cartDropdown = document.getElementById('cartDropdown');
    const closeButton = document.getElementById('closeCartDropdown');
    const clearCartButton = document.getElementById('clearCart');

    // Dropdown öffnen/schließen
    cartButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCartDropdown();
    });

    // Dropdown schließen
    closeButton.addEventListener('click', () => {
        hideCartDropdown();
    });

    // Warenkorb leeren
    clearCartButton.addEventListener('click', () => {
        if (confirm('Möchten Sie wirklich alle Artikel aus dem Warenkorb entfernen?')) {
            cartItems = [];
            updateCart();
            renderCartDropdown();
            showAlert('Warenkorb wurde geleert');
        }
    });

    // Klick außerhalb schließt Dropdown
    document.addEventListener('click', (e) => {
        if (!cartDropdown.contains(e.target) && !cartButton.contains(e.target)) {
            hideCartDropdown();
        }
    });
}

function toggleCartDropdown() {
    const dropdown = document.getElementById('cartDropdown');
    if (dropdown.classList.contains('show')) {
        hideCartDropdown();
    } else {
        showCartDropdown();
    }
}

function showCartDropdown() {
    const dropdown = document.getElementById('cartDropdown');
    renderCartDropdown();
    dropdown.classList.add('show');
}

function hideCartDropdown() {
    const dropdown = document.getElementById('cartDropdown');
    dropdown.classList.remove('show');
}

function renderCartDropdown() {
    const body = document.getElementById('cartDropdownBody');
    const footer = document.getElementById('cartDropdownFooter');
    const emptyMessage = document.getElementById('emptyCartMessage');
    const totalElement = document.getElementById('cartTotal');

    if (cartItems.length === 0) {
        emptyMessage.style.display = 'block';
        footer.style.display = 'none';
        body.innerHTML = '';
        body.appendChild(emptyMessage);
    } else {
        emptyMessage.style.display = 'none';
        footer.style.display = 'block';
        
        body.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <img src="${item.image || 'placeholder-product.jpg'}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">
                        <i class="bi bi-dash"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">
                        <i class="bi bi-plus"></i>
                    </button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        totalElement.textContent = calculateTotal();
    }
}

function changeQuantity(productId, change) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            renderCartDropdown();
        }
    }
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    updateCart();
    renderCartDropdown();
    showAlert('Artikel wurde entfernt');
}

// Bestehende updateCart Funktion erweitern
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCounter();
    // Dropdown aktualisieren falls geöffnet
    const dropdown = document.getElementById('cartDropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        renderCartDropdown();
    }
}

// DOMContentLoaded Event erweitern
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    initializeCartDropdown(); // Neue Zeile hinzufügen
    
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

// Animations-Trigger für Produktkarten
const cards = document.querySelectorAll('.card');
cards.forEach(card => card.style.opacity = '0');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.classList.add('animated');
    }
  });
}, { threshold: 0.15 });

cards.forEach(card => observer.observe(card));

// Mobile-Anpassung
window.matchMedia('(max-width: 768px)').addListener(e => {
  if(e.matches) {
    observer.options.threshold = 0.05;
  }
});