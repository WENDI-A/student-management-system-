/**
 * Test backward compatibility with legacy methods
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
  async findMany() { return []; }
  async count() { return 0; }
  async findUnique() { return { id: 1, name: 'Test' }; }
  async create() { return { id: 1, name: 'Test' }; }
  async update() { return { id: 1, name: 'Updated' }; }
  async delete() { return { id: 1, name: 'Deleted' }; }
}

function testBackwardCompatibility() {
  console.log('🧪 Testing Backward Compatibility...\n');

  const mockApp = new MockApp();
  const mockModel = new MockModel();
  const mockModels = { user: mockModel };

  // Create router
  const router = new PrismaCrudRouter(mockApp, mockModels, true, {
    version: '1.0.0'
  });

  // Test legacy createCrudRoute method
  console.log('📝 Testing legacy createCrudRoute method...');
  router.createCrudRoute('/legacy-users', mockModel, {
    includeRelations: true,
    excludeRoute: ['delete']
  });

  // Verify routes were created
  const legacyRoutes = mockApp.routes.filter(r => r.path.includes('legacy-users'));
  console.log(`✅ Created ${legacyRoutes.length} legacy routes`);
  
  legacyRoutes.forEach(route => {
    console.log(`   ${route.method} ${route.path}`);
  });

  // Test that DELETE route was excluded
  const deleteRoute = legacyRoutes.find(r => r.method === 'DELETE');
  if (!deleteRoute) {
    console.log('✅ DELETE route correctly excluded');
  } else {
    console.log('❌ DELETE route should have been excluded');
  }

  // Test new route method for comparison
  console.log('\n📝 Testing new route method...');
  router.route('/new-users', mockModel, {
    includeRelations: true,
    excludeRoute: ['delete']
  });

  const newRoutes = mockApp.routes.filter(r => r.path.includes('new-users'));
  console.log(`✅ Created ${newRoutes.length} new routes`);
  
  newRoutes.forEach(route => {
    console.log(`   ${route.method} ${route.path}`);
  });

  // Verify both methods create the same number of routes
  if (legacyRoutes.length === newRoutes.length) {
    console.log('✅ Legacy and new methods create same number of routes');
  } else {
    console.log('❌ Route count mismatch between legacy and new methods');
  }

  console.log('\n✅ Backward compatibility test completed!');
}

// Run the test
if (require.main === module) {
  testBackwardCompatibility();
}

module.exports = { testBackwardCompatibility };