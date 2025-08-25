require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const path = require('path');
const sgMail = require('@sendgrid/mail');
const CJDropshippingAPI = require('./cj-dropshipping-api');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize CJ Dropshipping API
const cjAPI = new CJDropshippingAPI();

const app = express();
app.use(express.json());

// Statische Dateien (HTML, CSS, JS, Bilder) ausliefern
app.use(express.static(path.join(__dirname)));

app.post('/api/create-checkout-session', async (req, res) => {
  const { cart } = req.body;
  const line_items = cart.map(item => {
    if (item.id === 1) {
      return {
        price: 'price_XXXXXXXXXXXXXXXXXXXXXXXX',
        quantity: item.quantity,
      };
    }
    return {
      price_data: {
        currency: 'eur',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/cart.html',
    });
    // Stripe Checkout Link (z.B. für Debugging oder manuelle Weiterleitung)
    console.log('Stripe Checkout Link:', session.url);
    res.json({ id: session.id, url: session.url }); // session.url ist der Stripe-Zahlungslink
  } catch (err) {
    // Stripe gibt oft einen hilfreichen Fehlertext zurück!
    console.error('Stripe Checkout Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Stripe Webhook für Zahlungsbestätigung
app.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const msg = {
        to: session.customer_details.email,
        from: process.env.SENDER_EMAIL,
        reply_to: process.env.SUPPORT_EMAIL,
        subject: 'Zahlungsbestätigung - Marktplatz',
        text: `Vielen Dank für Ihre Bestellung #${session.id}!\n\nIhre Zahlung wurde erfolgreich verarbeitet.`,        html: `<strong>Bestellbestätigung #${session.id}</strong>
          <p>Ihre Zahlung wurde erfolgreich verarbeitet und wir bereiten den Versand vor.</p>`
      };
      await sgMail.send(msg);
    }
    res.status(200).end();
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Legacy E-Mail-Endpunkt (kann später entfernt werden)
app.post('/api/send-confirmation', async (req, res) => {
  try {
    const { email, orderId } = req.body;
    
    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL,
      reply_to: process.env.SUPPORT_EMAIL,
      subject: 'Bestellbestätigung - Marktplatz',
      text: `Vielen Dank für Ihre Bestellung #${orderId}!\n\nWir bearbeiten Ihre Bestellung und senden sie innerhalb von 2 Werktagen zu.`,
      html: `<strong>Bestellbestätigung #${orderId}</strong>
        <p>Wir haben Ihre Zahlung erhalten und bearbeiten den Versand.</p>`
    };

    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    console.error('E-Mail-Fehler:', error);
    res.status(500).json({ error: 'E-Mail-Versand fehlgeschlagen' });
  }
});

app.post('/api/create-payment-intent', async (req, res) => {
  const { cart, email, country, city, firstname, lastname } = req.body;
  let amount = 0;
  for (const item of cart) {
    if (item.id === 1) {
      amount += 1000 * item.quantity; // 10.00 EUR * 100
    } else {
      amount += Math.round((item.price || 0) * 100) * item.quantity;
    }
  }

  // Versandkosten serverseitig basierend auf dem Land berechnen
  const europeanCountries = ['DE', 'AT', 'CH', 'FR', 'IT', 'ES', 'NL', 'BE', 'GB'];
  const shippingCost = europeanCountries.includes(country) ? 0 : 499;
  amount += shippingCost;

  try {
    if (amount < 50) {
      return res.status(400).json({ error: 'Gesamtbetrag zu niedrig für Stripe.' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      receipt_email: email,
      description: 'Marktplatz Bestellung',
      payment_method_types: ['card'],
      metadata: {
        customer_name: `${firstname || ''} ${lastname || ''}`.trim(),
        customer_city: city || '',
        customer_country: country || '',
        order_source: 'web'
      }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kontaktformular-Endpunkt
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Bitte Name, E-Mail und Nachricht angeben.' });
    }
    const msg = {
      to: process.env.SUPPORT_EMAIL,
      from: process.env.SENDER_EMAIL,
      reply_to: email,
      subject: 'Kontaktanfrage – Marktplatz',
      text: `Von: ${name} <${email}>
Nachricht:\n${message}`,
      html: `<p><strong>Von:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br>')}</p>`
    };
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    console.error('Kontakt-Fehler:', error);
    res.status(500).json({ error: 'Senden fehlgeschlagen' });
  }
});

// Retoure-Anfrage Endpunkt
app.post('/api/return-request', async (req, res) => {
  try {
    const { orderId, email, reason, items } = req.body || {};
    if (!orderId || !email) {
      return res.status(400).json({ error: 'Bitte Bestellnummer und E-Mail angeben.' });
    }
    const msg = {
      to: process.env.SUPPORT_EMAIL,
      from: process.env.SENDER_EMAIL,
      reply_to: email,
      subject: `Retoure-Anfrage #${orderId}`,
      text: `Retoure angefragt für Bestellung ${orderId}\nE-Mail: ${email}\nGrund: ${reason || '—'}\nArtikel: ${(items && items.join(', ')) || '—'}`,
      html: `<p><strong>Retoure angefragt</strong> für Bestellung <strong>#${orderId}</strong></p>
            <p><strong>E-Mail:</strong> ${email}</p>
            <p><strong>Grund:</strong> ${reason || '—'}</p>
            <p><strong>Artikel:</strong> ${(items && items.join(', ')) || '—'}</p>`
    };
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    console.error('Retoure-Fehler:', error);
    res.status(500).json({ error: 'Senden fehlgeschlagen' });
  }
});

// ==========================================
// CJ DROPSHIPPING API ROUTES
// ==========================================

// Get CJ Product List
app.get('/api/cj/products', async (req, res) => {
  try {
    const params = req.query;
    const products = await cjAPI.getProductList(params);
    res.json(products);
  } catch (error) {
    console.error('CJ Products Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search CJ Products
app.post('/api/cj/products/search', async (req, res) => {
  try {
    const searchParams = req.body;
    const products = await cjAPI.queryProducts(searchParams);
    res.json(products);
  } catch (error) {
    console.error('CJ Product Search Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Product Categories
app.get('/api/cj/categories', async (req, res) => {
  try {
    const categories = await cjAPI.getProductCategory();
    res.json(categories);
  } catch (error) {
    console.error('CJ Categories Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Product Details by VID
app.get('/api/cj/product/:vid', async (req, res) => {
  try {
    const { vid } = req.params;
    const product = await cjAPI.queryProductByVid(vid);
    res.json(product);
  } catch (error) {
    console.error('CJ Product Details Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Product Stock
app.get('/api/cj/product/:vid/stock', async (req, res) => {
  try {
    const { vid } = req.params;
    const stock = await cjAPI.getProductStockByVid(vid);
    res.json(stock);
  } catch (error) {
    console.error('CJ Product Stock Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create CJ Order
app.post('/api/cj/orders/create', async (req, res) => {
  try {
    const orderData = req.body;
    const order = await cjAPI.createOrderV2(orderData);
    res.json(order);
  } catch (error) {
    console.error('CJ Create Order Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get CJ Orders
app.get('/api/cj/orders', async (req, res) => {
  try {
    const params = req.query;
    const orders = await cjAPI.getShoppingOrderList(params);
    res.json(orders);
  } catch (error) {
    console.error('CJ Orders Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm CJ Order
app.post('/api/cj/orders/:orderId/confirm', async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await cjAPI.confirmOrder(orderId);
    res.json(result);
  } catch (error) {
    console.error('CJ Confirm Order Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Order Details
app.get('/api/cj/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await cjAPI.getOrderDetail(orderId);
    res.json(order);
  } catch (error) {
    console.error('CJ Order Details Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate Shipping Cost
app.post('/api/cj/shipping/calculate', async (req, res) => {
  try {
    const shippingData = req.body;
    const cost = await cjAPI.freightCalculate(shippingData);
    res.json(cost);
  } catch (error) {
    console.error('CJ Shipping Calculate Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track Package
app.get('/api/cj/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const tracking = await cjAPI.getTrackInfo(trackingNumber);
    res.json(tracking);
  } catch (error) {
    console.error('CJ Tracking Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Account Balance
app.get('/api/cj/balance', async (req, res) => {
  try {
    const balance = await cjAPI.getBalance();
    res.json(balance);
  } catch (error) {
    console.error('CJ Balance Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Product Sourcing
app.post('/api/cj/sourcing/create', async (req, res) => {
  try {
    const sourcingData = req.body;
    const result = await cjAPI.createProductSourcing(sourcingData);
    res.json(result);
  } catch (error) {
    console.error('CJ Product Sourcing Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Disputes
app.get('/api/cj/disputes', async (req, res) => {
  try {
    const params = req.query;
    const disputes = await cjAPI.getDisputeList(params);
    res.json(disputes);
  } catch (error) {
    console.error('CJ Disputes Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Dispute
app.post('/api/cj/disputes/create', async (req, res) => {
  try {
    const disputeData = req.body;
    const dispute = await cjAPI.createDispute(disputeData);
    res.json(dispute);
  } catch (error) {
    console.error('CJ Create Dispute Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test CJ API Connection
app.get('/api/cj/test', async (req, res) => {
  try {
    const result = await cjAPI.testConnection();
    res.json(result);
  } catch (error) {
    console.error('CJ API Test Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Available CJ API Methods
app.get('/api/cj/methods', (req, res) => {
  try {
    const methods = cjAPI.getAvailableMethods();
    res.json(methods);
  } catch (error) {
    console.error('CJ Methods Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// WAREHOUSE MANAGEMENT ROUTES
// ==========================================

// Get Warehouse List
app.get('/api/cj/warehouses', async (req, res) => {
  try {
    const warehouses = await cjAPI.getWarehouseList();
    res.json(warehouses);
  } catch (error) {
    console.error('CJ Warehouses Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Warehouse Info
app.get('/api/cj/warehouse/:warehouseId', async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const warehouse = await cjAPI.getWarehouseInfo(warehouseId);
    res.json(warehouse);
  } catch (error) {
    console.error('CJ Warehouse Info Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Query Warehouse Stock
app.post('/api/cj/warehouse/stock/query', async (req, res) => {
  try {
    const params = req.body;
    const stock = await cjAPI.queryWarehouseStock(params);
    res.json(stock);
  } catch (error) {
    console.error('CJ Warehouse Stock Query Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Warehouse Stock
app.post('/api/cj/warehouse/stock/update', async (req, res) => {
  try {
    const data = req.body;
    const result = await cjAPI.updateWarehouseStock(data);
    res.json(result);
  } catch (error) {
    console.error('CJ Warehouse Stock Update Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Stock Alerts
app.get('/api/cj/warehouse/stock/alerts', async (req, res) => {
  try {
    const params = req.query;
    const alerts = await cjAPI.getStockAlert(params);
    res.json(alerts);
  } catch (error) {
    console.error('CJ Stock Alerts Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// STORE AUTHORIZATION ROUTES
// ==========================================

// Get Store List
app.get('/api/cj/stores', async (req, res) => {
  try {
    const stores = await cjAPI.getStoreList();
    res.json(stores);
  } catch (error) {
    console.error('CJ Stores Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Authorize Store
app.post('/api/cj/store/authorize', async (req, res) => {
  try {
    const storeData = req.body;
    const result = await cjAPI.authorizeStore(storeData);
    res.json(result);
  } catch (error) {
    console.error('CJ Store Authorization Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Store Authorization Status
app.get('/api/cj/store/:storeId/auth/status', async (req, res) => {
  try {
    const { storeId } = req.params;
    const status = await cjAPI.getStoreAuthStatus(storeId);
    res.json(status);
  } catch (error) {
    console.error('CJ Store Auth Status Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Revoke Store Authorization
app.post('/api/cj/store/:storeId/auth/revoke', async (req, res) => {
  try {
    const { storeId } = req.params;
    const result = await cjAPI.revokeStoreAuth(storeId);
    res.json(result);
  } catch (error) {
    console.error('CJ Store Auth Revoke Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Store Settings
app.get('/api/cj/store/:storeId/settings', async (req, res) => {
  try {
    const { storeId } = req.params;
    const settings = await cjAPI.getStoreSettings(storeId);
    res.json(settings);
  } catch (error) {
    console.error('CJ Store Settings Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Store Settings
app.put('/api/cj/store/:storeId/settings', async (req, res) => {
  try {
    const { storeId } = req.params;
    const settings = req.body;
    const result = await cjAPI.updateStoreSettings(storeId, settings);
    res.json(result);
  } catch (error) {
    console.error('CJ Store Settings Update Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// INVENTORY MANAGEMENT ROUTES
// ==========================================

// Get Inventory List
app.get('/api/cj/inventory', async (req, res) => {
  try {
    const params = req.query;
    const inventory = await cjAPI.getInventoryList(params);
    res.json(inventory);
  } catch (error) {
    console.error('CJ Inventory Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Inventory
app.put('/api/cj/inventory/update', async (req, res) => {
  try {
    const data = req.body;
    const result = await cjAPI.updateInventory(data);
    res.json(result);
  } catch (error) {
    console.error('CJ Inventory Update Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync Inventory
app.post('/api/cj/inventory/sync', async (req, res) => {
  try {
    const params = req.body;
    const result = await cjAPI.syncInventory(params);
    res.json(result);
  } catch (error) {
    console.error('CJ Inventory Sync Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Inventory History
app.get('/api/cj/inventory/:productId/history', async (req, res) => {
  try {
    const { productId } = req.params;
    const params = req.query;
    const history = await cjAPI.getInventoryHistory(productId, params);
    res.json(history);
  } catch (error) {
    console.error('CJ Inventory History Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SHIPPING TEMPLATES ROUTES
// ==========================================

// Get Shipping Templates
app.get('/api/cj/shipping/templates', async (req, res) => {
  try {
    const templates = await cjAPI.getShippingTemplates();
    res.json(templates);
  } catch (error) {
    console.error('CJ Shipping Templates Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Shipping Template
app.post('/api/cj/shipping/template', async (req, res) => {
  try {
    const templateData = req.body;
    const result = await cjAPI.createShippingTemplate(templateData);
    res.json(result);
  } catch (error) {
    console.error('CJ Create Shipping Template Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Shipping Template
app.put('/api/cj/shipping/template/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const templateData = req.body;
    const result = await cjAPI.updateShippingTemplate(templateId, templateData);
    res.json(result);
  } catch (error) {
    console.error('CJ Update Shipping Template Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Shipping Template
app.delete('/api/cj/shipping/template/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const result = await cjAPI.deleteShippingTemplate(templateId);
    res.json(result);
  } catch (error) {
    console.error('CJ Delete Shipping Template Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// RETURNS MANAGEMENT ROUTES
// ==========================================

// Get Returns List
app.get('/api/cj/returns', async (req, res) => {
  try {
    const params = req.query;
    const returns = await cjAPI.getReturnsList(params);
    res.json(returns);
  } catch (error) {
    console.error('CJ Returns Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Return Request
app.post('/api/cj/returns/create', async (req, res) => {
  try {
    const returnData = req.body;
    const result = await cjAPI.createReturnRequest(returnData);
    res.json(result);
  } catch (error) {
    console.error('CJ Create Return Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Return Status
app.put('/api/cj/returns/:returnId/status', async (req, res) => {
  try {
    const { returnId } = req.params;
    const { status } = req.body;
    const result = await cjAPI.updateReturnStatus(returnId, status);
    res.json(result);
  } catch (error) {
    console.error('CJ Update Return Status Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Return Details
app.get('/api/cj/returns/:returnId', async (req, res) => {
  try {
    const { returnId } = req.params;
    const returnDetails = await cjAPI.getReturnDetails(returnId);
    res.json(returnDetails);
  } catch (error) {
    console.error('CJ Return Details Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ANALYTICS & REPORTS ROUTES
// ==========================================

// Get Sales Report
app.post('/api/cj/reports/sales', async (req, res) => {
  try {
    const params = req.body;
    const report = await cjAPI.getSalesReport(params);
    res.json(report);
  } catch (error) {
    console.error('CJ Sales Report Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Product Performance
app.post('/api/cj/reports/product/performance', async (req, res) => {
  try {
    const params = req.body;
    const report = await cjAPI.getProductPerformance(params);
    res.json(report);
  } catch (error) {
    console.error('CJ Product Performance Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Order Analytics
app.post('/api/cj/reports/orders/analytics', async (req, res) => {
  try {
    const params = req.body;
    const analytics = await cjAPI.getOrderAnalytics(params);
    res.json(analytics);
  } catch (error) {
    console.error('CJ Order Analytics Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Revenue Report
app.post('/api/cj/reports/revenue', async (req, res) => {
  try {
    const params = req.body;
    const report = await cjAPI.getRevenueReport(params);
    res.json(report);
  } catch (error) {
    console.error('CJ Revenue Report Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// NOTIFICATIONS ROUTES
// ==========================================

// Get Notifications
app.get('/api/cj/notifications', async (req, res) => {
  try {
    const params = req.query;
    const notifications = await cjAPI.getNotifications(params);
    res.json(notifications);
  } catch (error) {
    console.error('CJ Notifications Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark Notification as Read
app.put('/api/cj/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const result = await cjAPI.markNotificationRead(notificationId);
    res.json(result);
  } catch (error) {
    console.error('CJ Mark Notification Read Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Notification Settings
app.get('/api/cj/notifications/settings', async (req, res) => {
  try {
    const settings = await cjAPI.getNotificationSettings();
    res.json(settings);
  } catch (error) {
    console.error('CJ Notification Settings Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Notification Settings
app.put('/api/cj/notifications/settings', async (req, res) => {
  try {
    const settings = req.body;
    const result = await cjAPI.updateNotificationSettings(settings);
    res.json(result);
  } catch (error) {
    console.error('CJ Update Notification Settings Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});