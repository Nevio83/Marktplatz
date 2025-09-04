const fs = require('fs');

// Read real prices from extracted data
const realPrices = JSON.parse(fs.readFileSync('real-prices.json', 'utf8'));

// Function to update similar products section with correct prices
function updateSimilarProductPrices(htmlContent, filename) {
  let updatedContent = htmlContent;
  let changesMade = false;
  
  // Find all similar product cards and update their prices
  const similarProductRegex = /<div class="similar-product-card" onclick="window\.location\.href='produkt-(\d+)\.html'">([\s\S]*?)<\/div>\s*<\/div>/g;
  
  updatedContent = updatedContent.replace(similarProductRegex, (match, productId, cardContent) => {
    const id = parseInt(productId);
    const realProduct = realPrices[id];
    
    if (realProduct) {
      // Update price in the card content
      const updatedCardContent = cardContent.replace(
        /<div class="price-container"><span class="current-price">€[\d.]+<\/span><\/div>/,
        `<div class="price-container"><span class="current-price">€${realProduct.price.toFixed(2)}</span></div>`
      );
      
      if (updatedCardContent !== cardContent) {
        changesMade = true;
        console.log(`  Updated ${realProduct.name}: €${realProduct.price.toFixed(2)}`);
      }
      
      return `<div class="similar-product-card" onclick="window.location.href='produkt-${productId}.html'">${updatedCardContent}</div>
                </div>`;
    }
    
    return match;
  });
  
  return { content: updatedContent, changed: changesMade };
}

// Process all product files
const produkteDir = './produkte';
const files = fs.readdirSync(produkteDir).filter(file => file.startsWith('produkt-') && file.endsWith('.html'));

console.log('=== KORRIGIERE PREISE IN ÄHNLICHE PRODUKTE ===\n');

files.forEach(filename => {
  const filePath = `./produkte/${filename}`;
  const htmlContent = fs.readFileSync(filePath, 'utf8');
  
  console.log(`Prüfe ${filename}:`);
  const result = updateSimilarProductPrices(htmlContent, filename);
  
  if (result.changed) {
    fs.writeFileSync(filePath, result.content, 'utf8');
    console.log(`✅ ${filename} aktualisiert\n`);
  } else {
    console.log(`  Keine Änderungen nötig\n`);
  }
});

console.log('Fertig!');
