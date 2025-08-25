# CJ Dropshipping API - Vollständige Integration

## Übersicht

Dieses Projekt integriert **ALLE** CJ Dropshipping APIs basierend auf der offiziellen Dokumentation. Die Integration umfasst:

- ✅ **Authentifizierung** - Login, Token-Verwaltung, Logout
- ✅ **Produkte** - Suche, Details, Kategorien, Kommentare, Varianten, Lagerbestände
- ✅ **Product Sourcing** - Produktbeschaffung und Anfragen
- ✅ **Bestellungen** - Erstellen, Verwalten, Bestätigen, Löschen
- ✅ **Zahlungen** - Guthaben verwalten und Zahlungen
- ✅ **Logistik** - Sendungsverfolgung, Versandkosten berechnen
- ✅ **Disputes** - Streitfälle verwalten und lösen
- ✅ **Einstellungen** - Account-Einstellungen abrufen

## Installation

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren
Kopiere `.env.example` zu `.env` und fülle deine CJ Dropshipping API-Credentials ein:

```bash
cp .env.example .env
```

Bearbeite die `.env` Datei:
```env
# CJ Dropshipping API Configuration
CJ_API_KEY=your_cj_api_key_here
CJ_ACCESS_TOKEN=your_cj_access_token_here
CJ_EMAIL=your_cj_account_email@example.com
CJ_PASSWORD=your_cj_account_password
```

### 3. Server starten
```bash
npm start
```

## API Endpunkte

### Authentifizierung

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/authentication/getAccessToken` | POST | Zugriffstoken abrufen |
| `/authentication/refreshAccessToken` | POST | Token erneuern |
| `/authentication/logout` | POST | Abmelden |

### Produkte

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/products` | GET | Produktliste abrufen |
| `POST /api/cj/products/search` | POST | Produkte suchen |
| `GET /api/cj/categories` | GET | Produktkategorien |
| `GET /api/cj/product/:vid` | GET | Produktdetails per VID |
| `GET /api/cj/product/:vid/stock` | GET | Lagerbestand prüfen |

### Bestellungen

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/orders` | GET | Bestellungen abrufen |
| `POST /api/cj/orders/create` | POST | Neue Bestellung erstellen |
| `POST /api/cj/orders/:orderId/confirm` | POST | Bestellung bestätigen |
| `GET /api/cj/orders/:orderId` | GET | Bestelldetails |

### Logistik

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/track/:trackingNumber` | GET | Sendung verfolgen |
| `POST /api/cj/shipping/calculate` | POST | Versandkosten berechnen |

### Zahlungen

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/balance` | GET | Kontostand abrufen |

### Weitere Features

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `POST /api/cj/sourcing/create` | POST | Product Sourcing |
| `GET /api/cj/disputes` | GET | Disputes abrufen |
| `POST /api/cj/disputes/create` | POST | Dispute erstellen |
| `GET /api/cj/test` | GET | API-Verbindung testen |
| `GET /api/cj/methods` | GET | Verfügbare Methoden |

## Verwendung im Code

### Direkter Import
```javascript
const CJDropshippingAPI = require('./cj-dropshipping-api');
const cjAPI = new CJDropshippingAPI();

// Produkte abrufen
const products = await cjAPI.getProductList({ page: 1, pageSize: 20 });

// Bestellung erstellen
const order = await cjAPI.createOrderV2({
  orderNum: 'ORDER123',
  products: [
    { vid: 'product123', quantity: 2 }
  ],
  shippingInfo: {
    firstName: 'John',
    lastName: 'Doe',
    // ... weitere Adressdaten
  }
});
```

### Über HTTP-Endpunkte
```javascript
// Produkte abrufen
fetch('/api/cj/products?page=1&pageSize=20')
  .then(response => response.json())
  .then(data => console.log(data));

// Bestellung erstellen
fetch('/api/cj/orders/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderNum: 'ORDER123',
    products: [{ vid: 'product123', quantity: 2 }]
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Alle verfügbaren CJ API Methoden

### Authentifizierung
- `getAccessToken()` - Zugriffstoken abrufen
- `refreshAccessToken()` - Token erneuern
- `logout()` - Abmelden

### Produkte
- `getProductList(params)` - Produktliste
- `queryProducts(params)` - Produkte suchen
- `getProductCategory()` - Kategorien
- `getProductComments(productId)` - Kommentare abrufen
- `addProductComments(data)` - Kommentar hinzufügen
- `queryProductByVid(vid)` - Produkt per VID
- `queryProductVariant(productId)` - Produktvarianten
- `getProductStockByVid(vid)` - Lagerbestand

### Product Sourcing
- `queryProductSourcing(params)` - Sourcing abfragen
- `createProductSourcing(data)` - Sourcing erstellen

### Bestellungen
- `getShoppingOrderList(params)` - Bestellungen
- `createOrderV2(orderData)` - Bestellung erstellen
- `confirmOrder(orderId)` - Bestellung bestätigen
- `deleteOrder(orderId)` - Bestellung löschen
- `getOrderDetail(orderId)` - Bestelldetails

### Zahlungen
- `payBalance(data)` - Zahlung per Guthaben
- `getBalance()` - Kontostand

### Logistik
- `getTrackInfo(trackingNumber)` - Tracking-Info
- `trackInfo(trackingNumber)` - Erweiterte Tracking-Info
- `freightCalculate(data)` - Versandkosten
- `freightCalculateTip(data)` - Versandkosten-Tipp

### Disputes
- `getDisputeList(params)` - Dispute-Liste
- `createDispute(data)` - Dispute erstellen
- `cancelDispute(disputeId)` - Dispute stornieren
- `disputeProducts(params)` - Dispute-Produkte
- `disputeConfirmInfo(disputeId)` - Dispute-Bestätigung

### Einstellungen
- `getSettings()` - Account-Einstellungen

### Utilities
- `testConnection()` - Verbindung testen
- `getAvailableMethods()` - Verfügbare Methoden
- `batchRequest(requests)` - Batch-Anfragen

## Beispiele für komplexe Workflows

### 1. Vollständiger Bestellprozess
```javascript
// 1. Produkte suchen
const products = await cjAPI.queryProducts({
  keywords: 'smartphone',
  categoryId: 123
});

// 2. Produktdetails und Lagerbestand prüfen
const productDetails = await cjAPI.queryProductByVid(products.data[0].vid);
const stock = await cjAPI.getProductStockByVid(products.data[0].vid);

// 3. Versandkosten berechnen
const shippingCost = await cjAPI.freightCalculate({
  products: [{ vid: products.data[0].vid, quantity: 1 }],
  country: 'DE'
});

// 4. Bestellung erstellen
const order = await cjAPI.createOrderV2({
  orderNum: `ORDER-${Date.now()}`,
  products: [{ vid: products.data[0].vid, quantity: 1 }],
  shippingInfo: {
    firstName: 'Max',
    lastName: 'Mustermann',
    address: 'Musterstraße 123',
    city: 'Berlin',
    zip: '10115',
    country: 'DE'
  }
});

// 5. Bestellung bestätigen
await cjAPI.confirmOrder(order.data.orderId);
```

### 2. Batch-Verarbeitung
```javascript
// Mehrere API-Aufrufe gleichzeitig
const requests = [
  { endpoint: '/product/list', method: 'GET' },
  { endpoint: '/product/getCategory', method: 'GET' },
  { endpoint: '/shopping/pay/getBalance', method: 'GET' }
];

const results = await cjAPI.batchRequest(requests);
```

## Fehlerbehandlung

```javascript
try {
  const products = await cjAPI.getProductList();
} catch (error) {
  if (error.message.includes('authentication')) {
    // Token erneuern
    await cjAPI.refreshAccessToken();
    // Erneut versuchen
    const products = await cjAPI.getProductList();
  } else {
    console.error('API Error:', error.message);
  }
}
```

## Rate Limits

Beachte die CJ Dropshipping API Rate Limits:
- Standard: 1000 Anfragen pro Endpunkt
- Verwende die `batchRequest()` Methode für effiziente Verarbeitung

## Support

Bei Fragen zur CJ Dropshipping API:
- [CJ Dropshipping Developer Documentation](https://cjdropshipping.com/my.html#/apikey)
- Prüfe die API-Limits in deinem CJ Account
- Teste die Verbindung mit `GET /api/cj/test`

---

**Alle CJ Dropshipping APIs sind jetzt vollständig integriert und einsatzbereit! 🚀**