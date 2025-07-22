/**
 * Test middleware composition with refactored handlers
 */
const { PrismaCrudRouter } = require('../../index');

// Mock Express app
class MockApp {
  constructor() {
    this.routes = [];
  }

  get(path, ...handlers) {
    this.routes.push({ method: 'GET', path, handlers });
    console.log(`✅ Registered GET ${path} with ${handlers.length} handlers`);
  }

  post(path, ...handlers) {
    this.routes.push({ method: 'POST', path, handlers });
    console.log(`✅ Registered POST ${path} with ${handlers.length} handlers`);
  }

  put(path, ...handlers) {
    this.routes.push({ method: 'PUT', path, handlers });
    console.log(`✅ Registered PUT ${path} with ${handlers.length} handlers`);
  }

  delete(path, ...handlers) {
    this.routes.push({ method: 'DELETE', path, handlers });
    console.log(`✅ Registered DELETE ${path} with ${handlers.length} handlers`);
  }
}

// Mock Prisma model
class MockModel {
  async findMany() { return []; }
  async count() { return 0; }
  async findUnique() { return { id: 1, name: 'Test' }; }
  async create() { return { id: 1, name: 'Test' }; }
  async update() { return { id: 1, name: 'Updated' }; }
  async delete() { return { id: 1, name: 'Deleted' }; }
}

function testMiddlewareComposition() {
  console.log('🧪 Testing Middleware Composition...\n');

  const mockApp = new MockApp();
  const mockModel = new MockModel();
  const mockModels = { user: mockModel };

  // Create middleware functions
  const globalMiddleware = (req, res, next) => {
    console.log('🌐 Global middleware');
    next();
  };

  const authMiddleware = (req, res, next) => {
    console.log('🔐 Auth middleware');
    next();
  };

  const createMiddleware = (req, res, next) => {
    console.log('➕ Create-specific middleware');
    next();
  };

  const updateMiddleware = (req, res, next) => {
    console.log('✏️ Update-specific middleware');
    next();
  };

  // Create router with global middleware
  const router = new PrismaCrudRouter(mockApp, mockModels, true, {
    defaultMiddleware: [globalMiddleware],
    version: '1.0.0'
  });

  // Register route with complex middleware configuration
  router.route('/users', mockModel, {
    middleware: {
      default: [], // No additional default middleware
      create: [createMiddleware],
      update: [updateMiddleware]
    },
    authMiddleware: authMiddleware
  });

  // Verify middleware composition
  console.log('\n🔍 Verifying middleware composition:');
  
  const getRoute = mockApp.routes.find(r => r.method === 'GET' && r.path === '/users');
  console.log(`GET route has ${getRoute.handlers.length} handlers (should be 3: global + auth + handler)`);
  
  const postRoute = mockApp.routes.find(r => r.method === 'POST' && r.path === '/users');
  console.log(`POST route has ${postRoute.handlers.length} handlers (should be 4: global + create + auth + handler)`);
  
  const putRoute = mockApp.routes.find(r => r.method === 'PUT' && r.path === '/users/:id');
  console.log(`PUT route has ${putRoute.handlers.length} handlers (should be 4: global + update + auth + handler)`);
  
  const deleteRoute = mockApp.routes.find(r => r.method === 'DELETE' && r.path === '/users/:id');
  console.log(`DELETE route has ${deleteRoute.handlers.length} handlers (should be 3: global + auth + handler)`);

  console.log('\n✅ Middleware composition test completed!');
}

// Run the test
if (require.main === module) {
  testMiddlewareComposition();
}

module.exports = { testMiddlewareComposition };