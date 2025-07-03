require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const path = require('path');

const app = express();
app.use(express.json());

// Statische Dateien (HTML, CSS, JS, Bilder) ausliefern
app.use(express.static(path.join(__dirname)));

app.post('/api/create-checkout-session', async (req, res) => {
  const { cart } = req.body;
  const line_items = cart.map(item => {
    if (item.id === 1) {
      return {
        price: 'price_1RgoIgB31V654n3WL9mzUNNS',
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

app.post('/api/create-payment-intent', async (req, res) => {
  const { cart, email } = req.body;
  let amount = 0;
  for (const item of cart) {
    if (item.id === 1) {
      amount += 1000 * item.quantity; // 10.00 EUR * 100
    } else {
      amount += Math.round(item.price * 100) * item.quantity;
    }
  }
  amount += 499; // Versandkosten

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});