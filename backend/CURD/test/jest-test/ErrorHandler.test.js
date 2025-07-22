/**
 * Tests for Enhanced Error Handler
 */

const { ErrorHandler, ERROR_CATEGORIES, ERROR_TYPES } = require('./ErrorHandler');

// Mock API Response for testing
const mockApiResponse = {
  error: (method, data, message, statusCode) => ({
    statusCode,
    body: {
      error: true,
      method: method.toUpperCase(),
      message,
      data,
      statusCode
    }
  })
};

/**
 * Test ErrorHandler basic functionality
 */
async function testBasicErrorCreation() {
  console.log('\n=== Testing Basic Error Creation ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test basic error creation
    const error = errorHandler.createError(
      'INVALID_INPUT',
      'Test validation error',
      { field: 'email', value: 'invalid-email' }
    );
    
    console.log('✅ Basic error creation successful');
    console.log('   Type:', error.type);
    console.log('   Category:', error.category);
    console.log('   Message:', error.message);
    console.log('   Status Code:', error.statusCode);
    console.log('   Details:', JSON.stringify(error.details, null, 2));
    
    // Verify error structure
    if (error.type === 'INVALID_INPUT' && 
        error.category === ERROR_CATEGORIES.VALIDATION &&
        error.statusCode === 400) {
      console.log('✅ Error structure is correct');
    } else {
      console.log('❌ Error structure is incorrect');
    }
    
  } catch (error) {
    console.log('❌ Basic error creation failed:', error.message);
  }
}

/**
 * Test Prisma error handling
 */
async function testPrismaErrorHandling() {
  console.log('\n=== Testing Prisma Error Handling ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test unique constraint violation
    const prismaError = {
      code: 'P2002',
      message: 'Unique constraint failed on the fields: (`email`)',
      meta: {
        target: ['email']
      }
    };
    
    const error = errorHandler.handlePrismaError(prismaError, 'create', { model: 'User' });
    
    console.log('✅ Prisma error handling successful');
    console.log('   Type:', error.type);
    console.log('   Message:', error.message);
    console.log('   Field:', error.details.field);
    console.log('   Prisma Code:', error.details.prismaCode);
    
    // Test foreign key constraint violation
    const fkError = {
      code: 'P2003',
      message: 'Foreign key constraint failed on the field: `userId`',
      meta: {
        field_name: 'userId'
      }
    };
    
    const fkErrorResult = errorHandler.handlePrismaError(fkError, 'create');
    console.log('✅ Foreign key error handling successful');
    console.log('   Type:', fkErrorResult.type);
    console.log('   Message:', fkErrorResult.message);
    
    // Test record not found
    const notFoundError = {
      code: 'P2025',
      message: 'Record to delete does not exist.'
    };
    
    const notFoundResult = errorHandler.handlePrismaError(notFoundError, 'delete');
    console.log('✅ Not found error handling successful');
    console.log('   Type:', notFoundResult.type);
    console.log('   Status Code:', notFoundResult.statusCode);
    
  } catch (error) {
    console.log('❌ Prisma error handling failed:', error.message);
  }
}

/**
 * Test nested select error handling
 */
async function testNestedSelectErrorHandling() {
  console.log('\n=== Testing Nested Select Error Handling ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test depth error
    const depthErrors = [
      "Select nesting too deep at path 'user.posts.comments.replies.author' (max: 5)"
    ];
    
    const depthError = errorHandler.handleNestedSelectErrors(depthErrors, 'select');
    console.log('✅ Depth error handling successful');
    console.log('   Type:', depthError.type);
    console.log('   Message:', depthError.message);
    
    // Test complexity error
    const complexityErrors = [
      "Select query too complex (score: 150, max: 100)"
    ];
    
    const complexityError = errorHandler.handleNestedSelectErrors(complexityErrors, 'select');
    console.log('✅ Complexity error handling successful');
    console.log('   Type:', complexityError.type);
    
    // Test invalid field error
    const fieldErrors = [
      "Unknown field 'user.invalidField' will be skipped"
    ];
    
    const fieldError = errorHandler.handleNestedSelectErrors(fieldErrors, 'select');
    console.log('✅ Invalid field error handling successful');
    console.log('   Type:', fieldError.type);
    
    // Test multiple errors
    const multipleErrors = [
      "Select nesting too deep at path 'user.posts' (max: 3)",
      "Unknown field 'user.posts.invalidField' will be skipped",
      "Too many fields at path 'user.posts.comments' (25, recommended max: 20)"
    ];
    
    const multiError = errorHandler.handleNestedSelectErrors(multipleErrors, 'select');
    console.log('✅ Multiple errors handling successful');
    console.log('   Error Count:', multiError.details.errorCount);
    
  } catch (error) {
    console.log('❌ Nested select error handling failed:', error.message);
  }
}

/**
 * Test validation error handling
 */
async function testValidationErrorHandling() {
  console.log('\n=== Testing Validation Error Handling ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test validation result with errors
    const validationResult = {
      isValid: false,
      errors: [
        {
          type: 'REQUIRED_FIELD_MISSING',
          field: 'email',
          message: 'Email is required',
          path: 'user.email'
        },
        {
          type: 'INVALID_FORMAT',
          field: 'phone',
          message: 'Invalid phone number format'
        }
      ],
      fieldErrors: {
        email: 'Email is required',
        phone: 'Invalid phone number format'
      },
      warnings: [
        'Field "middleName" is optional but recommended'
      ]
    };
    
    const error = errorHandler.handleValidationErrors(validationResult, 'create');
    console.log('✅ Validation error handling successful');
    console.log('   Type:', error.type);
    console.log('   Message:', error.message);
    console.log('   Field:', error.details.field);
    console.log('   Path:', error.details.path);
    console.log('   Field Errors:', Object.keys(error.details.fieldErrors || {}));
    
    // Test valid validation result (should return null)
    const validResult = { isValid: true, errors: [] };
    const noError = errorHandler.handleValidationErrors(validResult, 'update');
    
    if (noError === null) {
      console.log('✅ Valid validation result correctly returns null');
    } else {
      console.log('❌ Valid validation result should return null');
    }
    
  } catch (error) {
    console.log('❌ Validation error handling failed:', error.message);
  }
}

/**
 * Test query processing error handling
 */
async function testQueryProcessingErrorHandling() {
  console.log('\n=== Testing Query Processing Error Handling ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test query syntax error
    const syntaxError = new Error('Invalid JSON syntax in filter parameter');
    const query = { filter: '{ invalid json }', select: { id: true } };
    
    const error = errorHandler.handleQueryProcessingError(syntaxError, query, 'filter');
    console.log('✅ Query syntax error handling successful');
    console.log('   Type:', error.type);
    console.log('   Message:', error.message);
    console.log('   Query included:', !!error.details.query);
    
    // Test complexity error
    const complexityError = new Error('Query too complex: exceeds maximum allowed complexity score');
    const complexError = errorHandler.handleQueryProcessingError(complexityError, query, 'select');
    console.log('✅ Query complexity error handling successful');
    console.log('   Type:', complexError.type);
    
    // Test timeout error
    const timeoutError = new Error('Query execution timeout after 30 seconds');
    const timeoutResult = errorHandler.handleQueryProcessingError(timeoutError, query, 'execute');
    console.log('✅ Query timeout error handling successful');
    console.log('   Type:', timeoutResult.type);
    
  } catch (error) {
    console.log('❌ Query processing error handling failed:', error.message);
  }
}

/**
 * Test HTTP response creation
 */
async function testHttpResponseCreation() {
  console.log('\n=== Testing HTTP Response Creation ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test with API response handler
    const error = errorHandler.createError(
      'RESOURCE_NOT_FOUND',
      'User not found',
      { id: '123', model: 'User' }
    );
    
    const httpResponse = errorHandler.createHttpResponse(error, 'GET', mockApiResponse);
    console.log('✅ HTTP response creation successful');
    console.log('   Status Code:', httpResponse.statusCode);
    console.log('   Response Body:', JSON.stringify(httpResponse.body, null, 2));
    
    // Test without API response handler (fallback)
    const fallbackResponse = errorHandler.createHttpResponse(error, 'POST');
    console.log('✅ Fallback response creation successful');
    console.log('   Status Code:', fallbackResponse.statusCode);
    console.log('   Has error details:', !!fallbackResponse.body.details);
    
  } catch (error) {
    console.log('❌ HTTP response creation failed:', error.message);
  }
}

/**
 * Test environment-specific behavior
 */
async function testEnvironmentBehavior() {
  console.log('\n=== Testing Environment-Specific Behavior ===');
  
  try {
    // Test development environment
    const devHandler = new ErrorHandler({ environment: 'development' });
    const devError = devHandler.createError(
      'INTERNAL_SERVER_ERROR',
      'Database connection failed',
      { connection: 'mysql://localhost:3306' },
      new Error('Connection timeout')
    );
    
    console.log('✅ Development error created');
    console.log('   Has stack trace:', !!devError.stack);
    console.log('   Has original error:', !!devError.originalError);
    
    // Test production environment
    const prodHandler = new ErrorHandler({ environment: 'production' });
    const prodError = prodHandler.createError(
      'INTERNAL_SERVER_ERROR',
      'Database connection failed',
      { connection: 'mysql://localhost:3306' },
      new Error('Connection timeout')
    );
    
    console.log('✅ Production error created');
    console.log('   Has stack trace:', !!prodError.stack);
    console.log('   Has original error:', !!prodError.originalError);
    
    // Test HTTP responses in different environments
    const devResponse = devHandler.createHttpResponse(devError, 'GET', mockApiResponse);
    const prodResponse = prodHandler.createHttpResponse(prodError, 'GET', mockApiResponse);
    
    console.log('✅ Environment-specific responses created');
    console.log('   Dev response has details:', !!devResponse.body.data.details);
    console.log('   Prod response has details:', !!prodResponse.body.data.details);
    
  } catch (error) {
    console.log('❌ Environment behavior testing failed:', error.message);
  }
}

/**
 * Test error message truncation and sanitization
 */
async function testMessageTruncationAndSanitization() {
  console.log('\n=== Testing Message Truncation and Sanitization ===');
  
  const errorHandler = new ErrorHandler({ 
    environment: 'development',
    maxErrorMessageLength: 50
  });
  
  try {
    // Test message truncation
    const longMessage = 'This is a very long error message that should be truncated because it exceeds the maximum allowed length';
    const error = errorHandler.createError('INVALID_INPUT', longMessage);
    
    console.log('✅ Message truncation test');
    console.log('   Original length:', longMessage.length);
    console.log('   Truncated length:', error.message.length);
    console.log('   Truncated message:', error.message);
    
    // Test details sanitization
    const sensitiveDetails = {
      user: 'john@example.com',
      password: 'secret123',
      token: 'jwt-token-here',
      apiKey: 'api-key-value',
      normalField: 'normal-value'
    };
    
    const sanitizedError = errorHandler.createError(
      'AUTHENTICATION_ERROR',
      'Login failed',
      sensitiveDetails
    );
    
    console.log('✅ Details sanitization test');
    console.log('   Sanitized details:', JSON.stringify(sanitizedError.details, null, 2));
    
    // Test query sanitization
    const sensitiveQuery = {
      filter: { email: 'user@example.com', password: 'secret' },
      select: { id: true, email: true }
    };
    
    const queryError = new Error('Query failed');
    const queryErrorResult = errorHandler.handleQueryProcessingError(queryError, sensitiveQuery);
    
    console.log('✅ Query sanitization test');
    console.log('   Sanitized query:', JSON.stringify(queryErrorResult.details.query, null, 2));
    
  } catch (error) {
    console.log('❌ Truncation and sanitization testing failed:', error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🧪 Running Enhanced Error Handler Tests\n');
  
  await testBasicErrorCreation();
  await testPrismaErrorHandling();
  await testNestedSelectErrorHandling();
  await testValidationErrorHandling();
  await testQueryProcessingErrorHandling();
  await testHttpResponseCreation();
  await testEnvironmentBehavior();
  await testMessageTruncationAndSanitization();
  
  console.log('\n✅ All Enhanced Error Handler tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testBasicErrorCreation,
  testPrismaErrorHandling,
  testNestedSelectErrorHandling,
  testValidationErrorHandling,
  testQueryProcessingErrorHandling,
  testHttpResponseCreation,
  testEnvironmentBehavior,
  testMessageTruncationAndSanitization
};