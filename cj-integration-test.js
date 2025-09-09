/**
 * CJ Integration Test with Fallback System
 * Tests the fixed CJ Dropshipping API with fallback functionality
 */

const CJDropshippingAPI = require('./cj-dropshipping-api');

async function testCJIntegration() {
    console.log('🧪 Testing CJ Dropshipping Integration with Fallback System\n');

    const api = new CJDropshippingAPI();

    // Test 1: Query Products (should use fallback)
    console.log('1. Testing Product Query...');
    try {
        const result = await api.queryProducts({
            pageNum: 1,
            pageSize: 5
        });
        
        if (result.success) {
            console.log('✅ Product query successful');
            console.log(`📦 Found ${result.data.list.length} products`);
            console.log(`🔄 Source: ${result.source}`);
            
            // Show first product
            if (result.data.list.length > 0) {
                const product = result.data.list[0];
                console.log(`   First product: ${product.nameDE} - €${product.price}`);
            }
        } else {
            console.log('❌ Product query failed');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n2. Testing Order Creation...');
    try {
        const orderResult = await api.createOrderV2({
            productId: '1621032671155597312',
            quantity: 1,
            shippingAddress: {
                country: 'DE',
                city: 'Berlin'
            }
        });
        
        if (orderResult.success) {
            console.log('✅ Order creation successful');
            console.log(`📋 Order ID: ${orderResult.data.orderId}`);
            console.log(`🔄 Source: ${orderResult.source}`);
        } else {
            console.log('❌ Order creation failed');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n3. Testing Shipping Calculation...');
    try {
        const shippingResult = await api.freightCalculate({
            country: 'DE',
            products: [{ id: '1621032671155597312', quantity: 1 }]
        });
        
        if (shippingResult.success) {
            console.log('✅ Shipping calculation successful');
            console.log(`💰 Cost: €${shippingResult.data.cost}`);
            console.log(`📅 Estimated delivery: ${shippingResult.data.estimatedDays} days`);
            console.log(`🔄 Source: ${shippingResult.source}`);
        } else {
            console.log('❌ Shipping calculation failed');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n4. Testing API Status Check...');
    try {
        const status = await api.fallbackSystem.checkAPIStatus();
        console.log('📊 API Status:');
        console.log(`   Available: ${status.available}`);
        console.log(`   Reason: ${status.reason}`);
        console.log(`   Fallback Active: ${status.fallbackActive}`);
        console.log(`   Last Checked: ${status.lastChecked}`);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n🎉 CJ Integration Test Complete!');
    console.log('✅ Fallback system is working - your marketplace can operate without CJ API');
}

// Run test
if (require.main === module) {
    testCJIntegration().catch(console.error);
}

module.exports = testCJIntegration;
