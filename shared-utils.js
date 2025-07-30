// Shared utility functions for all product pages
// This file eliminates code duplication across product HTML files

// Cart functions
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => Number(item.id) === Number(product.id));
  if (existing) {
    existing.quantity += product.quantity || 1;
  } else {
    cart.push({ ...product, quantity: product.quantity || 1 });
  }
  setCart(cart);
}

function addToCartAndRedirect(product) {
  const productToAdd = {
    ...product,
    quantity: 1
  };
  addToCart(productToAdd);
  window.location.href = '../cart.html';
}

function addToCartWithQuantity(product, quantity) {
  const productToCart = {
    ...product,
    quantity: quantity
  };
  addToCart(productToCart);
  showNotification('Produkt zum Warenkorb hinzugefügt');
}

// Wishlist functions
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function setWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function isInWishlist(productId) {
  return getWishlist().some(item => Number(item.id) === Number(productId));
}

function toggleWishlist(productId, product) {
  let wishlist = getWishlist();
  
  if (isInWishlist(productId)) {
    wishlist = wishlist.filter(item => Number(item.id) !== Number(productId));
    showNotification('Produkt von der Wunschliste entfernt');
  } else {
    wishlist.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description
    });
    showNotification('Produkt zur Wunschliste hinzugefügt');
  }
  
  setWishlist(wishlist);
  updateWishlistButton();
}

function updateWishlistButton() {
  const btn = document.getElementById('wishlistBtn');
  if (!btn) return;
  if (isInWishlist(product.id)) {
    btn.classList.add('active');
    btn.innerHTML = '<i class="bi bi-heart-fill"></i> Entfernen';
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<i class="bi bi-heart"></i> Zur Wunschliste';
  }
}

// Quantity functions
function increaseQuantity() {
  const input = document.getElementById('quantity');
  const currentValue = parseInt(input.value, 10) || 1;
  if (currentValue < 10) {
    input.value = currentValue + 1;
    updateTotalPrice();
  }
}

function decreaseQuantity() {
  const input = document.getElementById('quantity');
  const currentValue = parseInt(input.value, 10) || 1;
  if (currentValue > 1) {
    input.value = currentValue - 1;
    updateTotalPrice();
  }
}

function updateTotalPrice() {
  const quantity = parseInt(document.getElementById('quantity').value, 10) || 1;
  const total = (product.price * quantity).toFixed(2);
  document.getElementById('totalPrice').textContent = total;
}

// Notification function
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} position-fixed`;
  notification.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-radius: 8px;
  `;
  notification.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
      <span>${message}</span>
      <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}