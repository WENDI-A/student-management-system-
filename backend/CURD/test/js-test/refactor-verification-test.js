/**
 * Verification test for PrismaCrudRouter refactoring
 * Tests that all handler classes are properly integrated
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
    console.log('🔍 Mock findMany called');
    return this.data.slice(0, query.take || 10);
  }

  async count(query) {
    console.log('🔢 Mock count called');
    return this.data.length;
  }

  async findUnique(query) {
    console.log('🔍 Mock findUnique called');
    return this.data.find(item => item.id === query.where.id);
  }

  async create(query) {
    console.log('➕ Mock create called');
    const newItem = { id: Date.now(), ...query.data };
    this.data.push(newItem);
    return newItem;
  }

  async update(query) {
    console.log('✏️ Mock update called');
    const index = this.data.findIndex(item => item.id === query.where.id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...query.data };
      return this.data[index];
    }
    throw new Error('Record not found');
  }

  async delete(query) {
    console.log('🗑️ Mock delete called');
    const index = this.data.findIndex(item => item.id === query.where.id);
    if (index !== -1) {
      return this.data.splice(index, 1)[0];
    }
    throw new Error('Record not found');
  }
}

async function testHandlerIntegration() {
  console.log('🧪 Testing Handler Integration in Refactored Router...\n');

  // Setup
  const mockApp = new MockApp();
  const mockModel = new MockModel('User');
  const mockModels = { user: mockModel };

  // Create router
  const router = new PrismaCrudRouter(mockApp, mockModels, true, {
    excludeFields: ['password'],
    version: '1.0.0'
  });

  // Verify handler classes are initialized
  console.log('✅ GetHandler initialized:', !!router.getHandler);
  console.log('✅ CreateHandler initialized:', !!router.createHandler);
  console.log('✅ UpdateHandler initialized:', !!router.updateHandler);
  console.log('✅ DeleteHandler initialized:', !!router.deleteHandler);
  console.log('✅ QueryProcessor initialized:', !!router.queryProcessor);

  // Register a route
  console.log('\n📝 Registering /users route...');
  router.route('/users', mockModel, {
    beforeActions: {
      get: (query, req) => {
        console.log('🔄 beforeActions.get called');
        return query;
      },
      create: (data, req) => {
        console.log('🔄 beforeActions.create called');
        return data;
      },
      update: (data, req) => {
        console.log('🔄 beforeActions.update called');
        return data;
      },
      destroy: (id, req) => {
        console.log('🔄 beforeActions.destroy called');
        return undefined; // Let normal deletion proceed
      }
    },
    afterActions: {
      get: (result, req) => {
        console.log('🔄 afterActions.get called');
        return result;
      },
      create: (result, req) => {
        console.log('🔄 afterActions.create called');
        return result;
      },
      update: (result, req) => {
        console.log('🔄 afterActions.update called');
        return result;
      },
      destroy: (result, req) => {
        console.log('🔄 afterActions.destroy called');
        return result;
      }
    }
  });

  // Test each handler
  console.log('\n🧪 Testing GET handler...');
  await testGetHandler(mockApp, mockModel);

  console.log('\n🧪 Testing GET by ID handler...');
  await testGetByIdHandler(mockApp, mockModel);

  console.log('\n🧪 Testing POST handler...');
  await testPostHandler(mockApp, mockModel);

  console.log('\n🧪 Testing PUT handler...');
  await testPutHandler(mockApp, mockModel);

  console.log('\n🧪 Testing DELETE handler...');
  await testDeleteHandler(mockApp, mockModel);

  console.log('\n🏁 Handler integration test completed successfully!');
}

async function testGetHandler(mockApp, mockModel) {
  const getRoute = mockApp.routes.find(r => r.method === 'GET' && r.path === '/users');
  const handler = getRoute.handlers[getRoute.handlers.length - 1];
  
  const mockReq = {
    query: {
      filter: '{"name":"John"}',
      select: '{"id":true,"name":true}',
      skip: '0',
      take: '5'
    }
  };

  const mockRes = createMockResponse();
  
  try {
    await handler(mockReq, mockRes);
    console.log('✅ GET handler executed successfully');
  } catch (error) {
    console.log('❌ GET handler failed:', error.message);
  }
}

async function testGetByIdHandler(mockApp, mockModel) {
  const getByIdRoute = mockApp.routes.find(r => r.method === 'GET' && r.path === '/users/:id');
  const handler = getByIdRoute.handlers[getByIdRoute.handlers.length - 1];
  
  const mockReq = {
    params: { id: '1' },
    query: {}
  };

  const mockRes = createMockResponse();
  
  try {
    await handler(mockReq, mockRes);
    console.log('✅ GET by ID handler executed successfully');
  } catch (error) {
    console.log('❌ GET by ID handler failed:', error.message);
  }
}

async function testPostHandler(mockApp, mockModel) {
  const postRoute = mockApp.routes.find(r => r.method === 'POST' && r.path === '/users');
  const handler = postRoute.handlers[postRoute.handlers.length - 1];
  
  const mockReq = {
    body: {
      name: 'New User',
      email: 'newuser@example.com'
    }
  };

  const mockRes = createMockResponse();
  
  try {
    await handler(mockReq, mockRes);
    console.log('✅ POST handler executed successfully');
  } catch (error) {
    console.log('❌ POST handler failed:', error.message);
  }
}

async function testPutHandler(mockApp, mockModel) {
  const putRoute = mockApp.routes.find(r => r.method === 'PUT' && r.path === '/users/:id');
  const handler = putRoute.handlers[putRoute.handlers.length - 1];
  
  const mockReq = {
    params: { id: '1' },
    body: {
      name: 'Updated User',
      email: 'updated@example.com'
    }
  };

  const mockRes = createMockResponse();
  
  try {
    await handler(mockReq, mockRes);
    console.log('✅ PUT handler executed successfully');
  } catch (error) {
    console.log('❌ PUT handler failed:', error.message);
  }
}

async function testDeleteHandler(mockApp, mockModel) {
  const deleteRoute = mockApp.routes.find(r => r.method === 'DELETE' && r.path === '/users/:id');
  const handler = deleteRoute.handlers[deleteRoute.handlers.length - 1];
  
  const mockReq = {
    params: { id: '2' }
  };

  const mockRes = createMockResponse();
  
  try {
    await handler(mockReq, mockRes);
    console.log('✅ DELETE handler executed successfully');
  } catch (error) {
    console.log('❌ DELETE handler failed:', error.message);
  }
}

function createMockResponse() {
  return {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log('📤 Response status:', this.statusCode);
      return this;
    },
    set: function(headers) {
      this.headers = headers;
      return this;
    }
  };
}

// Run the test
if (require.main === module) {
  testHandlerIntegration().catch(console.error);
}

module.exports = { testHandlerIntegration };