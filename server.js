require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const paypal = require('paypal-rest-sdk');

const app = express();

// Payment provider configuration
paypal.configure({
  mode: 'sandbox',
  client_id: process.env.PAYPAL_CLIENT,
  client_secret: process.env.PAYPAL_SECRET
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Data stores
let users = [];
let products = [];
let carts = {};
let orders = [];
let resetTokens = {};

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// User endpoints
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (users.some(u => u.email === email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(),
      email,
      password: hashedPassword
    };

    users.push(newUser);
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET);
    res.status(201).json({ token });

  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Password reset endpoints
app.post('/api/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) return res.sendStatus(202);
    
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    resetTokens[resetToken] = user.id;
    
    console.log(`Password reset link: http://localhost:3000/reset-password?token=${resetToken}`);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const userId = resetTokens[token];
    
    if (!userId) return res.status(401).json({ error: 'Invalid token' });
    
    const user = users.find(u => u.id === userId);
    user.password = await bcrypt.hash(newPassword, 10);
    delete resetTokens[token];
    
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Password update failed' });
  }
});

// Product endpoints
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Cart endpoints
app.post('/api/cart', authenticateToken, (req, res) => {
  const { item } = req.body;
  const userId = req.user.userId;
  
  if (!carts[userId]) carts[userId] = [];
  carts[userId].push(item);
  res.status(201).send();
});

// Payment endpoints
app.post('/api/payment/stripe', authenticateToken, async (req, res) => {
  try {
    const { amount, token } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'eur',
      payment_method: token
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payment/paypal', authenticateToken, async (req, res) => {
  try {
    const { orderID } = req.body;
    const capture = await paypal.captureOrder(orderID);
    res.json(capture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Order endpoints
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items } = req.body;
  const newOrder = {
    id: Date.now(),
    userId: req.user.userId,
    items,
    status: 'processing'
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});