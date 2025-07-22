/**
 * Integration tests for Enhanced Error Handling System
 * Tests the ErrorHandler integration with all CRUD handlers
 */

const { ErrorHandler, ERROR_CATEGORIES, ERROR_TYPES } = require('./ErrorHandler');
const { GetHandler } = require('./GetHandler');
const { CreateHandler } = require('./CreateHandler');
const { UpdateHandler } = require('./UpdateHandler');
const { DeleteHandler } = require('./DeleteHandler');

// Mock dependencies
const mockApiResponse = {
  success: (method, data) => ({
    statusCode: 200,
    body: { success: true, method: method.toUpperCase(), data }
  }),
  error: (method, data, message, statusCode) => ({
    statusCode,
    body: {
      error: true,
      method: method.toUpperCase(),
      message,
      data,
      statusCode
    }
  }),
  setResponseHeaders: (res, response) => {
    // Mock implementation
  }
};

const mockDatabaseAnalyzer = {
  analyzeDatabaseStructure: async (model) => ({
    fields: ['id', 'name', 'email'],
    relations: [],
    hasRelations: false
  }),
  getModelFields: async (model) => ['id', 'name', 'email'],
  handleCascadeOperations: async (operation, data, model, id) => ({
    success: true,
    results: []
  })
};

const mockQueryProcessor = {
  processGetQuery: async (query, model) => ({
    where: query.filter || {},
    select: query.select || { id: true },
    orderBy: query.orderBy || {},
    skip: query.skip || 0,
    take: query.take || 10
  })
};

// Mock Express request and response objects
const createMockReq = (data = {}) => ({
  body: data.body || {},
  params: data.params || {},
  query: data.query || {},
  headers: data.headers || {}
});

const createMockRes = () => {
  const res = {
    statusCode: null,
    responseData: null,
    headers: {}
  };
  
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  
  res.json = (data) => {
    res.responseData = data;
    return res;
  };
  
  res.setHeader = (name, value) => {
    res.headers[name] = value;
    return res;
  };
  
  return res;
};

// Mock Prisma model
const createMockModel = (options = {}) => ({
  findMany: async (query) => {
    if (options.throwError) {
      const error = new Error(options.errorMessage || 'Database error');
      error.code = options.errorCode || 'P2021';
      throw error;
    }
    return [{ id: 1, name: 'Test', email: 'test@example.com' }];
  },
  
  findUnique: async (query) => {
    if (options.throwError) {
      const error = new Error(options.errorMessage || 'Record not found');
      error.code = options.errorCode || 'P2025';
      throw error;
    }
    if (options.notFound) {
      return null;
    }
    return { id: 1, name: 'Test', email: 'test@example.com' };
  },
  
  create: async (data) => {
    if (options.throwError) {
      const error = new Error(options.errorMessage || 'Unique constraint violation');
      error.code = options.errorCode || 'P2002';
      error.meta = { target: ['email'] };
      throw error;
    }
    return { id: 1, ...data.data };
  },
  
  update: async (query) => {
    if (options.throwError) {
      const error = new Error(options.errorMessage || 'Record not found');
      error.code = options.errorCode || 'P2025';
      throw error;
    }
    return { id: query.where.id, ...query.data };
  },
  
  delete: async (query) => {
    if (options.throwError) {
      const error = new Error(options.errorMessage || 'Record not found');
      error.code = options.errorCode || 'P2025';
      throw error;
    }
    return { id: query.where.id };
  },
  
  count: async (query) => {
    if (options.throwError) {
      const error = new Error(options.errorMessage || 'Database error');
      error.code = options.errorCode || 'P2021';
      throw error;
    }
    return 1;
  }
});

/**
 * Test GetHandler error handling
 */
async function testGetHandlerErrorHandling() {
  console.log('\n=== Testing GetHandler Error Handling ===');
  
  try {
    const options = { environment: 'development' };
    const getHandler = new GetHandler(mockQueryProcessor, mockApiResponse, mockDatabaseAnalyzer, options);
    
    // Test Prisma error handling
    const mockModel = createMockModel({ 
      throwError: true, 
      errorCode: 'P2021',
      errorMessage: 'Table does not exist'
    });
    
    const req = createMockReq({ query: { filter: '{"name": "test"}' } });
    const res = createMockRes();
    
    await getHandler.handleGetAll(req, res, mockModel, {});
    
    console.log('✅ GetHandler Prisma error handling successful');
    console.log('   Status Code:', res.statusCode);
    console.log('   Error Type:', res.responseData?.data?.type);
    console.log('   Error Category:', res.responseData?.data?.category);
    console.log('   Error Message:', res.responseData?.data?.message);
    
    // Test query processing error
    const mockQueryProcessorError = {
      processGetQuery: async () => {
        throw new Error('Invalid JSON syntax in filter parameter');
      }
    };
    
    const getHandlerQueryError = new GetHandler(mockQueryProcessorError, mockApiResponse, mockDatabaseAnalyzer, options);
    const req2 = createMockReq({ query: { filter: '{ invalid json }' } });
    const res2 = createMockRes();
    
    await getHandlerQueryError.handleGetAll(req2, res2, createMockModel(), {});
    
    console.log('✅ GetHandler query processing error handling successful');
    console.log('   Status Code:', res2.statusCode);
    console.log('   Error Type:', res2.responseData?.data?.type);
    
  } catch (error) {
    console.log('❌ GetHandler error handling test failed:', error.message);
  }
}

/**
 * Test CreateHandler error handling
 */
async function testCreateHandlerErrorHandling() {
  console.log('\n=== Testing CreateHandler Error Handling ===');
  
  try {
    const options = { environment: 'development' };
    const createHandler = new CreateHandler(mockApiResponse, mockDatabaseAnalyzer, options);
    
    // Test unique constraint violation
    const mockModel = createMockModel({ 
      throwError: true, 
      errorCode: 'P2002',
      errorMessage: 'Unique constraint failed on the fields: (`email`)'
    });
    
    const req = createMockReq({ 
      body: { name: 'Test User', email: 'existing@example.com' }
    });
    const res = createMockRes();
    
    await createHandler.handleCreate(req, res, mockModel, {});
    
    console.log('✅ CreateHandler unique constraint error handling successful');
    console.log('   Status Code:', res.statusCode);
    console.log('   Error Type:', res.responseData?.data?.type);
    console.log('   Error Category:', res.responseData?.data?.category);
    console.log('   Field:', res.responseData?.data?.details?.field);
    
    // Test validation error
    const req2 = createMockReq({ body: {} }); // Empty body should trigger validation
    const res2 = createMockRes();
    
    await createHandler.handleCreate(req2, res2, createMockModel(), {});
    
    console.log('✅ CreateHandler validation error handling successful');
    console.log('   Status Code:', res2.statusCode);
    console.log('   Error Type:', res2.responseData?.data?.type);
    
  } catch (error) {
    console.log('❌ CreateHandler error handling test failed:', error.message);
  }
}

/**
 * Test UpdateHandler error handling
 */
async function testUpdateHandlerErrorHandling() {
  console.log('\n=== Testing UpdateHandler Error Handling ===');
  
  try {
    const options = { environment: 'development' };
    const updateHandler = new UpdateHandler(mockApiResponse, mockDatabaseAnalyzer, options);
    
    // Test record not found error
    const mockModel = createMockModel({ 
      throwError: true, 
      errorCode: 'P2025',
      errorMessage: 'Record to update does not exist'
    });
    
    const req = createMockReq({ 
      params: { id: '999' },
      body: { name: 'Updated Name' }
    });
    const res = createMockRes();
    
    await updateHandler.handleUpdate(req, res, mockModel, {});
    
    console.log('✅ UpdateHandler record not found error handling successful');
    console.log('   Status Code:', res.statusCode);
    console.log('   Error Type:', res.responseData?.data?.type);
    console.log('   Error Category:', res.responseData?.data?.category);
    
    // Test invalid ID error
    const req2 = createMockReq({ 
      params: { id: null },
      body: { name: 'Updated Name' }
    });
    const res2 = createMockRes();
    
    await updateHandler.handleUpdate(req2, res2, createMockModel(), {});
    
    console.log('✅ UpdateHandler invalid ID error handling successful');
    console.log('   Status Code:', res2.statusCode);
    console.log('   Error Type:', res2.responseData?.data?.type);
    
  } catch (error) {
    console.log('❌ UpdateHandler error handling test failed:', error.message);
  }
}

/**
 * Test DeleteHandler error handling
 */
async function testDeleteHandlerErrorHandling() {
  console.log('\n=== Testing DeleteHandler Error Handling ===');
  
  try {
    const options = { environment: 'development' };
    const deleteHandler = new DeleteHandler(mockApiResponse, mockDatabaseAnalyzer, options);
    
    // Test record not found error
    const mockModel = createMockModel({ 
      throwError: true, 
      errorCode: 'P2025',
      errorMessage: 'Record to delete does not exist'
    });
    
    const req = createMockReq({ params: { id: '999' } });
    const res = createMockRes();
    
    await deleteHandler.handleDelete(req, res, mockModel, {});
    
    console.log('✅ DeleteHandler record not found error handling successful');
    console.log('   Status Code:', res.statusCode);
    console.log('   Error Type:', res.responseData?.data?.type);
    console.log('   Error Category:', res.responseData?.data?.category);
    
    // Test foreign key constraint error
    const mockModelFK = createMockModel({ 
      throwError: true, 
      errorCode: 'P2003',
      errorMessage: 'Foreign key constraint failed on the field: `userId`'
    });
    
    const req2 = createMockReq({ params: { id: '1' } });
    const res2 = createMockRes();
    
    await deleteHandler.handleDelete(req2, res2, mockModelFK, {});
    
    console.log('✅ DeleteHandler foreign key constraint error handling successful');
    console.log('   Status Code:', res2.statusCode);
    console.log('   Error Type:', res2.responseData?.data?.type);
    
  } catch (error) {
    console.log('❌ DeleteHandler error handling test failed:', error.message);
  }
}

/**
 * Test environment-specific error responses
 */
async function testEnvironmentSpecificErrors() {
  console.log('\n=== Testing Environment-Specific Error Responses ===');
  
  try {
    // Test development environment
    const devOptions = { environment: 'development' };
    const devHandler = new GetHandler(mockQueryProcessor, mockApiResponse, mockDatabaseAnalyzer, devOptions);
    
    const mockModel = createMockModel({ 
      throwError: true, 
      errorCode: 'P2021',
      errorMessage: 'Table does not exist'
    });
    
    const req = createMockReq();
    const res = createMockRes();
    
    await devHandler.handleGetAll(req, res, mockModel, {});
    
    console.log('✅ Development environment error response');
    console.log('   Has stack trace:', !!res.responseData?.data?.stack);
    console.log('   Has details:', !!res.responseData?.data?.details);
    
    // Test production environment
    const prodOptions = { environment: 'production' };
    const prodHandler = new GetHandler(mockQueryProcessor, mockApiResponse, mockDatabaseAnalyzer, prodOptions);
    
    const req2 = createMockReq();
    const res2 = createMockRes();
    
    await prodHandler.handleGetAll(req2, res2, mockModel, {});
    
    console.log('✅ Production environment error response');
    console.log('   Has stack trace:', !!res2.responseData?.data?.stack);
    console.log('   Has details:', !!res2.responseData?.data?.details);
    
  } catch (error) {
    console.log('❌ Environment-specific error testing failed:', error.message);
  }
}

/**
 * Test custom error handler integration
 */
async function testCustomErrorHandlerIntegration() {
  console.log('\n=== Testing Custom Error Handler Integration ===');
  
  try {
    const options = { environment: 'development' };
    const getHandler = new GetHandler(mockQueryProcessor, mockApiResponse, mockDatabaseAnalyzer, options);
    
    // Custom error handler
    const customErrorHandler = (error, method, apiResponse) => {
      return apiResponse.error(method, { custom: true }, 'Custom error handling', 418);
    };
    
    const mockModel = createMockModel({ 
      throwError: true, 
      errorMessage: 'Test error'
    });
    
    const req = createMockReq();
    const res = createMockRes();
    
    await getHandler.handleGetAll(req, res, mockModel, {}, customErrorHandler);
    
    console.log('✅ Custom error handler integration successful');
    console.log('   Status Code:', res.statusCode);
    console.log('   Custom flag:', res.responseData?.data?.custom);
    console.log('   Message:', res.responseData?.message);
    
  } catch (error) {
    console.log('❌ Custom error handler integration test failed:', error.message);
  }
}

/**
 * Test error message truncation and sanitization
 */
async function testErrorMessageHandling() {
  console.log('\n=== Testing Error Message Handling ===');
  
  try {
    const options = { 
      environment: 'development',
      maxErrorMessageLength: 50
    };
    const errorHandler = new ErrorHandler(options);
    
    // Test long error message
    const longMessage = 'This is a very long error message that should be truncated because it exceeds the maximum allowed length for error messages in the system';
    const error = errorHandler.createError('INVALID_INPUT', longMessage);
    
    console.log('✅ Error message truncation test');
    console.log('   Original length:', longMessage.length);
    console.log('   Truncated length:', error.message.length);
    console.log('   Truncated message:', error.message);
    
    // Test sensitive data sanitization
    const sensitiveError = errorHandler.createError(
      'AUTHENTICATION_ERROR',
      'Login failed',
      { 
        user: 'john@example.com',
        password: 'secret123',
        token: 'jwt-token-here',
        normalField: 'normal-value'
      }
    );
    
    console.log('✅ Sensitive data sanitization test');
    console.log('   Password redacted:', sensitiveError.details.password === '[REDACTED]');
    console.log('   Token redacted:', sensitiveError.details.token === '[REDACTED]');
    console.log('   Normal field preserved:', sensitiveError.details.normalField === 'normal-value');
    
  } catch (error) {
    console.log('❌ Error message handling test failed:', error.message);
  }
}

/**
 * Run all integration tests
 */
async function runAllIntegrationTests() {
  console.log('🧪 Running Enhanced Error Handling Integration Tests\n');
  
  await testGetHandlerErrorHandling();
  await testCreateHandlerErrorHandling();
  await testUpdateHandlerErrorHandling();
  await testDeleteHandlerErrorHandling();
  await testEnvironmentSpecificErrors();
  await testCustomErrorHandlerIntegration();
  await testErrorMessageHandling();
  
  console.log('\n✅ All Enhanced Error Handling Integration tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllIntegrationTests().catch(console.error);
}

module.exports = {
  runAllIntegrationTests,
  testGetHandlerErrorHandling,
  testCreateHandlerErrorHandling,
  testUpdateHandlerErrorHandling,
  testDeleteHandlerErrorHandling,
  testEnvironmentSpecificErrors,
  testCustomErrorHandlerIntegration,
  testErrorMessageHandling
};