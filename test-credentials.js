/**
 * Test CJ Dropshipping Credentials with Different Encodings
 */

require('dotenv').config();
const fetch = require('node-fetch');

async function testCredentials() {
  console.log('🔐 Testing CJ Dropshipping Credentials\n');
  
  const email = process.env.CJ_EMAIL;
  const rawPassword = process.env.CJ_PASSWORD;
  
  console.log(`Email: ${email}`);
  console.log(`Raw Password: ${rawPassword}\n`);
  
  // Test different password formats
  const passwordVariants = [
    { name: 'Raw password (with quotes)', value: rawPassword },
    { name: 'Password without quotes', value: rawPassword.replace(/"/g, '') },
    { name: 'URL encoded password', value: encodeURIComponent(rawPassword.replace(/"/g, '')) },
    { name: 'Escaped password', value: rawPassword.replace(/"/g, '').replace(/!/g, '\\!') }
  ];
  
  for (const variant of passwordVariants) {
    console.log(`Testing: ${variant.name} = "${variant.value}"`);
    
    try {
      const result = await testLogin(email, variant.value);
      console.log('✅ SUCCESS! This password format works.');
      console.log(`📋 Response: ${JSON.stringify(result, null, 2)}\n`);
      
      console.log('🔧 Update your .env file with:');
      console.log(`CJ_PASSWORD=${variant.value}`);
      return;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log('🚨 All password variants failed.');
  console.log('\n🔧 Next steps:');
  console.log('1. Try logging into https://cjdropshipping.com manually');
  console.log('2. If manual login fails, reset your password');
  console.log('3. If manual login works, contact CJ support about API access');
}

async function testLogin(email, password) {
  const url = 'https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  });
  
  const result = await response.json();
  
  if (!response.ok || !result.result) {
    throw new Error(result.message || 'Authentication failed');
  }
  
  return result;
}

// Run test
if (require.main === module) {
  testCredentials().catch(console.error);
}

module.exports = testCredentials;
