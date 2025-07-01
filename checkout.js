document.addEventListener('DOMContentLoaded', () => {
  const orderItems = JSON.parse(localStorage.getItem('cart') || '[]');
  const orderList = document.getElementById('order-items');
  const totalAmount = document.getElementById('total-amount');

  // Warenkorb anzeigen
  orderList.innerHTML = orderItems.map(item => 
    `<li>${item.name} - ${item.price}€ x${item.quantity}</li>`
  ).join('');

  // Gesamtbetrag berechnen
  totalAmount.textContent = orderItems
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
    .toFixed(2);

  // Stripe-Handler
  const stripe = Stripe('YOUR_STRIPE_KEY');
  const elements = stripe.elements();
  const cardElement = elements.create('card');
  cardElement.mount('#card-element');

  document.getElementById('stripe-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Hier später Stripe-API-Integration
  });

  // PayPal-Handler
  paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: totalAmount.textContent
          }
        }]
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then(details => {
        alert('Zahlung erfolgreich!');
      });
    }
  }).render('#paypal-button');
});