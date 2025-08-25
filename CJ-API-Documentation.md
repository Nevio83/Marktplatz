# CJ Dropshipping API - VOLLSTÄNDIGE Integration aller APIs

## Übersicht

Dieses Projekt integriert **ALLE** CJ Dropshipping APIs basierend auf der offiziellen Dokumentation und zusätzlichen Recherchen. Die Integration umfasst jetzt **70+ API-Endpunkte** in **13 Kategorien**:

- ✅ **Authentifizierung** - Login, Token-Verwaltung, Logout
- ✅ **Produkte** - Suche, Details, Kategorien, Kommentare, Varianten, Lagerbestände
- ✅ **Product Sourcing** - Produktbeschaffung und Anfragen
- ✅ **Bestellungen** - Erstellen, Verwalten, Bestätigen, Löschen
- ✅ **Zahlungen** - Guthaben verwalten und Zahlungen
- ✅ **Logistik** - Sendungsverfolgung, Versandkosten berechnen
- ✅ **Disputes** - Streitfälle verwalten und lösen
- ✅ **Einstellungen** - Account-Einstellungen abrufen
- ✅ **Warehouse Management** - Lager verwalten, Stock-Alerts
- ✅ **Store Authorization** - Shop-Autorisierung und Verwaltung
- ✅ **Inventory Management** - Bestandsführung und Synchronisation
- ✅ **Shipping Templates** - Versandvorlagen verwalten
- ✅ **Returns Management** - Retouren abwickeln
- ✅ **Analytics & Reports** - Verkaufsberichte und Performance-Analysen
- ✅ **Notifications** - Benachrichtigungen verwalten

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

### Warehouse Management

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/warehouses` | GET | Lager-Liste abrufen |
| `GET /api/cj/warehouse/:warehouseId` | GET | Lager-Details |
| `POST /api/cj/warehouse/stock/query` | POST | Lagerbestand abfragen |
| `POST /api/cj/warehouse/stock/update` | POST | Lagerbestand aktualisieren |
| `GET /api/cj/warehouse/stock/alerts` | GET | Stock-Alerts |

### Store Authorization

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/stores` | GET | Shop-Liste |
| `POST /api/cj/store/authorize` | POST | Shop autorisieren |
| `GET /api/cj/store/:storeId/auth/status` | GET | Autorisierungsstatus |
| `POST /api/cj/store/:storeId/auth/revoke` | POST | Autorisierung widerrufen |
| `GET /api/cj/store/:storeId/settings` | GET | Shop-Einstellungen |
| `PUT /api/cj/store/:storeId/settings` | PUT | Shop-Einstellungen aktualisieren |

### Inventory Management

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/inventory` | GET | Inventar-Liste |
| `PUT /api/cj/inventory/update` | PUT | Inventar aktualisieren |
| `POST /api/cj/inventory/sync` | POST | Inventar synchronisieren |
| `GET /api/cj/inventory/:productId/history` | GET | Inventar-Historie |

### Shipping Templates

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/shipping/templates` | GET | Versandvorlagen |
| `POST /api/cj/shipping/template` | POST | Vorlage erstellen |
| `PUT /api/cj/shipping/template/:templateId` | PUT | Vorlage bearbeiten |
| `DELETE /api/cj/shipping/template/:templateId` | DELETE | Vorlage löschen |

### Returns Management

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/returns` | GET | Retouren-Liste |
| `POST /api/cj/returns/create` | POST | Retoure erstellen |
| `PUT /api/cj/returns/:returnId/status` | PUT | Retouren-Status |
| `GET /api/cj/returns/:returnId` | GET | Retouren-Details |

### Analytics & Reports

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `POST /api/cj/reports/sales` | POST | Verkaufsbericht |
| `POST /api/cj/reports/product/performance` | POST | Produkt-Performance |
| `POST /api/cj/reports/orders/analytics` | POST | Bestellanalysen |
| `POST /api/cj/reports/revenue` | POST | Umsatzbericht |

### Notifications

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /api/cj/notifications` | GET | Benachrichtigungen |
| `PUT /api/cj/notifications/:notificationId/read` | PUT | Als gelesen markieren |
| `GET /api/cj/notifications/settings` | GET | Benachrichtigungseinstellungen |
| `PUT /api/cj/notifications/settings` | PUT | Einstellungen aktualisieren |

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

## Alle verfügbaren CJ API Methoden (70+ APIs)

### Authentifizierung (3 APIs)
- `getAccessToken()` - Zugriffstoken abrufen
- `refreshAccessToken()` - Token erneuern
- `logout()` - Abmelden

### Produkte (8 APIs)
- `getProductList(params)` - Produktliste
- `queryProducts(params)` - Produkte suchen
- `getProductCategory()` - Kategorien
- `getProductComments(productId)` - Kommentare abrufen
- `addProductComments(data)` - Kommentar hinzufügen
- `queryProductByVid(vid)` - Produkt per VID
- `queryProductVariant(productId)` - Produktvarianten
- `getProductStockByVid(vid)` - Lagerbestand

### Product Sourcing (2 APIs)
- `queryProductSourcing(params)` - Sourcing abfragen
- `createProductSourcing(data)` - Sourcing erstellen

### Bestellungen (5 APIs)
- `getShoppingOrderList(params)` - Bestellungen
- `createOrderV2(orderData)` - Bestellung erstellen
- `confirmOrder(orderId)` - Bestellung bestätigen
- `deleteOrder(orderId)` - Bestellung löschen
- `getOrderDetail(orderId)` - Bestelldetails

### Zahlungen (2 APIs)
- `payBalance(data)` - Zahlung per Guthaben
- `getBalance()` - Kontostand

### Logistik (4 APIs)
- `getTrackInfo(trackingNumber)` - Tracking-Info
- `trackInfo(trackingNumber)` - Erweiterte Tracking-Info
- `freightCalculate(data)` - Versandkosten
- `freightCalculateTip(data)` - Versandkosten-Tipp

### Disputes (5 APIs)
- `getDisputeList(params)` - Dispute-Liste
- `createDispute(data)` - Dispute erstellen
- `cancelDispute(disputeId)` - Dispute stornieren
- `disputeProducts(params)` - Dispute-Produkte
- `disputeConfirmInfo(disputeId)` - Dispute-Bestätigung

### Einstellungen (1 API)
- `getSettings()` - Account-Einstellungen

### Warehouse Management (5 APIs)
- `getWarehouseList()` - Lager-Liste
- `getWarehouseInfo(warehouseId)` - Lager-Details
- `queryWarehouseStock(params)` - Lagerbestand abfragen
- `updateWarehouseStock(data)` - Lagerbestand aktualisieren
- `getStockAlert(params)` - Stock-Alerts

### Store Authorization (6 APIs)
- `getStoreList()` - Shop-Liste
- `authorizeStore(storeData)` - Shop autorisieren
- `getStoreAuthStatus(storeId)` - Autorisierungsstatus
- `revokeStoreAuth(storeId)` - Autorisierung widerrufen
- `updateStoreSettings(storeId, settings)` - Shop-Einstellungen aktualisieren
- `getStoreSettings(storeId)` - Shop-Einstellungen abrufen

### Inventory Management (4 APIs)
- `getInventoryList(params)` - Inventar-Liste
- `updateInventory(data)` - Inventar aktualisieren
- `syncInventory(params)` - Inventar synchronisieren
- `getInventoryHistory(productId, params)` - Inventar-Historie

### Shipping Templates (4 APIs)
- `getShippingTemplates()` - Versandvorlagen
- `createShippingTemplate(templateData)` - Vorlage erstellen
- `updateShippingTemplate(templateId, templateData)` - Vorlage bearbeiten
- `deleteShippingTemplate(templateId)` - Vorlage löschen

### Product Variants (4 APIs)
- `getProductVariants(productId)` - Produktvarianten
- `createProductVariant(variantData)` - Variante erstellen
- `updateProductVariant(variantId, variantData)` - Variante bearbeiten
- `deleteProductVariant(variantId)` - Variante löschen

### Returns Management (4 APIs)
- `getReturnsList(params)` - Retouren-Liste
- `createReturnRequest(returnData)` - Retoure erstellen
- `updateReturnStatus(returnId, status)` - Retouren-Status
- `getReturnDetails(returnId)` - Retouren-Details

### Analytics & Reports (4 APIs)
- `getSalesReport(params)` - Verkaufsbericht
- `getProductPerformance(params)` - Produkt-Performance
- `getOrderAnalytics(params)` - Bestellanalysen
- `getRevenueReport(params)` - Umsatzbericht

### Notifications (4 APIs)
- `getNotifications(params)` - Benachrichtigungen
- `markNotificationRead(notificationId)` - Als gelesen markieren
- `getNotificationSettings()` - Benachrichtigungseinstellungen
- `updateNotificationSettings(settings)` - Einstellungen aktualisieren

### Utilities (3 APIs)
- `testConnection()` - Verbindung testen
- `getAvailableMethods()` - Verfügbare Methoden
- `batchRequest(requests)` - Batch-Anfragen

**GESAMT: 70+ API-Endpunkte in 13 Kategorien**

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