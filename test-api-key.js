/**
 * Test CJ Dropshipping API Key Authentication
 */

require('dotenv').config();
const CJDropshippingAPI = require('./cj-dropshipping-api');

async function testAPIKeyAuth() {
  console.log('🔑 Testing CJ API Key Authentication...\n');
  
  const cjAPI = new CJDropshippingAPI();
  
  try {
    // Test basic API connection with API key
    console.log('Testing API connection with API key...');
    const response = await cjAPI.testConnection();
    
    if (response && response.result) {
      console.log('✅ API Key authentication successful!');
      console.log('📋 Response:', JSON.stringify(response, null, 2));
    } else {
      console.log('❌ API Key authentication failed');
      console.log('📋 Response:', JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Verify your CJ_API_KEY in .env file');
      console.log('2. Check if your API key is active at: https://cjdropshipping.com/my.html#/apikey');
      console.log('3. Ensure your CJ account has API access enabled');
    }
  }
}

// Run the test
if (require.main === module) {
  testAPIKeyAuth();
}

module.exports = testAPIKeyAuth;
