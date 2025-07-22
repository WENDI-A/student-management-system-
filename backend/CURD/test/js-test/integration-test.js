/**
 * Integration test for QueryProcessor with PrismaCrudRouter
 */
const { PrismaCrudRouter } = require('../../index');

// Mock Express app
class MockApp {
  constructor() {
    this.routes = [];
  }

  get(path, ...handlers) {
    this.routes.push({ method: 'GET', path, handlers });
    console.log(`✅ Registered GET ${path}`);
  }

  post(path, ...handlers) {
    this.routes.push({ method: 'POST', path, handlers });
    console.log(`✅ Registered POST ${path}`);
  }

  put(path, ...handlers) {
    this.routes.push({ method: 'PUT', path, handlers });
    console.log(`✅ Registered PUT ${path}`);
  }

  delete(path, ...handlers) {
    this.routes.push({ method: 'DELETE', path, handlers });
    console.log(`✅ Registered DELETE ${path}`);
  }
}

// Mock Prisma model
class MockModel {
  constructor(name) {
    this.name = name;
    this.data = [
      { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
    ];
  }

  async findMany(query) {
    console.log('🔍 Mock findMany called with:', JSON.stringify(query, null, 2));
    return this.data.slice(0, query.take || 10);
  }

  async count(query) {
    console.log('🔢 Mock count called with:', JSON.stringify(query, null, 2));
    return this.data.length;
  }

  async findFirst() {
    return this.data[0];
  }

  async findUnique(query) {
    console.log('🔍 Mock findUnique called with:', JSON.stringify(query, null, 2));
    return this.data.find(item => item.id === query.where.id);
  }

  async create(query) {
    console.log('➕ Mock create called with:', JSON.stringify(query, null, 2));
    const newItem = { id: Date.now(), ...query.data };
    this.data.push(newItem);
    return newItem;
  }

  async update(query) {
    console.log('✏️ Mock update called with:', JSON.stringify(query, null, 2));
    const index = this.data.findIndex(item => item.id === query.where.id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...query.data };
      return this.data[index];
    }
    throw new Error('Record not found');
  }

  async delete(query) {
    console.log('🗑️ Mock delete called with:', JSON.stringify(query, null, 2));
    const index = this.data.findIndex(item => item.id === query.where.id);
    if (index !== -1) {
      return this.data.splice(index, 1)[0];
    }
    throw new Error('Record not found');
  }
}

async function runIntegrationTest() {
  console.log('🧪 Running QueryProcessor Integration Test...\n');

  // Setup
  const mockApp = new MockApp();
  const mockModel = new MockModel('User');
  const mockModels = { user: mockModel };

  // Create router with QueryProcessor
  const router = new PrismaCrudRouter(mockApp, mockModels, true, {
    excludeFields: ['password'],
    version: '1.0.0'
  });

  // Register a route
  console.log('📝 Registering /users route...');
  router.route('/users', mockModel);

  // Verify QueryProcessor was initialized
  console.log('\n✅ QueryProcessor initialized:', !!router.queryProcessor);
  console.log('✅ DatabaseAnalyzer initialized:', !!router.databaseAnalyzer);

  // Test the GET route handler
  console.log('\n🧪 Testing GET route handler...');
  
  // Find the GET route handler
  const getRoute = mockApp.routes.find(r => r.method === 'GET' && r.path === '/users');
  if (!getRoute) {
    console.log('❌ GET route not found');
    return;
  }

  // Mock request and response
  const mockReq = {
    query: {
      filter: '{"name":"John"}',
      select: '{"id":true,"name":true,"email":true}',
      orderBy: '{"name":"asc"}',
      skip: '0',
      take: '10'
    }
  };

  const mockRes = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log('📤 Response:', JSON.stringify(data, null, 2));
      return this;
    },
    set: function(headers) {
      this.headers = headers;
      return this;
    }
  };

  try {
    // Get the actual route handler (last function in handlers array)
    const handler = getRoute.handlers[getRoute.handlers.length - 1];
    await handler(mockReq, mockRes);
    console.log('✅ GET route handler executed successfully');
  } catch (error) {
    console.log('❌ GET route handler failed:', error.message);
  }

  console.log('\n🏁 Integration test completed!');
}

// Run the test
if (require.main === module) {
  runIntegrationTest().catch(console.error);
}

module.exports = { runIntegrationTest };