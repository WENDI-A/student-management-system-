const axios = require('axios');
require('dotenv').config();

// Base URL for API requests
const API_URL = process.env.API_URL || 'http://localhost:3002/api';

// Store tokens and IDs for use across tests
let adminToken;
let guestToken;
let guestId;

// Test data
const testGuest = {
  firstName: 'Test',
  lastName: 'Guest',
  email: `test.guest.${Date.now()}@example.com`,
  password: 'Password123!',
  phone: '1234567890',
  address: '123 Test St, Test City',
  organization: 'Test Organization',
  purpose: 'meeting',
  visitDuration: '2 hours'
};

const updatedGuestData = {
  firstName: 'Updated',
  lastName: 'Guest',
  phone: '9876543210',
  address: '456 Updated St, New City',
  organization: 'Updated Organization',
  purpose: 'event',
  visitDuration: '3 hours',
  status: 'active'
};

// Helper function to log in as admin
async function loginAsAdmin() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      identifier : 'test.guest.1742659696972@example.com',
      password: 'Password123!'
    });
    
    adminToken = response.data.token;
    console.log('Admin login successful');
    return adminToken;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test suite for guest routes
async function runTests() {
  console.log('Starting Guest Routes Tests');
  
  try {
    // 1. Test guest registration
    console.log('\n--- Testing Guest Registration ---');
    const registerResponse = await axios.post(`${API_URL}/guests/register`, testGuest);
    
    console.log('Registration Response Status:', registerResponse.status);
    console.log('Registration Response Data:', registerResponse.data);
    
    if (registerResponse.status === 201 && registerResponse.data.success) {
      console.log('✅ Guest registration test PASSED');
      guestToken = registerResponse.data.token;
      guestId = registerResponse.data.data.id; // Fixed guestId assignment
    } else {
      console.log('❌ Guest registration test FAILED');
    }
    
    // 2. Test get all guests (admin only)
    console.log('\n--- Testing Get All Guests (Admin) ---');
    await loginAsAdmin();
    
    const getAllResponse = await axios.get(`${API_URL}/guests`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('Get All Guests Response Status:', getAllResponse.status);
    console.log('Get All Guests Count:', getAllResponse.data.count);
    
    if (getAllResponse.status === 200 && getAllResponse.data.success) {
      console.log('✅ Get all guests test PASSED');
    } else {
      console.log('❌ Get all guests test FAILED');
    }
    
    console.log('\n--- All Guest Routes Tests Completed ---');
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
runTests();
