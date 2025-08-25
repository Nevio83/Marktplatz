/**
 * CJ Dropshipping API Integration
 * Complete API client for all CJ Dropshipping endpoints
 * Documentation: https://cjdropshipping.com/my.html#/apikey
 */

require('dotenv').config();
const fetch = require('node-fetch');

class CJDropshippingAPI {
  constructor(config = {}) {
    this.baseURL = 'https://developers.cjdropshipping.com';
    this.apiKey = config.apiKey || process.env.CJ_API_KEY;
    this.accessToken = config.accessToken || process.env.CJ_ACCESS_TOKEN;
    this.email = config.email || process.env.CJ_EMAIL;
    this.password = config.password || process.env.CJ_PASSWORD;
    
    if (!this.apiKey) {
      console.warn('CJ API Key not found. Please set CJ_API_KEY in your environment variables.');
    }
  }

  /**
   * Make authenticated request to CJ API
   */
  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'CJ-API-Client/1.0'
    };

    // Add authentication headers based on available credentials
    if (this.accessToken) {
      headers['CJ-Access-Token'] = this.accessToken;
    }
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`CJ API Error: ${result.message || response.statusText}`);
      }
      
      return result;
    } catch (error) {
      console.error('CJ API Request Error:', error);
      throw error;
    }
  }

  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================

  /**
   * Get Access Token
   */
  async getAccessToken() {
    return this.makeRequest('/authentication/getAccessToken', 'POST', {
      email: process.env.CJ_EMAIL,
      password: process.env.CJ_PASSWORD
    });
  }

  /**
   * Refresh Access Token
   */
  async refreshAccessToken() {
    return this.makeRequest('/authentication/refreshAccessToken', 'POST');
  }

  /**
   * Logout
   */
  async logout() {
    return this.makeRequest('/authentication/logout', 'POST');
  }

  // ==========================================
  // PRODUCT APIs
  // ==========================================

  /**
   * Get Product List
   */
  async getProductList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/product/list${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Query Products
   */
  async queryProducts(params = {}) {
    return this.makeRequest('/product/query', 'POST', params);
  }

  /**
   * Get Product Category
   */
  async getProductCategory() {
    return this.makeRequest('/product/getCategory');
  }

  /**
   * Get Product Comments
   */
  async getProductComments(productId) {
    return this.makeRequest(`/product/productComments?productId=${productId}`);
  }

  /**
   * Add Product Comments
   */
  async addProductComments(data) {
    return this.makeRequest('/product/comments', 'POST', data);
  }

  /**
   * Query Product by VID (Variant ID)
   */
  async queryProductByVid(vid) {
    return this.makeRequest(`/product/variant/queryByVid?vid=${vid}`);
  }

  /**
   * Query Product Variant
   */
  async queryProductVariant(productId) {
    return this.makeRequest(`/product/variant/query?productId=${productId}`);
  }

  /**
   * Get Product Stock by VID
   */
  async getProductStockByVid(vid) {
    return this.makeRequest(`/product/stock/queryByVid?vid=${vid}`);
  }

  // ==========================================
  // PRODUCT SOURCING APIs
  // ==========================================

  /**
   * Query Product Sourcing
   */
  async queryProductSourcing(params = {}) {
    return this.makeRequest('/product/sourcing/query', 'POST', params);
  }

  /**
   * Create Product Sourcing
   */
  async createProductSourcing(data) {
    return this.makeRequest('/product/sourcing/create', 'POST', data);
  }

  // ==========================================
  // SHOPPING CART & ORDER APIs
  // ==========================================

  /**
   * Get Shopping Order List
   */
  async getShoppingOrderList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/shopping/order/list${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Create Order V2
   */
  async createOrderV2(orderData) {
    return this.makeRequest('/shopping/order/createOrderV2', 'POST', orderData);
  }

  /**
   * Confirm Order
   */
  async confirmOrder(orderId) {
    return this.makeRequest('/shopping/order/confirmOrder', 'POST', { orderId });
  }

  /**
   * Delete Order
   */
  async deleteOrder(orderId) {
    return this.makeRequest('/shopping/order/deleteOrder', 'POST', { orderId });
  }

  /**
   * Get Order Detail
   */
  async getOrderDetail(orderId) {
    return this.makeRequest(`/shopping/order/getOrderDetail?orderId=${orderId}`);
  }

  // ==========================================
  // PAYMENT APIs
  // ==========================================

  /**
   * Pay Balance
   */
  async payBalance(data) {
    return this.makeRequest('/shopping/pay/payBalance', 'POST', data);
  }

  /**
   * Get Balance
   */
  async getBalance() {
    return this.makeRequest('/shopping/pay/getBalance');
  }

  // ==========================================
  // LOGISTICS APIs
  // ==========================================

  /**
   * Get Track Info
   */
  async getTrackInfo(trackingNumber) {
    return this.makeRequest(`/logistic/getTrackInfo?trackingNumber=${trackingNumber}`);
  }

  /**
   * Track Info
   */
  async trackInfo(trackingNumber) {
    return this.makeRequest(`/logistic/trackInfo?trackingNumber=${trackingNumber}`);
  }

  /**
   * Freight Calculate
   */
  async freightCalculate(data) {
    return this.makeRequest('/logistic/freightCalculate', 'POST', data);
  }

  /**
   * Freight Calculate Tip
   */
  async freightCalculateTip(data) {
    return this.makeRequest('/logistic/freightCalculateTip', 'POST', data);
  }

  // ==========================================
  // DISPUTES APIs
  // ==========================================

  /**
   * Get Dispute List
   */
  async getDisputeList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/disputes/getDisputeList${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Create Dispute
   */
  async createDispute(data) {
    return this.makeRequest('/disputes/create', 'POST', data);
  }

  /**
   * Cancel Dispute
   */
  async cancelDispute(disputeId) {
    return this.makeRequest('/disputes/cancel', 'POST', { disputeId });
  }

  /**
   * Dispute Products
   */
  async disputeProducts(params = {}) {
    return this.makeRequest('/disputes/disputeProducts', 'POST', params);
  }

  /**
   * Dispute Confirm Info
   */
  async disputeConfirmInfo(disputeId) {
    return this.makeRequest(`/disputes/disputeConfirmInfo?disputeId=${disputeId}`);
  }

  // ==========================================
  // SETTINGS APIs
  // ==========================================

  /**
   * Get Settings
   */
  async getSettings() {
    return this.makeRequest('/setting/get');
  }

  // ==========================================
  // WAREHOUSE MANAGEMENT APIs
  // ==========================================

  /**
   * Get Warehouse List
   */
  async getWarehouseList() {
    return this.makeRequest('/warehouse/list');
  }

  /**
   * Get Warehouse Info
   */
  async getWarehouseInfo(warehouseId) {
    return this.makeRequest(`/warehouse/info?warehouseId=${warehouseId}`);
  }

  /**
   * Query Warehouse Stock
   */
  async queryWarehouseStock(params = {}) {
    return this.makeRequest('/warehouse/stock/query', 'POST', params);
  }

  /**
   * Update Warehouse Stock
   */
  async updateWarehouseStock(data) {
    return this.makeRequest('/warehouse/stock/update', 'POST', data);
  }

  /**
   * Get Stock Alert
   */
  async getStockAlert(params = {}) {
    return this.makeRequest('/warehouse/stock/alert', 'GET', params);
  }

  // ==========================================
  // STORE AUTHORIZATION APIs
  // ==========================================

  /**
   * Get Store List
   */
  async getStoreList() {
    return this.makeRequest('/store/list');
  }

  /**
   * Authorize Store
   */
  async authorizeStore(storeData) {
    return this.makeRequest('/store/authorize', 'POST', storeData);
  }

  /**
   * Get Store Authorization Status
   */
  async getStoreAuthStatus(storeId) {
    return this.makeRequest(`/store/auth/status?storeId=${storeId}`);
  }

  /**
   * Revoke Store Authorization
   */
  async revokeStoreAuth(storeId) {
    return this.makeRequest('/store/auth/revoke', 'POST', { storeId });
  }

  /**
   * Update Store Settings
   */
  async updateStoreSettings(storeId, settings) {
    return this.makeRequest('/store/settings/update', 'POST', { storeId, ...settings });
  }

  /**
   * Get Store Settings
   */
  async getStoreSettings(storeId) {
    return this.makeRequest(`/store/settings?storeId=${storeId}`);
  }

  // ==========================================
  // INVENTORY MANAGEMENT APIs
  // ==========================================

  /**
   * Get Inventory List
   */
  async getInventoryList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/inventory/list${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Update Inventory
   */
  async updateInventory(data) {
    return this.makeRequest('/inventory/update', 'POST', data);
  }

  /**
   * Sync Inventory
   */
  async syncInventory(params = {}) {
    return this.makeRequest('/inventory/sync', 'POST', params);
  }

  /**
   * Get Inventory History
   */
  async getInventoryHistory(productId, params = {}) {
    const queryString = new URLSearchParams({ productId, ...params }).toString();
    return this.makeRequest(`/inventory/history?${queryString}`);
  }

  // ==========================================
  // SHIPPING TEMPLATES APIs
  // ==========================================

  /**
   * Get Shipping Templates
   */
  async getShippingTemplates() {
    return this.makeRequest('/shipping/templates');
  }

  /**
   * Create Shipping Template
   */
  async createShippingTemplate(templateData) {
    return this.makeRequest('/shipping/template/create', 'POST', templateData);
  }

  /**
   * Update Shipping Template
   */
  async updateShippingTemplate(templateId, templateData) {
    return this.makeRequest('/shipping/template/update', 'PUT', { templateId, ...templateData });
  }

  /**
   * Delete Shipping Template
   */
  async deleteShippingTemplate(templateId) {
    return this.makeRequest('/shipping/template/delete', 'DELETE', { templateId });
  }

  // ==========================================
  // PRODUCT VARIANTS APIs
  // ==========================================

  /**
   * Get Product Variants
   */
  async getProductVariants(productId) {
    return this.makeRequest(`/product/variants?productId=${productId}`);
  }

  /**
   * Create Product Variant
   */
  async createProductVariant(variantData) {
    return this.makeRequest('/product/variant/create', 'POST', variantData);
  }

  /**
   * Update Product Variant
   */
  async updateProductVariant(variantId, variantData) {
    return this.makeRequest('/product/variant/update', 'PUT', { variantId, ...variantData });
  }

  /**
   * Delete Product Variant
   */
  async deleteProductVariant(variantId) {
    return this.makeRequest('/product/variant/delete', 'DELETE', { variantId });
  }

  // ==========================================
  // RETURNS MANAGEMENT APIs
  // ==========================================

  /**
   * Get Returns List
   */
  async getReturnsList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/returns/list${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Create Return Request
   */
  async createReturnRequest(returnData) {
    return this.makeRequest('/returns/create', 'POST', returnData);
  }

  /**
   * Update Return Status
   */
  async updateReturnStatus(returnId, status) {
    return this.makeRequest('/returns/status/update', 'PUT', { returnId, status });
  }

  /**
   * Get Return Details
   */
  async getReturnDetails(returnId) {
    return this.makeRequest(`/returns/details?returnId=${returnId}`);
  }

  // ==========================================
  // ANALYTICS & REPORTS APIs
  // ==========================================

  /**
   * Get Sales Report
   */
  async getSalesReport(params = {}) {
    return this.makeRequest('/reports/sales', 'POST', params);
  }

  /**
   * Get Product Performance
   */
  async getProductPerformance(params = {}) {
    return this.makeRequest('/reports/product/performance', 'POST', params);
  }

  /**
   * Get Order Analytics
   */
  async getOrderAnalytics(params = {}) {
    return this.makeRequest('/reports/orders/analytics', 'POST', params);
  }

  /**
   * Get Revenue Report
   */
  async getRevenueReport(params = {}) {
    return this.makeRequest('/reports/revenue', 'POST', params);
  }

  // ==========================================
  // NOTIFICATIONS APIs
  // ==========================================

  /**
   * Get Notifications
   */
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/notifications${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Mark Notification as Read
   */
  async markNotificationRead(notificationId) {
    return this.makeRequest('/notifications/read', 'PUT', { notificationId });
  }

  /**
   * Get Notification Settings
   */
  async getNotificationSettings() {
    return this.makeRequest('/notifications/settings');
  }

  /**
   * Update Notification Settings
   */
  async updateNotificationSettings(settings) {
    return this.makeRequest('/notifications/settings/update', 'PUT', settings);
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Test API Connection
   */
  async testConnection() {
    try {
      const result = await this.getSettings();
      console.log('CJ API Connection successful!');
      return { success: true, data: result };
    } catch (error) {
      console.error('CJ API Connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all available methods
   */
  getAvailableMethods() {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(method => method !== 'constructor' && typeof this[method] === 'function');
    
    return {
      authentication: [
        'getAccessToken',
        'refreshAccessToken', 
        'logout'
      ],
      products: [
        'getProductList',
        'queryProducts',
        'getProductCategory',
        'getProductComments',
        'addProductComments',
        'queryProductByVid',
        'queryProductVariant',
        'getProductStockByVid'
      ],
      productSourcing: [
        'queryProductSourcing',
        'createProductSourcing'
      ],
      shopping: [
        'getShoppingOrderList',
        'createOrderV2',
        'confirmOrder',
        'deleteOrder',
        'getOrderDetail'
      ],
      payment: [
        'payBalance',
        'getBalance'
      ],
      logistics: [
        'getTrackInfo',
        'trackInfo',
        'freightCalculate',
        'freightCalculateTip'
      ],
      disputes: [
        'getDisputeList',
        'createDispute',
        'cancelDispute',
        'disputeProducts',
        'disputeConfirmInfo'
      ],
      settings: [
        'getSettings'
      ],
      warehouse: [
        'getWarehouseList',
        'getWarehouseInfo',
        'queryWarehouseStock',
        'updateWarehouseStock',
        'getStockAlert'
      ],
      storeAuthorization: [
        'getStoreList',
        'authorizeStore',
        'getStoreAuthStatus',
        'revokeStoreAuth',
        'updateStoreSettings',
        'getStoreSettings'
      ],
      inventory: [
        'getInventoryList',
        'updateInventory',
        'syncInventory',
        'getInventoryHistory'
      ],
      shippingTemplates: [
        'getShippingTemplates',
        'createShippingTemplate',
        'updateShippingTemplate',
        'deleteShippingTemplate'
      ],
      productVariants: [
        'getProductVariants',
        'createProductVariant',
        'updateProductVariant',
        'deleteProductVariant'
      ],
      returns: [
        'getReturnsList',
        'createReturnRequest',
        'updateReturnStatus',
        'getReturnDetails'
      ],
      analytics: [
        'getSalesReport',
        'getProductPerformance',
        'getOrderAnalytics',
        'getRevenueReport'
      ],
      notifications: [
        'getNotifications',
        'markNotificationRead',
        'getNotificationSettings',
        'updateNotificationSettings'
      ],
      utilities: [
        'testConnection',
        'getAvailableMethods',
        'batchRequest'
      ]
    };
  }

  /**
   * Batch request handler
   */
  async batchRequest(requests) {
    const promises = requests.map(request => 
      this.makeRequest(request.endpoint, request.method, request.data)
    );
    
    try {
      const results = await Promise.allSettled(promises);
      return results.map((result, index) => ({
        request: requests[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    } catch (error) {
      console.error('Batch request error:', error);
      throw error;
    }
  }
}

// Export the class and create a default instance
module.exports = CJDropshippingAPI;

// Example usage and initialization
if (require.main === module) {
  // This code runs only when the file is executed directly
  const cjAPI = new CJDropshippingAPI();
  
  // Test the connection
  cjAPI.testConnection().then(result => {
    if (result.success) {
      console.log('✅ CJ Dropshipping API ready to use!');
      console.log('Available method categories:', Object.keys(cjAPI.getAvailableMethods()));
    } else {
      console.log('❌ CJ API setup needs configuration');
      console.log('Please set the following environment variables:');
      console.log('- CJ_API_KEY');
      console.log('- CJ_ACCESS_TOKEN');
      console.log('- CJ_EMAIL (for authentication)');
      console.log('- CJ_PASSWORD (for authentication)');
    }
  });
}