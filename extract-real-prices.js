const fs = require('fs');

// Function to extract price from HTML file
function extractPriceFromHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract price from the price-tag span
  const priceMatch = content.match(/<span class="price-tag">€([\d.]+)<\/span>/);
  if (priceMatch) {
    return parseFloat(priceMatch[1]);
  }
  
  return null;
}

// Function to extract product name from HTML file
function extractNameFromHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract name from h1 tag
  const nameMatch = content.match(/<h1[^>]*class="display-4[^>]*>(.*?)<\/h1>/);
  if (nameMatch) {
    return nameMatch[1].trim();
  }
  
  return null;
}

console.log('=== ECHTE PREISE AUS PRODUKTSEITEN ===\n');

// Get all product files
const produkteDir = './produkte';
const files = fs.readdirSync(produkteDir).filter(file => file.startsWith('produkt-') && file.endsWith('.html'));

const realPrices = {};

files.forEach(filename => {
  const productId = parseInt(filename.match(/produkt-(\d+)\.html/)[1]);
  const filePath = `./produkte/${filename}`;
  
  const price = extractPriceFromHTML(filePath);
  const name = extractNameFromHTML(filePath);
  
  if (price && name) {
    realPrices[productId] = {
      name: name,
      price: price
    };
    
    console.log(`Produkt ${productId}: ${name} - €${price.toFixed(2)}`);
  } else {
    console.log(`❌ Fehler bei ${filename}: Preis oder Name nicht gefunden`);
  }
});

// Save real prices to JSON file
fs.writeFileSync('real-prices.json', JSON.stringify(realPrices, null, 2));
console.log('\n✅ Echte Preise in real-prices.json gespeichert');
