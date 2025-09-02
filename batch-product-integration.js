/**
 * Batch Product Integration Script
 * Integrates multiple products from CJ Dropshipping and AliExpress into the marketplace
 */

require('dotenv').config();
const CJDropshippingAPI = require('./cj-dropshipping-api');
const fs = require('fs').promises;
const path = require('path');

class BatchProductIntegrator {
    constructor() {
        this.cjAPI = new CJDropshippingAPI();
        this.startingProductId = 13; // Start from product 13
        
        // Product definitions for Haushalt und Küche category
        this.products = [
            {
                id: 13,
                source: 'cj',
                url: 'https://cjdropshipping.com/product/desk-dispenser-electric-water-gallon-automatic-water-bottle-dispenser-rechargeable-water-dispenser-p-1621032671155597312.html',
                productId: '1621032671155597312',
                sku: 'CJHS1674158',
                nameDE: 'Elektrischer Wasserspender für Schreibtisch',
                nameEN: 'Desk Dispenser Electric Water Gallon Automatic Water Bottle Dispenser Rechargeable',
                price: 45.99,
                originalPrice: 65.99,
                description: 'Praktischer elektrischer Wasserspender für den Schreibtisch. Automatisches Pumpen, wiederaufladbar, perfekt für Büro und Zuhause.',
                features: [
                    'Automatisches Pumpen',
                    'Wiederaufladbar (USB)',
                    'Passt auf Standard-Wasserflaschen',
                    'Leise Bedienung',
                    'Einfache Installation'
                ],
                specifications: {
                    'Material': 'ABS Kunststoff',
                    'Akkulaufzeit': '30-40 Tage',
                    'Ladezeit': '3-4 Stunden',
                    'Flaschengrößen': '5-19 Liter',
                    'Abmessungen': '15 x 10 x 25 cm'
                }
            },
            {
                id: 14,
                source: 'cj',
                url: 'https://cjdropshipping.com/product/350ml-electric-juicer-blender-mixer-usb-rechargeable-machine-household-portable-blender-maker-cup-kitchen-tool-kit-p-1392009095543918592.html',
                productId: '1392009095543918592',
                sku: 'CJHS1392009',
                nameDE: '350ml Elektrischer Mixer USB Wiederaufladbar',
                nameEN: '350ml Electric Juicer Blender Mixer USB Rechargeable Machine Household Portable',
                price: 29.99,
                originalPrice: 39.99,
                description: 'Kompakter elektrischer Mixer mit 350ml Fassungsvermögen. USB-wiederaufladbar, perfekt für Smoothies und Säfte unterwegs.',
                features: [
                    '350ml Fassungsvermögen',
                    'USB-wiederaufladbar',
                    'Tragbar und kompakt',
                    'Einfache Reinigung',
                    'Sicherheitsverschluss'
                ],
                specifications: {
                    'Kapazität': '350ml',
                    'Leistung': '45W',
                    'Ladezeit': '2-3 Stunden',
                    'Betriebszeit': '15-20 Zyklen',
                    'Material': 'BPA-freier Kunststoff'
                }
            },
            {
                id: 15,
                source: 'cj',
                url: 'https://cjdropshipping.com/product/garlic-crusher-onion-chopper-multipeler-vegetables-chopper-manual-garlic-press-machine-garlic-squeezer-kitchen-gadget-p-1633393678565781504.html',
                productId: '1633393678565781504',
                sku: 'CJHS1633393',
                nameDE: 'Multifunktions Gemüseschneider Knoblauchpresse',
                nameEN: 'Garlic Crusher Onion Chopper Multipeler Vegetables Chopper Manual Garlic Press Machine',
                price: 19.99,
                originalPrice: 29.99,
                description: 'Vielseitiger manueller Gemüseschneider für Knoblauch, Zwiebeln und andere Gemüse. Einfach zu bedienen und zu reinigen.',
                features: [
                    'Multifunktional',
                    'Manuelle Bedienung',
                    'Einfache Reinigung',
                    'Platzsparend',
                    'Scharfe Klingen'
                ],
                specifications: {
                    'Material': 'Edelstahl + ABS',
                    'Klingenanzahl': '3 Klingen',
                    'Abmessungen': '12 x 8 x 6 cm',
                    'Gewicht': '200g',
                    'Spülmaschinenfest': 'Ja'
                }
            },
            {
                id: 16,
                source: 'aliexpress',
                url: 'https://de.aliexpress.com/item/1005007209233492.html',
                productId: '1005007209233492',
                sku: 'ALI1005007209',
                nameDE: 'Luft Wasser Flasche mit Pumpe',
                nameEN: 'Air Water Bottle with Pump',
                price: 24.99,
                originalPrice: 34.99,
                description: 'Innovative Luft-Wasser-Flasche mit integrierter Pumpe. Ideal für Sport und Outdoor-Aktivitäten.',
                features: [
                    'Integrierte Luftpumpe',
                    'BPA-frei',
                    'Auslaufsicher',
                    'Ergonomisches Design',
                    'Leicht zu reinigen'
                ],
                specifications: {
                    'Kapazität': '750ml',
                    'Material': 'Tritan Kunststoff',
                    'Gewicht': '180g',
                    'Temperaturbereich': '-10°C bis 96°C',
                    'Abmessungen': '25 x 7 cm'
                }
            },
            {
                id: 17,
                source: 'aliexpress',
                url: 'https://de.aliexpress.com/item/1005008666113495.html',
                productId: '1005008666113495',
                sku: 'ALI1005008666',
                nameDE: '10-1 Stück Aroma-Pads Kaffeefilter',
                nameEN: '10-1 Piece Aroma Pads Coffee Filter',
                price: 12.99,
                originalPrice: 19.99,
                description: 'Hochwertige Aroma-Pads für perfekten Kaffeegenuss. 10er Pack für langanhaltenden Vorrat.',
                features: [
                    '10 Stück im Set',
                    'Optimale Aromaextraktion',
                    'Umweltfreundlich',
                    'Universell kompatibel',
                    'Einfache Anwendung'
                ],
                specifications: {
                    'Packungsinhalt': '10 Stück',
                    'Material': 'Papierfilter',
                    'Kompatibilität': 'Standard Kaffeemaschinen',
                    'Durchmesser': '70mm',
                    'Filterstärke': 'Medium'
                }
            },
            {
                id: 18,
                source: 'aliexpress',
                url: 'https://de.aliexpress.com/item/1005007317504326.html',
                productId: '1005007317504326',
                sku: 'ALI1005007317',
                nameDE: 'Drahtlose elektrische tragbare Espressomaschine',
                nameEN: 'Wireless Electric Portable Espresso Machine',
                price: 89.99,
                originalPrice: 129.99,
                description: 'Tragbare drahtlose Espressomaschine für perfekten Espresso überall. Wiederaufladbar und kompakt.',
                features: [
                    'Drahtlos und tragbar',
                    'Wiederaufladbar',
                    'Kompaktes Design',
                    '15 Bar Druck',
                    'Schnelle Aufheizung'
                ],
                specifications: {
                    'Druck': '15 Bar',
                    'Tankkapazität': '80ml',
                    'Akkulaufzeit': '5-8 Espresso',
                    'Aufheizzeit': '3-4 Minuten',
                    'Gewicht': '500g'
                }
            },
            {
                id: 19,
                source: 'aliexpress',
                url: 'https://de.aliexpress.com/item/1005008248127286.html',
                productId: '1005008248127286',
                sku: 'ALI1005008248',
                nameDE: 'Digitale Küchenwaage LED-Anzeige',
                nameEN: 'Digital Kitchen Scale LED Display',
                price: 22.99,
                originalPrice: 32.99,
                description: 'Präzise digitale Küchenwaage mit LED-Anzeige. Bis 5kg Tragkraft mit hoher Genauigkeit.',
                features: [
                    'LED-Anzeige',
                    'Bis 5kg Tragkraft',
                    'Tara-Funktion',
                    'Auto-Abschaltung',
                    'Verschiedene Einheiten'
                ],
                specifications: {
                    'Tragkraft': '5kg',
                    'Genauigkeit': '1g',
                    'Display': 'LED',
                    'Einheiten': 'g, kg, lb, oz',
                    'Batterie': '2x AAA'
                }
            }
        ];
    }

    /**
     * Extract product ID from URL
     */
    extractProductId(url, source) {
        if (source === 'cj') {
            const match = url.match(/p-(\d+)\.html/);
            return match ? match[1] : null;
        } else if (source === 'aliexpress') {
            const match = url.match(/item\/(\d+)\.html/);
            return match ? match[1] : null;
        }
        return null;
    }

    /**
     * Get product details from APIs
     */
    async getProductDetails(product) {
        try {
            console.log(`🔍 Fetching details for: ${product.nameDE}`);
            
            if (product.source === 'cj') {
                // Try CJ API first
                try {
                    const result = await this.cjAPI.queryProducts({
                        productSku: product.sku,
                        pageNum: 1,
                        pageSize: 1
                    });

                    if (result && result.data && result.data.list.length > 0) {
                        console.log(`✅ Found ${product.nameDE} in CJ API`);
                        return { ...product, apiData: result.data.list[0] };
                    }
                } catch (error) {
                    console.log(`⚠️ CJ API failed for ${product.nameDE}, using mock data`);
                }
            }
            
            // Return product with mock data
            console.log(`📝 Using predefined data for: ${product.nameDE}`);
            return product;
            
        } catch (error) {
            console.error(`❌ Error fetching ${product.nameDE}:`, error.message);
            return product;
        }
    }

    /**
     * Convert product to marketplace format
     */
    convertToMarketplaceFormat(product) {
        const supplier = product.source === 'cj' ? 'CJ Dropshipping' : 'AliExpress';
        const shippingTime = product.source === 'cj' ? '7-15 Werktage' : '10-20 Werktage';
        
        return {
            id: product.id,
            name: product.nameDE,
            nameEn: product.nameEN,
            price: product.price,
            originalPrice: product.originalPrice,
            image: "../produkt bilder/ware.png", // Default image, can be updated later
            category: "Haushalt und Küche",
            categoryId: "haushalt-kueche",
            description: product.description,
            features: product.features,
            specifications: product.specifications,
            productId: product.productId,
            sku: product.sku,
            supplier: supplier,
            source: product.source,
            sourceUrl: product.url,
            inStock: true,
            shippingTime: shippingTime,
            tags: this.generateTags(product.nameDE)
        };
    }

    /**
     * Generate tags from product name
     */
    generateTags(productName) {
        const name = productName.toLowerCase();
        const tags = [];
        
        if (name.includes('wasser')) tags.push('wasser', 'trinken');
        if (name.includes('mixer') || name.includes('blender')) tags.push('mixer', 'smoothie', 'küche');
        if (name.includes('schneider') || name.includes('chopper')) tags.push('schneiden', 'gemüse', 'küche');
        if (name.includes('kaffee') || name.includes('espresso')) tags.push('kaffee', 'espresso', 'getränke');
        if (name.includes('waage')) tags.push('wiegen', 'backen', 'küche');
        if (name.includes('elektrisch')) tags.push('elektrisch', 'automatisch');
        if (name.includes('tragbar')) tags.push('tragbar', 'mobil');
        
        return tags;
    }

    /**
     * Create product page HTML
     */
    async createProductPage(product) {
        const template = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name} - Marktplatz</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="../styles.css" rel="stylesheet">
    <link href="haushalt-kueche.css" rel="stylesheet">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand fw-bold" href="../index.html">
                <i class="bi bi-shop"></i> Marktplatz
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="../index.html">Startseite</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="../infos/kategorien.html">Kategorien</a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="../cart.html">
                            <i class="bi bi-cart"></i> Warenkorb (<span id="cart-count">0</span>)
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../wishlist.html">
                            <i class="bi bi-heart"></i> Wunschliste
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Produkt Hero Section -->
    <section class="product-hero">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="display-4 fw-bold mb-3">${product.name}</h1>
                    <p class="lead mb-4">${product.description}</p>
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <span class="price-tag">€${product.price}</span>
                        ${product.originalPrice ? `<span class="text-muted text-decoration-line-through">€${product.originalPrice}</span>` : ''}
                        <span class="badge bg-success">Kostenloser Versand in Europa</span>
                    </div>
                    <button class="btn btn-light btn-lg me-3 add-to-cart" id="cartBtn">
                        <i class="bi bi-cart-plus"></i> In den Warenkorb
                    </button>
                    <button class="btn btn-outline-light btn-lg wishlist-style-btn wishlist-button" id="wishlistBtn">
                        <i class="bi bi-heart"></i> Merken
                    </button>
                </div>
                <div class="col-lg-6 text-center">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid product-image" style="max-height: 400px;">
                </div>
            </div>
        </div>
    </section>

    <!-- Produkt Details -->
    <section class="py-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-8">
                    <h2 class="mb-4">Produktbeschreibung</h2>
                    <p class="lead mb-4">${product.description}</p>
                    
                    <h3>Hauptmerkmale</h3>
                    <ul class="list-unstyled">
                        ${product.features.map(feature => `<li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>${feature}</li>`).join('')}
                    </ul>

                    <h3 class="mt-4">Technische Spezifikationen</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Kategorie:</strong> ${product.category}</p>
                            <p><strong>Artikelnummer:</strong> ${product.id.toString().padStart(3, '0')}</p>
                            <p><strong>SKU:</strong> ${product.sku}</p>
                            <p><strong>Preis:</strong> €${product.price}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Verfügbarkeit:</strong> Auf Lager</p>
                            <p><strong>Lieferzeit:</strong> ${product.shippingTime}</p>
                            <p><strong>Lieferant:</strong> ${product.supplier}</p>
                        </div>
                    </div>

                    ${Object.entries(product.specifications).map(([key, value]) => 
                        `<p><strong>${key}:</strong> ${value}</p>`
                    ).join('')}
                </div>
                
                <div class="col-lg-4">
                    <div class="quick-order-card d-none d-lg-block">
                        <div class="quick-order-header">
                            <h4>Schnellbestellung</h4>
                        </div>
                        <div class="quick-order-body">
                            <div class="quantity-section">
                                <label class="quantity-label">Menge:</label>
                                <div class="quantity-input-group">
                                    <button class="quantity-btn" onclick="decreaseQuantity(event)">-</button>
                                    <input type="number" class="quantity-input" id="quantity" value="1" min="1" max="10">
                                    <button class="quantity-btn" onclick="increaseQuantity(event)">+</button>
                                </div>
                            </div>
                            
                            <div class="price-section">
                                <div class="current-price">€${product.price}</div>
                                <div class="total-price">Gesamt: <span id="totalPrice">€${product.price}</span></div>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="buy-now-btn add-to-cart" id="buyNowBtn" onclick="addToCartWithQuantity(event)">
                                    <i class="bi bi-cart-plus"></i> Jetzt kaufen
                                </button>
                                <button class="wishlist-btn wishlist-style-btn wishlist-button" onclick="toggleWishlist(product)">
                                    <i class="bi bi-heart"></i> Zur Wunschliste hinzufügen
                                </button>
                            </div>
                            
                            <div class="features-section">
                                <ul class="features-list">
                                    <li><i class="bi bi-truck"></i> Kostenloser Versand in Europa</li>
                                    <li><i class="bi bi-shield-check"></i> Garantie inklusive</li>
                                    <li><i class="bi bi-arrow-return-left"></i> 30 Tage Rückgaberecht</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Ähnliche Produkte -->
    <section class="py-5 similar-products-section">
        <div class="container">
            <div class="section-header text-center mb-5">
                <h2 class="section-title">Ähnliche Produkte</h2>
                <p class="section-subtitle">Entdecken Sie weitere Produkte, die Ihnen gefallen könnten</p>
            </div>
            <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
                <div class="col">
                    <div class="similar-product-card" onclick="window.location.href='produkt-10.html'">
                        <div class="product-image-wrapper">
                            <img src="../produkt bilder/ware.png" class="product-image" alt="Haushalt und Küche Produkt 1">
                        </div>
                        <div class="product-info">
                            <h5 class="product-title">Haushalt und Küche Produkt 1</h5>
                            <div class="price-container"><span class="current-price">€15.00</span></div>
                            <div class="view-product-btn">
                                <span>Jetzt ansehen</span>
                                <i class="bi bi-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; 2024 Marktplatz - Alle Rechte vorbehalten</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../cart.js"></script>
    
    <script>
        // Produktdaten für diese Seite
        const product = ${JSON.stringify(product, null, 8)};

        // Bundles dynamisch laden
        document.addEventListener('DOMContentLoaded', function() {
            loadBundles();
        });

        function loadBundles() {
            // Bundle-Logik hier implementieren
        }
    </script>
</body>
</html>`;

        try {
            const filePath = path.join(__dirname, 'produkte', `produkt-${product.id}.html`);
            await fs.writeFile(filePath, template);
            console.log(`✅ Product page created: produkt-${product.id}.html`);
        } catch (error) {
            console.error(`❌ Error creating product page for ${product.name}:`, error.message);
        }
    }

    /**
     * Update products.json with all new products
     */
    async updateProductsJson(products) {
        try {
            const productsPath = path.join(__dirname, 'products.json');
            let existingProducts = [];

            // Read existing products
            try {
                const data = await fs.readFile(productsPath, 'utf8');
                existingProducts = JSON.parse(data);
            } catch (error) {
                console.log('📝 Creating new products.json file');
            }

            // Add new products
            existingProducts.push(...products);

            // Write back to file
            await fs.writeFile(productsPath, JSON.stringify(existingProducts, null, 2));
            console.log(`✅ Added ${products.length} products to products.json`);
        } catch (error) {
            console.error('❌ Error updating products.json:', error.message);
        }
    }

    /**
     * Main batch integration process
     */
    async run() {
        try {
            console.log('🚀 Starting batch product integration...');
            console.log(`📦 Processing ${this.products.length} products for Haushalt und Küche category`);

            const processedProducts = [];

            // Process each product
            for (const product of this.products) {
                console.log(`\n--- Processing Product ${product.id}: ${product.nameDE} ---`);
                
                // Get product details (API or mock)
                const productWithDetails = await this.getProductDetails(product);
                
                // Convert to marketplace format
                const marketplaceProduct = this.convertToMarketplaceFormat(productWithDetails);
                
                // Create product page
                await this.createProductPage(marketplaceProduct);
                
                processedProducts.push(marketplaceProduct);
                
                console.log(`✅ Completed: ${product.nameDE}`);
                
                // Small delay to avoid overwhelming APIs
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Update products.json with all products
            await this.updateProductsJson(processedProducts);

            console.log('\n🎉 Batch integration completed successfully!');
            console.log(`📄 Created ${processedProducts.length} product pages`);
            console.log('📋 Product Summary:');
            
            processedProducts.forEach(product => {
                console.log(`  - ${product.name} (€${product.price}) - ${product.supplier}`);
            });

            return processedProducts;
        } catch (error) {
            console.error('❌ Batch integration failed:', error.message);
            throw error;
        }
    }
}

// Run integration if script is executed directly
if (require.main === module) {
    const integrator = new BatchProductIntegrator();
    integrator.run().catch(console.error);
}

module.exports = BatchProductIntegrator;
