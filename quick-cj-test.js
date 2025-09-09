/**
 * Quick CJ API Test - Check if it's working now
 */

require('dotenv').config();
const CJDropshippingAPI = require('./cj-dropshipping-api');

async function quickTest() {
    console.log('🔍 Quick CJ API Test...');
    console.log(`API Key: ${process.env.CJ_API_KEY}`);
    console.log('');
    
    const cjAPI = new CJDropshippingAPI();
    
    try {
        const response = await cjAPI.testConnection();
        console.log('✅ CJ API is working!');
        console.log('Response:', JSON.stringify(response, null, 2));
    } catch (error) {
        console.log('❌ CJ API still not working');
        console.log('Error:', error.message);
    }
}

quickTest();
