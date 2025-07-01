// Produktdaten laden
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Fehler beim Laden der Produkte:', error);
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
            ${Object.entries(product.variants).map(([key, values]) => 
              `<select class="form-select form-select-sm mb-2">
                ${values.map(v => `<option>${v}</option>`).join('')}
              </select>`
            ).join('')}
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="h5">€${product.price.toFixed(2)}</span>
            <button class="btn btn-primary" onclick="addToCart(${product.id})">
              In den Warenkorb
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Warenkorb-Initialisierung
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Produktdaten
const products = [
  { id: 1, name: 'Produkt 1', price: 19.99 },
  { id: 2, name: 'Produkt 2', price: 29.99 }
];

// Warenkorb-Funktionen
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cartItems.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.push({ ...product, quantity: 1 });
  }
  
  updateCart();
  showAlert('Produkt wurde zum Warenkorb hinzugefügt');
}

function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cartItems));
  renderCartItems();
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

// Event-Listener Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter();
  
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      addToCart(parseInt(button.dataset.productId));
    });
  });
});

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCounter();
});