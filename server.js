require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const path = require('path');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(express.json());

// CJDropshipping API Configuration
const CJ_API_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';
const CJ_ACCESS_TOKEN = process.env.CJ_DROPSHIPPING_KEY;

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
      
      // 1. E-Mail senden
      const msg = {
        to: session.customer_details.email,
        from: process.env.SENDER_EMAIL,
        reply_to: process.env.SUPPORT_EMAIL,
        subject: 'Zahlungsbestätigung - Marktplatz',
        text: `Vielen Dank für Ihre Bestellung #${session.id}!\n\nIhre Zahlung wurde erfolgreich verarbeitet.`,
        html: `<strong>Bestellbestätigung #${session.id}</strong>
          <p>Ihre Zahlung wurde erfolgreich verarbeitet und wir bereiten den Versand vor.</p>`
      };
      await sgMail.send(msg);
      
      // 2. NEU: Bestellung an CJDropshipping weiterleiten
      try {
        await createCJOrder(session);
        console.log('CJDropshipping Bestellung erfolgreich erstellt');
      } catch (cjError) {
        console.error('CJDropshipping Fehler:', cjError);
        // Hier könnten Sie eine Benachrichtigung an sich selbst senden
      }
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
  const { cart, email, country } = req.body;
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
      payment_method_types: ['card']
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

// Funktion zum Erstellen einer CJDropshipping Bestellung
async function createCJOrder(stripeSession) {
  // Hier müssten Sie die Produktdaten aus der Stripe Session extrahieren
  // und mit Ihren lokalen Produktdaten abgleichen
  const products = await loadProductsFromStripeSession(stripeSession);
  
  const orderData = {
    orderId: stripeSession.id,
    products: products,
    shippingAddress: stripeSession.shipping || stripeSession.customer_details,
    customerEmail: stripeSession.customer_details.email
  };

  const response = await fetch(`${CJ_API_BASE}/shopping/order/createOrder`, {
    method: 'POST',
    headers: {
      'CJ-Access-Token': CJ_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error(`CJ API Error: ${response.status}`);
  }

  return response.json();
}

async function loadProductsFromStripeSession(session) {
  // Diese Funktion müsste die Produkte aus der Stripe Session 
  // mit Ihren lokalen Produktdaten (products.json) abgleichen
  // und die entsprechenden CJDropshipping IDs zurückgeben
  return [];
}

// CJDropshipping API Endpunkte

// CJDropshipping Produkte laden
app.get('/api/cj/products', async (req, res) => {
  try {
    const response = await fetch(`${CJ_API_BASE}/product/list`, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': CJ_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('CJ Products Error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der CJ-Produkte' });
  }
});

// CJDropshipping Produkte in lokale products.json importieren
app.post('/api/cj/import-products', async (req, res) => {
  try {
    // 1. CJDropshipping Produkte laden
    const response = await fetch(`${CJ_API_BASE}/product/list`, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': CJ_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    const cjData = await response.json();
    
    if (!cjData.result || !cjData.data) {
      return res.status(400).json({ error: 'Keine Produkte von CJDropshipping erhalten' });
    }

    // 2. CJ Produkte in unser Format umwandeln
    const fs = require('fs');
    const currentProducts = JSON.parse(fs.readFileSync('./products.json', 'utf8'));
    let nextId = Math.max(...currentProducts.map(p => p.id)) + 1;

    const newProducts = cjData.data.map(cjProduct => ({
      id: nextId++,
      name: cjProduct.productName,
      price: parseFloat(cjProduct.sellPrice || cjProduct.price || 10.00),
      category: cjProduct.categoryName || "Elektronik",
      image: cjProduct.productImage || "produkt bilder/ware.png",
      description: cjProduct.description || "Importiert von CJDropshipping",
      cjProductId: cjProduct.pid, // CJDropshipping Produkt-ID
      cjSku: cjProduct.productSku,
      cjVariants: cjProduct.variants || []
    }));

    // 3. Produkte zu bestehenden hinzufügen
    const allProducts = [...currentProducts, ...newProducts];
    
    // 4. products.json überschreiben
    fs.writeFileSync('./products.json', JSON.stringify(allProducts, null, 2));
    
    res.json({ 
      success: true, 
      imported: newProducts.length,
      message: `${newProducts.length} Produkte erfolgreich importiert!` 
    });
    
  } catch (error) {
    console.error('Import Error:', error);
    res.status(500).json({ error: 'Fehler beim Importieren der Produkte' });
  }
});

// Sendungsverfolgung abrufen
app.get('/api/cj/tracking/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const response = await fetch(`${CJ_API_BASE}/logistic/getTrackInfo?orderId=${orderId}`, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': CJ_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('CJ Tracking Error:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Sendungsverfolgung' });
  }
});

// Alle Bestellungen anzeigen
app.get('/api/cj/orders', async (req, res) => {
  try {
    const response = await fetch(`${CJ_API_BASE}/shopping/order/list`, {
      method: 'GET', 
      headers: {
        'CJ-Access-Token': CJ_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('CJ Orders Error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Bestellungen' });
  }
});

// Lagerbestand prüfen
app.get('/api/cj/stock/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const response = await fetch(`${CJ_API_BASE}/product/stock/queryByVid?vid=${productId}`, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': CJ_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('CJ Stock Error:', error);
    res.status(500).json({ error: 'Fehler beim Prüfen des Lagerbestands' });
  }
});

// Bestellung an CJDropshipping weiterleiten
app.post('/api/cj/create-order', async (req, res) => {
  try {
    const { orderId, products, shippingAddress, customerEmail } = req.body;
    
    const orderData = {
      orderId: orderId,
      products: products.map(item => ({
        productId: item.cjProductId, // CJDropshipping Produkt-ID
        quantity: item.quantity,
        variant: item.variant || ''
      })),
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        zip: shippingAddress.zip,
        country: shippingAddress.country
      },
      customerEmail: customerEmail
    };

    const response = await fetch(`${CJ_API_BASE}/shopping/order/createOrder`, {
      method: 'POST',
      headers: {
        'CJ-Access-Token': CJ_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('CJ Order Error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der CJ-Bestellung' });
  }
});

// Bestellung löschen
app.delete('/api/cj/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const response = await fetch(`${CJ_API_BASE}/shopping/order/deleteOrder?orderId=${orderId}`, {
      method: 'DELETE',
      headers: {
        'CJ-Access-Token': CJ_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('CJ Delete Order Error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der CJ-Bestellung' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});