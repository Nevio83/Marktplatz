// Warenkorb-Initialisierung
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Make sure clearCart is globally available immediately
window.clearCart = function() {
  console.log('clearCart function called');
  try {
    cartItems = [];
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update counter and dropdown immediately
    if (typeof updateCartCounter === 'function') {
      updateCartCounter();
    } else {
      console.log('updateCartCounter function not available');
    }
    
    // Sofort ausblenden
    console.log('Cart cleared, hiding dropdown');
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown) {
      cartDropdown.classList.remove('show');
      cartDropdown.style.display = 'none';
    }
    
    // Show confirmation message
    if (typeof showAlert === 'function') {
      showAlert('Warenkorb wurde geleert');
    } else {
      alert('Warenkorb wurde geleert');
    }
    
    console.log('Cart cleared successfully');
  } catch (error) {
    console.error('Error in clearCart:', error);
    alert('Fehler beim Leeren des Warenkorbs: ' + error.message);
  }
};

// Wishlist-Initialisierung
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Produktdaten laden
async function loadProducts() {
  console.log('loadProducts function called');
  try {
    console.log('Fetching products.json...');
    const response = await fetch('products.json');
    console.log('Response status:', response.status);
    const products = await response.json();
    console.log('Products parsed:', products.length);
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

// Wishlist-Logik (bereits initialisiert oben)

function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function setWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function isInWishlist(productId) {
  return getWishlist().some(item => Number(item.id) === Number(productId));
}

function toggleWishlist(productId) {
  loadProducts().then(products => {
    const product = products.find(p => Number(p.id) === Number(productId));
    if (!product) {
      console.error('Produkt für die Wunschliste nicht gefunden! ID:', productId, products);
      alert('Produkt konnte nicht zur Wunschliste hinzugefügt werden.');
      return;
    }
    
    let wishlist = getWishlist();
    
    if (isInWishlist(productId)) {
      wishlist = wishlist.filter(item => Number(item.id) !== Number(productId));
      showAlert('Produkt von der Wunschliste entfernt', 'wishlist.html');
    } else {
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description
      });
      showAlert('Produkt zur Wunschliste hinzugefügt', 'wishlist.html');
    }
    
    setWishlist(wishlist);
    
    // Update only the specific wishlist button instead of re-rendering everything
    updateWishlistButtonState(productId);
  });
}

function updateWishlistButtonState(productId) {
  const button = document.querySelector(`[data-product-id="${productId}"] .wishlist-btn`);
  if (button) {
    if (isInWishlist(productId)) {
      button.classList.add('active');
      button.innerHTML = '<i class="bi bi-heart-fill"></i>';
    } else {
      button.classList.remove('active');
      button.innerHTML = '<i class="bi bi-heart"></i>';
    }
  }
}

// Produktgrid rendern (mit Herz oben rechts)
function renderProducts(products) {
  console.log('Rendering', products.length, 'products');
  console.log('Product grid element:', document.getElementById('productGrid'));
  const grid = document.getElementById('productGrid');
  if (!grid) {
    console.error('Product grid not found!');
    return; // Verhindert Fehler auf anderen Seiten
  }
  
  grid.innerHTML = products.map(product => {
    console.log('Rendering product:', product.id, product.name);
    return `
    <div class="col">
      <div class="card h-100 border-0 shadow-hover position-relative product-card" data-product-id="${product.id}">
        <button class="wishlist-btn" data-product-id="${product.id}" aria-label="Zur Wunschliste">
          <i class="bi ${isInWishlist(product.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
        <div class="ratio ratio-4x3 product-image-container">
          <img src="${product.image}" class="card-img-top object-fit-cover" alt="${product.name}" 
               style="opacity: 0.8; transform: scale(0.98); transition: opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; filter: brightness(1.02) contrast(1.05) saturate(1.1);">
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
                    data-price="${product.price}"
                    onclick="addToCart(${product.id}); return false;">
              <i class="bi bi-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  }).join('');
  
  console.log('Products rendered, initializing buttons...');
  initializeAddToCartButtons();
  initializeWishlistButtons();
  initializeProductCardClicks();
  observeProductCards();
  optimizeImages(); // Bilder nach dem Rendern optimieren
}

function observeProductCards() {
  const cards = document.querySelectorAll('.product-card');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(card => observer.observe(card));
}

// Add-to-cart Buttons initialisieren
function initializeAddToCartButtons() {
  // Warte kurz, um sicherzustellen, dass alle Elemente gerendert sind
  setTimeout(() => {
    const buttons = document.querySelectorAll('.add-to-cart');
    console.log('Found', buttons.length, 'add-to-cart buttons');
    
    buttons.forEach((button, index) => {
      const productId = button.dataset.productId;
      console.log(`Initializing button ${index} for product ${productId}`);
      
      // Entferne alle bestehenden Event Listener
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Füge den Event Listener zum neuen Button hinzu
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Button clicked for product:', productId);
        
        const productId = parseInt(this.dataset.productId);
        if (productId && !isNaN(productId)) {
          addToCart(productId);
        } else {
          console.error('Invalid product ID:', productId);
        }
      });
    });
  }, 100);
}

// Produktkarten-Klicks initialisieren
function initializeProductCardClicks() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Verhindere Navigation bei Klicks auf Buttons oder deren Kinder
      if (e.target.closest('.wishlist-btn') || 
          e.target.closest('.add-to-cart') || 
          e.target.classList.contains('add-to-cart') ||
          e.target.closest('button')) {
        return;
      }
      
      const productId = parseInt(card.dataset.productId);
      window.location.href = `produkte/produkt-${productId}.html`;
    });
    
    // Cursor-Pointer für bessere UX
    card.style.cursor = 'pointer';
  });
}

// Warenkorb-Funktionen
function addToCart(productId) {
  console.log('addToCart called with productId:', productId);
  
  if (!productId || isNaN(productId)) {
    console.error('Invalid product ID:', productId);
    return;
  }
  
  // Versuche zuerst, das Produkt aus dem localStorage zu laden (falls verfügbar)
  let products = JSON.parse(localStorage.getItem('allProducts') || '[]');
  
  if (products.length === 0) {
    // Wenn keine Produkte im localStorage sind, lade sie von der Datei
    loadProducts().then(loadedProducts => {
      console.log('Products loaded from file:', loadedProducts.length);
      // Speichere die Produkte im localStorage für zukünftige Verwendung
      localStorage.setItem('allProducts', JSON.stringify(loadedProducts));
      addProductToCart(loadedProducts, productId);
    }).catch(error => {
      console.error('Error loading products:', error);
      alert('Fehler beim Laden der Produkte.');
    });
  } else {
    console.log('Products loaded from localStorage:', products.length);
    addProductToCart(products, productId);
  }
}

function addProductToCart(products, productId) {
  console.log('Looking for product ID:', productId, 'in', products.length, 'products');
  
  const product = products.find(p => Number(p.id) === Number(productId));
  
  if (!product) {
    console.error('Product not found for ID:', productId);
    console.log('Available product IDs:', products.map(p => p.id));
    alert('Produkt konnte nicht gefunden werden.');
    return;
  }
  
  console.log('Found product:', product.name);
  
  // Always read from localStorage to ensure we have the latest data
  cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cartItems.find(item => Number(item.id) === Number(productId));

  if (existingItem) {
    existingItem.quantity++;
    console.log('Updated existing item quantity:', existingItem.quantity);
  } else {
    cartItems.push({ ...product, quantity: 1 });
    console.log('Added new item to cart');
  }

  // Speichere den aktuellen Warenkorb immer im localStorage
  localStorage.setItem('cart', JSON.stringify(cartItems));
  
  // Update counter and dropdown immediately
  updateCartCounter();
  
  // Show alert
  showAlert('Produkt wurde zum Warenkorb hinzugefügt');

  // --- NEU: Wenn der User auf cart.html ist, direkt die Seite aktualisieren ---
  if (window.location.pathname.endsWith('cart.html')) {
    if (typeof updateCartPage === 'function') {
      updateCartPage();
    } else if (typeof window.location.reload === 'function') {
      window.location.reload();
    }
  }
}

// Make updateCartCounter globally available
window.updateCartCounter = function() {
  const counter = document.getElementById('cartCounter');
  if (counter) {
    // Always read from localStorage to ensure we have the latest data
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = currentCart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    console.log('Updating cart counter - total items:', totalItems);
    
    // Update counter text
    counter.textContent = totalItems;
    
    // Show/hide counter based on total items
    if (totalItems === 0) {
      counter.style.display = 'none';
    } else {
      counter.style.display = 'flex';
    }
    
    // Force re-render of dropdown if it's currently open
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown && cartDropdown.classList.contains('show')) {
      if (typeof renderCartDropdown === 'function') {
        renderCartDropdown();
      }
    }
  } else {
    console.log('Cart counter element not found');
  }
};

// Make showAlert globally available
window.showAlert = function(message, redirectTo = 'cart.html') {
  const alert = document.createElement('div');
  alert.className = 'alert alert-success position-fixed end-0 m-4 shadow-lg fade show';
  alert.style.zIndex = '20000';
  alert.style.fontSize = '1rem';
  alert.style.minWidth = '160px';
  alert.style.maxWidth = '320px';
  alert.style.padding = '0.75rem 2rem';
  alert.style.textAlign = 'center';
  alert.style.borderRadius = '2rem';
  alert.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
  alert.style.background = 'linear-gradient(90deg, #4f8cff 0%, #38c6ff 100%)';
  alert.style.color = '#fff';
  alert.style.fontWeight = '500';
  alert.style.letterSpacing = '0.02em';
  alert.style.pointerEvents = 'auto';
  alert.style.position = 'fixed';
  alert.style.right = '2.5rem';
  alert.style.top = 'calc(56px + 1.2rem)';
  alert.style.cursor = 'pointer';
  alert.textContent = message;
  alert.addEventListener('click', () => {
    window.location.href = redirectTo;
  });
  document.body.appendChild(alert);
  setTimeout(() => {
    if (document.body.contains(alert)) {
      alert.classList.remove('show');
      alert.classList.add('fade');
      setTimeout(() => alert.remove(), 400);
    }
  }, 1700);
};

// changeQuantity function moved to cart.js to avoid duplication

// removeFromCart function moved to cart.js to avoid duplication

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
      // Always render fresh data when opening dropdown
      renderCartDropdown();
      cartDropdown.classList.toggle('show');
      // Sichtbarkeit für mobile Geräte absichern
      if (cartDropdown.classList.contains('show')) {
        cartDropdown.style.display = 'block';
      } else {
        cartDropdown.style.display = 'none';
      }
    });
  }
  if (closeCartDropdown && cartDropdown) {
    closeCartDropdown.addEventListener('click', (e) => {
      e.preventDefault();
      cartDropdown.classList.remove('show');
      cartDropdown.style.display = 'none'; // Overlay immer ausblenden
    });
  }
  
  // Initialize clear cart button
  const clearCartBtn = document.getElementById('clearCart');
  if (clearCartBtn) {
    console.log('Clear cart button found, adding event listener');
    // Remove any existing event listeners
    clearCartBtn.removeEventListener('click', clearCart);
    clearCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Clear cart button clicked');
      clearCart();
    });
  } else {
    console.log('Clear cart button not found');
  }
}

function renderCartDropdown() {
  console.log('renderCartDropdown called');
  cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  console.log('Cart items loaded:', cartItems);
  
  const body = document.getElementById('cartDropdownBody');
  const footer = document.getElementById('cartDropdownFooter');
  const totalElement = document.getElementById('cartTotal');

  if (!body || !footer || !totalElement) {
    console.error('Required cart dropdown elements not found:', {
      body: !!body,
      footer: !!footer,
      totalElement: !!totalElement
    });
    return;
  }

  if (cartItems.length === 0) {
    console.log('Cart is empty, showing empty state');
    footer.style.display = 'none';
    
    // Bei leerem Warenkorb: 3 zufällige Produktvorschläge anzeigen
    loadProducts().then(products => {
      if (products.length === 0) {
        body.innerHTML = `
          <div class="empty-cart text-center py-4" id="emptyCartMessage">
            <i class="bi bi-cart-x fs-1 text-muted"></i>
            <p class="text-muted mt-2">Ihr Warenkorb ist leer</p>
          </div>
        `;
        return;
      }
      
      // 3 zufällige Produkte auswählen
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const randomProducts = shuffled.slice(0, 3);
      
      body.innerHTML = `
        <div class="empty-cart text-center py-3" id="emptyCartMessage">
          <i class="bi bi-cart-x fs-1 text-muted"></i>
          <p class="text-muted mt-2 mb-3">Ihr Warenkorb ist leer</p>
          
          <!-- Zufällige Produktvorschläge -->
          <div class="mt-3">
            <h6 class="mb-2" style="color: #6c757d; font-weight: 600;"><i class="bi bi-lightbulb" style="color: #ffc107;"></i> Das könnte Ihnen gefallen</h6>
            ${randomProducts.map(product => `
              <div class="cart-item" style="margin-bottom: 0.5rem;">
                <img src="${product.image}" class="cart-item-image" alt="${product.name}">
                <div class="cart-item-details">
                  <div class="cart-item-name">${product.name}</div>
                  <div class="cart-item-price">€${product.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                  <button class="quantity-btn" onclick="addToCart(${product.id})" style="background: #007AFF; color: white; border: none; font-weight: 700; box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);">
                    <i class="bi bi-cart-plus"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });
    return;
  }
  
  console.log('Rendering cart items:', cartItems.length);
  footer.style.display = 'block';
  
  // Calculate total for display
  const total = cartItems.reduce((sum, item) => sum + (typeof item.price === 'number' ? item.price * item.quantity : 0), 0);
  console.log('Cart total calculated:', total);
  
  body.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <img src="${item.image}" class="cart-item-image" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">
          €${(typeof item.price === 'number' ? item.price.toFixed(2) : '0.00')} x 
          <span class="quantity-display">${item.quantity}</span> = 
          <strong>€${(typeof item.price === 'number' ? (item.price * item.quantity).toFixed(2) : '0.00')}</strong>
        </div>
      </div>
      <div class="cart-item-controls">
        ${item.bundleId ? `
          <div class="quantity-controls disabled">
            <span class="quantity-display">1</span>
          </div>
        ` : `
          <div class="quantity-controls" style="display: flex; align-items: center; gap: 4px;">
            <button class="quantity-btn" onclick="changeQuantity(${Number(item.id)}, -1)" style="cursor: pointer; pointer-events: auto;">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="changeQuantity(${Number(item.id)}, 1)" style="cursor: pointer; pointer-events: auto;">+</button>
          </div>
        `}
        <button class="remove-item" onclick="removeFromCart(${Number(item.id)})" style="cursor: pointer; pointer-events: auto;">&times;</button>
      </div>
    </div>
  `).join('');
  
  // Update total immediately
  totalElement.textContent = total.toFixed(2);
  console.log('Cart dropdown rendered successfully with total:', total.toFixed(2));
  
  // Re-initialize clear cart button after rendering
  setTimeout(() => {
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
      console.log('Re-initializing clear cart button');
      // Remove any existing event listeners
      const newClearCartBtn = clearCartBtn.cloneNode(true);
      clearCartBtn.parentNode.replaceChild(newClearCartBtn, clearCartBtn);
      
      newClearCartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Clear cart button clicked (re-initialized)');
        clearCart();
      });
    }
  }, 100);
}

// Wishlist-Buttons initialisieren
function initializeWishlistButtons() {
  document.querySelectorAll('.wishlist-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Verhindert, dass das Klick-Event zur Karte weitergeht
      const productId = parseInt(button.dataset.productId);
      toggleWishlist(productId);
    });
  });
}

// Filter- und Sortier-Event-Listener
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  console.log('Document ready state:', document.readyState);
  
  try {
    updateCartCounter();
    initializeCartDropdown();
    
    // Sofortige Platzhalter für fehlende Bilder anwenden
    applyPlaceholdersForMissingImages();

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

  // Speichere die Sucheingabe bei Enter und verhindere Seitenreload
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        localStorage.setItem('lastSearch', searchInput.value);
        updateFilters();
        searchInput.blur(); // Fokus entfernen
      }
    });
    // Optional: Beim Laden den letzten Suchbegriff wiederherstellen
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) {
      searchInput.value = lastSearch;
      updateFilters();
    }
  }

  // Initiales Laden und Rendern
  loadProducts().then(products => {
    console.log('Products loaded:', products.length, 'products');
    console.log('First few products:', products.slice(0, 3));
    
    // Speichere die Produkte im localStorage für bessere Verfügbarkeit
    localStorage.setItem('allProducts', JSON.stringify(products));
    console.log('Products saved to localStorage:', products.length);
    
    const filtered = filterProducts(
      products,
      searchInput ? searchInput.value : '',
      categoryFilter ? categoryFilter.value : 'Alle Kategorien'
    );
    console.log('Filtered products:', filtered.length);
    
    const sorted = sortProducts(
      filtered,
      priceSort ? priceSort.value : 'Aufsteigend'
    );
    console.log('Sorted products:', sorted.length);
    
    renderProducts(sorted);
    
    // Bilder optimieren und Platzhalter anwenden
    optimizeImages();
    setTimeout(applyPlaceholdersForMissingImages, 100); // Verzögerung für bessere Erkennung
    
    // Zusätzliche Button-Initialisierung nach einer kurzen Verzögerung
    setTimeout(() => {
      console.log('Additional button initialization...');
      initializeAddToCartButtons();
    }, 500);
  }).catch(error => {
    console.error('Error loading products:', error);
  });
  } catch (error) {
    console.error('Error in DOMContentLoaded:', error);
  }
});

// Bilder optimieren
function optimizeImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Fallback für fehlende Bilder mit verbessertem Design
    img.addEventListener('error', function() {
      // Prüfe ob das Bild wirklich fehlt (nicht nur noch lädt)
      if (this.src && !this.src.includes('data:') && !this.src.includes('blob:')) {
        // Entferne das alte src-Attribut
        this.removeAttribute('src');
        
        // Setze den Platzhalter-Hintergrund - Einheitlich wie auf PC
        this.style.background = '#f8fafc';
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
        this.style.color = '#2c3e50';
        this.style.fontSize = '4rem';
        this.style.fontWeight = '700';
        this.style.borderRadius = '16px 16px 0 0';
        this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.style.objectFit = 'contain';
        this.style.padding = '20px';
        
        // Füge das große Fragezeichen-Symbol hinzu (wie auf PC)
        this.innerHTML = '?';
        
        // Mobile Anpassungen für Platzhalter - aber einheitlich
        if (window.innerWidth <= 768) {
          this.style.fontSize = '3rem';
        }
        if (window.innerWidth <= 600) {
          this.style.fontSize = '2.5rem';
        }
        if (window.innerWidth <= 414) {
          this.style.fontSize = '2rem';
        }
        if (window.innerWidth <= 375) {
          this.style.fontSize = '1.8rem';
        }
      }
    });
    
    // Lade-Animation mit verbesserter Performance
    img.addEventListener('load', function() {
      this.style.opacity = '1';
      this.style.transform = 'scale(1)';
      this.style.filter = 'brightness(1.02) contrast(1.05) saturate(1.08)';
      
      // Entferne Platzhalter-Styles wenn Bild geladen ist
      this.style.background = '';
      this.style.display = '';
      this.style.alignItems = '';
      this.style.justifyContent = '';
      this.style.color = '';
      this.style.fontSize = '';
      this.style.fontWeight = '';
      this.style.borderRadius = '';
      this.style.boxShadow = '';
      this.style.position = '';
      this.style.overflow = '';
      this.style.objectFit = '';
      this.style.padding = '';
      this.innerHTML = '';
    });
    
    // Initiale Lade-Animation
    img.style.opacity = '0.8';
    img.style.transform = 'scale(0.98)';
    img.style.transition = 'opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease';
    
    // Bildqualität für mobile Geräte optimieren
    if (window.innerWidth <= 600) {
      img.style.imageRendering = '-webkit-optimize-contrast';
      img.style.imageRendering = 'crisp-edges';
    }
    
    // Prüfe ob das Bild bereits fehlerhaft ist (nur bei wirklich fehlenden Bildern)
    if (img.complete && img.naturalWidth === 0 && img.src && !img.src.includes('data:') && !img.src.includes('blob:')) {
      // Warte kurz und prüfe nochmal
      setTimeout(() => {
        if (img.naturalWidth === 0) {
          img.dispatchEvent(new Event('error'));
        }
      }, 100);
    }
  });
}

// Funktion zum sofortigen Anwenden von Platzhaltern für fehlende Bilder
function applyPlaceholdersForMissingImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Prüfe ob das Bild bereits fehlerhaft ist (nur bei wirklich fehlenden Bildern)
    if (img.complete && img.naturalWidth === 0 && img.src && !img.src.includes('data:') && !img.src.includes('blob:')) {
      // Warte kurz und prüfe nochmal, um sicherzustellen, dass das Bild wirklich fehlt
      setTimeout(() => {
        if (img.naturalWidth === 0) {
          // Entferne das alte src-Attribut
          img.removeAttribute('src');
          
          // Setze den Platzhalter-Hintergrund - Einheitlich wie auf PC
          img.style.background = '#f8fafc';
          img.style.display = 'flex';
          img.style.alignItems = 'center';
          img.style.justifyContent = 'center';
          img.style.color = '#2c3e50';
          img.style.fontSize = '4rem';
          img.style.fontWeight = '700';
          img.style.borderRadius = '16px 16px 0 0';
          img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          img.style.position = 'relative';
          img.style.overflow = 'hidden';
          img.style.objectFit = 'contain';
          img.style.padding = '20px';
          
          // Füge das große Fragezeichen-Symbol hinzu (wie auf PC)
          img.innerHTML = '?';
          
          // Mobile Anpassungen für Platzhalter - aber einheitlich
          if (window.innerWidth <= 768) {
            img.style.fontSize = '3rem';
          }
          if (window.innerWidth <= 600) {
            img.style.fontSize = '2.5rem';
          }
          if (window.innerWidth <= 414) {
            img.style.fontSize = '2rem';
          }
          if (window.innerWidth <= 375) {
            img.style.fontSize = '1.8rem';
          }
        }
      }, 200);
    }
  });
}

// Test-Funktion für die Browser-Konsole
window.testProduct1Button = function() {
  console.log('Testing Product 1 button...');
  const button = document.querySelector('.add-to-cart[data-product-id="1"]');
  if (button) {
    console.log('Product 1 button found:', button);
    console.log('Button text:', button.textContent);
    console.log('Button onclick:', button.onclick);
    console.log('Button data-product-id:', button.dataset.productId);
    
    // Test click
    button.click();
  } else {
    console.error('Product 1 button not found!');
    console.log('All add-to-cart buttons:', document.querySelectorAll('.add-to-cart'));
  }
};

// Test-Funktion für Cart Dropdown
window.testCartDropdown = function() {
  console.log('Testing cart dropdown functionality...');
  
  // Test cart counter
  const counter = document.getElementById('cartCounter');
  console.log('Cart counter element:', counter);
  console.log('Cart counter text:', counter ? counter.textContent : 'not found');
  
  // Test cart dropdown
  const dropdown = document.getElementById('cartDropdown');
  console.log('Cart dropdown element:', dropdown);
  console.log('Cart dropdown classes:', dropdown ? dropdown.className : 'not found');
  
  // Test cart dropdown body
  const body = document.getElementById('cartDropdownBody');
  console.log('Cart dropdown body:', body);
  console.log('Cart dropdown body HTML:', body ? body.innerHTML.substring(0, 200) + '...' : 'not found');
  
  // Test quantity buttons
  const quantityButtons = document.querySelectorAll('#cartDropdown .quantity-btn');
  console.log('Quantity buttons found:', quantityButtons.length);
  quantityButtons.forEach((btn, index) => {
    console.log(`Quantity button ${index}:`, btn);
    console.log(`Button onclick:`, btn.onclick);
    console.log(`Button text:`, btn.textContent);
  });
  
  // Test remove buttons
  const removeButtons = document.querySelectorAll('#cartDropdown .remove-item');
  console.log('Remove buttons found:', removeButtons.length);
  removeButtons.forEach((btn, index) => {
    console.log(`Remove button ${index}:`, btn);
    console.log(`Button onclick:`, btn.onclick);
    console.log(`Button text:`, btn.textContent);
  });
  
  // Test current cart state
  const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
  console.log('Current cart from localStorage:', currentCart);
  console.log('Cart items count:', currentCart.length);
};

// Test-Funktion für Empty Cart Verhalten
window.testEmptyCart = function() {
  console.log('Testing empty cart behavior...');
  
  // Leere den Warenkorb
  clearCart();
  
  // Prüfe den Zähler
  setTimeout(() => {
    const counter = document.getElementById('cartCounter');
    console.log('Cart counter after clearing:', counter ? counter.textContent : 'not found');
    console.log('Cart counter display:', counter ? counter.style.display : 'not found');
    
    // Füge ein Produkt hinzu
    testAddProduct1();
    
    setTimeout(() => {
      console.log('Cart counter after adding product:', counter ? counter.textContent : 'not found');
      console.log('Cart counter display:', counter ? counter.style.display : 'not found');
    }, 500);
  }, 500);
};

// Direkte Test-Funktion für Produkt 1
window.testAddProduct1 = function() {
  console.log('Directly adding product 1 to cart...');
  const product1 = {
    id: 1,
    name: "Elektronik Produkt 1",
    price: 10.00,
    category: "Elektronik",
    image: "produkt bilder/ware.png",
    description: "Innovative Technologie für Ihren Alltag."
  };
  
  const existingItem = cartItems.find(item => Number(item.id) === 1);
  if (existingItem) {
    existingItem.quantity++;
    console.log('Updated existing item quantity:', existingItem.quantity);
  } else {
    cartItems.push({ ...product1, quantity: 1 });
    console.log('Added new item to cart');
  }
  
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartCounter();
  renderCartDropdown();
  showAlert('Produkt wurde zum Warenkorb hinzugefügt');
  
  console.log('Product 1 added to cart successfully!');
};

// Stelle sicher, dass changeQuantity, removeFromCart und clearCart global verfügbar sind:
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.addToCart = addToCart;
window.addProductToCart = addProductToCart;
window.initializeAddToCartButtons = initializeAddToCartButtons;
window.renderProducts = renderProducts;
window.loadProducts = loadProducts;
window.testCartDropdown = testCartDropdown;
window.testEmptyCart = testEmptyCart;
window.testLiveUpdates = testLiveUpdates;
window.testClearCartButton = testClearCartButton;
window.testClearCartSimple = testClearCartSimple;

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.category-tile').forEach(tile => {
    tile.addEventListener('click', function(e) {
      e.preventDefault();
      const category = this.dataset.category;
      const filter = document.getElementById('categoryFilter');
      if (filter) {
        filter.value = category;
        filter.dispatchEvent(new Event('change'));
      }
      const grid = document.getElementById('productGrid');
      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  // NEU: 'Alle Produkte entdecken' Button zeigt wieder alle Produkte
  const allBtn = document.querySelector('a.btn.btn-outline-dark');
  if (allBtn) {
    allBtn.addEventListener('click', function(e) {
      const filter = document.getElementById('categoryFilter');
      if (filter) {
        filter.value = 'Alle Kategorien';
        filter.dispatchEvent(new Event('change'));
      }
    });
  }
});

// Test-Funktion für Live Updates
window.testLiveUpdates = function() {
  console.log('Testing live updates...');
  
  // Test 1: Add product and check counter
  console.log('=== Test 1: Adding product ===');
  testAddProduct1();
  
  setTimeout(() => {
    const counter = document.getElementById('cartCounter');
    console.log('Counter after adding product:', counter ? counter.textContent : 'not found');
    console.log('Counter display:', counter ? counter.style.display : 'not found');
    
    // Test 2: Open dropdown and check content
    console.log('=== Test 2: Opening dropdown ===');
    const cartButton = document.getElementById('cartButton');
    if (cartButton) {
      cartButton.click();
      
      setTimeout(() => {
        const dropdown = document.getElementById('cartDropdown');
        const body = document.getElementById('cartDropdownBody');
        const footer = document.getElementById('cartDropdownFooter');
        const total = document.getElementById('cartTotal');
        
        console.log('Dropdown visible:', dropdown ? dropdown.classList.contains('show') : 'not found');
        console.log('Dropdown body content length:', body ? body.innerHTML.length : 'not found');
        console.log('Footer visible:', footer ? footer.style.display : 'not found');
        console.log('Total amount:', total ? total.textContent : 'not found');
        
        // Test 3: Change quantity
        console.log('=== Test 3: Changing quantity ===');
        const quantityBtn = document.querySelector('#cartDropdown .quantity-btn');
        if (quantityBtn) {
          console.log('Quantity button found, clicking...');
          quantityBtn.click();
          
          setTimeout(() => {
            console.log('Counter after quantity change:', counter ? counter.textContent : 'not found');
            console.log('Total after quantity change:', total ? total.textContent : 'not found');
            
            // Test 4: Remove item
            console.log('=== Test 4: Removing item ===');
            const removeBtn = document.querySelector('#cartDropdown .remove-item');
            if (removeBtn) {
              console.log('Remove button found, clicking...');
              removeBtn.click();
              
              setTimeout(() => {
                console.log('Counter after removal:', counter ? counter.textContent : 'not found');
                console.log('Counter display after removal:', counter ? counter.style.display : 'not found');
                console.log('Dropdown visible after removal:', dropdown ? dropdown.classList.contains('show') : 'not found');
              }, 500);
            } else {
              console.log('Remove button not found');
            }
          }, 500);
        } else {
          console.log('Quantity button not found');
        }
      }, 500);
    } else {
      console.log('Cart button not found');
    }
  }, 500);
};

// Test-Funktion für Clear Cart Button
window.testClearCartButton = function() {
  console.log('Testing clear cart button...');
  
  // First, add some items to cart
  console.log('=== Step 1: Adding items to cart ===');
  testAddProduct1();
  
  setTimeout(() => {
    // Open dropdown
    console.log('=== Step 2: Opening dropdown ===');
    const cartButton = document.getElementById('cartButton');
    if (cartButton) {
      cartButton.click();
      
      setTimeout(() => {
        // Check if clear cart button exists
        console.log('=== Step 3: Checking clear cart button ===');
        const clearCartBtn = document.getElementById('clearCart');
        console.log('Clear cart button found:', !!clearCartBtn);
        
        if (clearCartBtn) {
          console.log('Clear cart button text:', clearCartBtn.textContent);
          console.log('Clear cart button HTML:', clearCartBtn.outerHTML);
          
          // Test clicking the button
          console.log('=== Step 4: Clicking clear cart button ===');
          clearCartBtn.click();
          
          setTimeout(() => {
            console.log('=== Step 5: Checking result ===');
            const counter = document.getElementById('cartCounter');
            const dropdown = document.getElementById('cartDropdown');
            
            console.log('Cart counter after clear:', counter ? counter.textContent : 'not found');
            console.log('Cart counter display:', counter ? counter.style.display : 'not found');
            console.log('Dropdown visible:', dropdown ? dropdown.classList.contains('show') : 'not found');
            
            // Check localStorage
            const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
            console.log('Cart in localStorage after clear:', currentCart);
            console.log('Cart items count:', currentCart.length);
          }, 500);
        } else {
          console.log('Clear cart button not found!');
        }
      }, 500);
    } else {
      console.log('Cart button not found!');
    }
  }, 500);
};

// Simple test function to check if clearCart is working
window.testClearCartSimple = function() {
  console.log('Testing clearCart function availability...');
  console.log('window.clearCart available:', typeof window.clearCart === 'function');
  console.log('window.updateCartCounter available:', typeof window.updateCartCounter === 'function');
  console.log('window.showAlert available:', typeof window.showAlert === 'function');
  
  if (typeof window.clearCart === 'function') {
    console.log('clearCart function is available, testing...');
    window.clearCart();
  } else {
    console.error('clearCart function is not available!');
  }
};

// Test function to check product loading
window.testProductLoading = function() {
  console.log('Testing product loading...');
  console.log('Product grid element:', document.getElementById('productGrid'));
  console.log('Category filter element:', document.getElementById('categoryFilter'));
  console.log('Price sort element:', document.getElementById('priceSort'));
  
  loadProducts().then(products => {
    console.log('Products loaded successfully:', products.length);
    console.log('First product:', products[0]);
    
    const filtered = filterProducts(products, '', 'Alle Kategorien');
    console.log('Filtered products:', filtered.length);
    
    const sorted = sortProducts(filtered, 'Aufsteigend');
    console.log('Sorted products:', sorted.length);
    
    renderProducts(sorted);
    console.log('Products rendered');
  }).catch(error => {
    console.error('Error in testProductLoading:', error);
  });
};