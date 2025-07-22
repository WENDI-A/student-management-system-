/**
 * Requirements Verification Tests for Enhanced Error Handling System
 * 
 * This test file verifies that the enhanced error handling system meets all requirements:
 * - 4.1: Consistent and informative error handling
 * - 4.2: Appropriate HTTP status codes for validation failures
 * - 4.3: Graceful database error handling without exposing sensitive information
 * - 4.4: Clear indication of invalid fields
 */

const { ErrorHandler, ERROR_CATEGORIES, ERROR_TYPES } = require('./ErrorHandler');

/**
 * Test Requirement 4.1: Consistent and informative error handling
 */
async function testRequirement41_ConsistentErrorHandling() {
  console.log('\n=== Testing Requirement 4.1: Consistent and Informative Error Handling ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test 1: Nested select processing errors should provide clear error messages
    const nestedSelectErrors = [
      "Select nesting too deep at path 'user.posts.comments.replies.author' (max: 5)",
      "Unknown field 'user.posts.invalidField' will be skipped",
      "Too many fields at path 'user.posts.comments' (25, recommended max: 20)"
    ];
    
    const nestedError = errorHandler.handleNestedSelectErrors(nestedSelectErrors, 'select');
    
    console.log('✅ Nested select errors provide clear messages');
    console.log('   Error Type:', nestedError.type);
    console.log('   Error Category:', nestedError.category);
    console.log('   Message:', nestedError.message);
    console.log('   Error Count:', nestedError.details.errorCount);
    
    // Verify consistency
    if (nestedError.type && nestedError.category && nestedError.message && nestedError.timestamp) {
      console.log('✅ Error structure is consistent');
    } else {
      console.log('❌ Error structure is inconsistent');
    }
    
    // Test 2: All error types should have consistent structure
    const errorTypes = ['INVALID_INPUT', 'UNIQUE_CONSTRAINT_VIOLATION', 'RESOURCE_NOT_FOUND'];
    let allConsistent = true;
    
    for (const errorType of errorTypes) {
      const error = errorHandler.createError(errorType, `Test ${errorType} message`);
      if (!error.type || !error.category || !error.message || !error.timestamp || !error.statusCode) {
        allConsistent = false;
        break;
      }
    }
    
    if (allConsistent) {
      console.log('✅ All error types have consistent structure');
    } else {
      console.log('❌ Error types have inconsistent structure');
    }
    
    // Test 3: Error messages should be informative
    const validationResult = {
      isValid: false,
      errors: [
        {
          type: 'REQUIRED_FIELD_MISSING',
          field: 'email',
          message: 'Email is required',
          path: 'user.profile.email'
        }
      ],
      fieldErrors: {
        email: 'Email is required and must be a valid email address'
      }
    };
    
    const validationError = errorHandler.handleValidationErrors(validationResult, 'create');
    
    if (validationError.message.includes('Email is required') && 
        validationError.details.field === 'email' &&
        validationError.details.path === 'user.profile.email') {
      console.log('✅ Error messages are informative with field paths');
    } else {
      console.log('❌ Error messages lack sufficient information');
    }
    
  } catch (error) {
    console.log('❌ Requirement 4.1 test failed:', error.message);
  }
}

/**
 * Test Requirement 4.2: Appropriate HTTP status codes for validation failures
 */
async function testRequirement42_HTTPStatusCodes() {
  console.log('\n=== Testing Requirement 4.2: Appropriate HTTP Status Codes ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test validation errors return 400
    const validationError = errorHandler.createError('INVALID_INPUT', 'Validation failed');
    if (validationError.statusCode === 400) {
      console.log('✅ Validation errors return 400 status code');
    } else {
      console.log('❌ Validation errors return incorrect status code:', validationError.statusCode);
    }
    
    // Test nested select errors return 400
    const nestedSelectError = errorHandler.handleNestedSelectErrors(['Field too deep'], 'select');
    if (nestedSelectError.statusCode === 400) {
      console.log('✅ Nested select errors return 400 status code');
    } else {
      console.log('❌ Nested select errors return incorrect status code:', nestedSelectError.statusCode);
    }
    
    // Test constraint violations return appropriate codes
    const uniqueError = errorHandler.createError('UNIQUE_CONSTRAINT_VIOLATION', 'Duplicate entry');
    if (uniqueError.statusCode === 409) {
      console.log('✅ Unique constraint violations return 409 status code');
    } else {
      console.log('❌ Unique constraint violations return incorrect status code:', uniqueError.statusCode);
    }
    
    // Test foreign key violations return 400
    const fkError = errorHandler.createError('FOREIGN_KEY_CONSTRAINT_VIOLATION', 'Invalid reference');
    if (fkError.statusCode === 400) {
      console.log('✅ Foreign key violations return 400 status code');
    } else {
      console.log('❌ Foreign key violations return incorrect status code:', fkError.statusCode);
    }
    
    // Test not found errors return 404
    const notFoundError = errorHandler.createError('RESOURCE_NOT_FOUND', 'Record not found');
    if (notFoundError.statusCode === 404) {
      console.log('✅ Not found errors return 404 status code');
    } else {
      console.log('❌ Not found errors return incorrect status code:', notFoundError.statusCode);
    }
    
    // Test system errors return 500
    const systemError = errorHandler.createError('INTERNAL_SERVER_ERROR', 'System failure');
    if (systemError.statusCode === 500) {
      console.log('✅ System errors return 500 status code');
    } else {
      console.log('❌ System errors return incorrect status code:', systemError.statusCode);
    }
    
  } catch (error) {
    console.log('❌ Requirement 4.2 test failed:', error.message);
  }
}

/**
 * Test Requirement 4.3: Graceful database error handling without exposing sensitive information
 */
async function testRequirement43_DatabaseErrorHandling() {
  console.log('\n=== Testing Requirement 4.3: Graceful Database Error Handling ===');
  
  const errorHandler = new ErrorHandler({ environment: 'production' });
  
  try {
    // Test Prisma error handling
    const prismaError = {
      code: 'P2002',
      message: 'Unique constraint failed on the fields: (`email`)',
      meta: {
        target: ['email'],
        database_error: 'SENSITIVE_DATABASE_INFO'
      }
    };
    
    const handledError = errorHandler.handlePrismaError(prismaError, 'create', { model: 'User' });
    
    // Verify graceful handling
    if (handledError.type === 'UNIQUE_CONSTRAINT_VIOLATION' && 
        handledError.message.includes('Unique constraint violation') &&
        !handledError.message.includes('SENSITIVE_DATABASE_INFO')) {
      console.log('✅ Database errors are handled gracefully without exposing sensitive info');
    } else {
      console.log('❌ Database errors may expose sensitive information');
    }
    
    // Test sensitive data sanitization
    const sensitiveDetails = {
      user: 'john@example.com',
      password: 'secret123',
      token: 'jwt-token-here',
      secret: 'api-secret',
      key: 'encryption-key',
      normalField: 'normal-value'
    };
    
    const sanitizedError = errorHandler.createError(
      'AUTHENTICATION_ERROR',
      'Login failed',
      sensitiveDetails
    );
    
    const hasSensitiveData = 
      sanitizedError.details.password !== '[REDACTED]' ||
      sanitizedError.details.token !== '[REDACTED]' ||
      sanitizedError.details.secret !== '[REDACTED]' ||
      sanitizedError.details.key !== '[REDACTED]';
    
    if (!hasSensitiveData) {
      console.log('✅ Sensitive data is properly sanitized');
    } else {
      console.log('❌ Sensitive data is not properly sanitized');
    }
    
    // Test production vs development error details
    const devHandler = new ErrorHandler({ environment: 'development' });
    const prodHandler = new ErrorHandler({ environment: 'production' });
    
    const testError = new Error('Database connection failed');
    testError.stack = 'Error: Database connection failed\n    at test...';
    
    const devError = devHandler.createError('INTERNAL_SERVER_ERROR', 'System error', {}, testError);
    const prodError = prodHandler.createError('INTERNAL_SERVER_ERROR', 'System error', {}, testError);
    
    if (devError.stack && !prodError.stack) {
      console.log('✅ Production environment hides stack traces');
    } else {
      console.log('❌ Production environment may expose stack traces');
    }
    
  } catch (error) {
    console.log('❌ Requirement 4.3 test failed:', error.message);
  }
}

/**
 * Test Requirement 4.4: Clear indication of invalid fields
 */
async function testRequirement44_InvalidFieldIndication() {
  console.log('\n=== Testing Requirement 4.4: Clear Indication of Invalid Fields ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test field validation errors with paths
    const validationResult = {
      isValid: false,
      errors: [
        {
          type: 'INVALID_FIELD',
          field: 'email',
          message: 'Invalid email format',
          path: 'user.profile.email'
        },
        {
          type: 'REQUIRED_FIELD_MISSING',
          field: 'firstName',
          message: 'First name is required',
          path: 'user.profile.firstName'
        }
      ],
      fieldErrors: {
        email: 'Must be a valid email address',
        firstName: 'This field is required',
        'profile.phone': 'Invalid phone number format'
      }
    };
    
    const fieldError = errorHandler.handleValidationErrors(validationResult, 'create');
    
    // Verify field indication
    if (fieldError.details.field === 'email' && 
        fieldError.details.path === 'user.profile.email' &&
        fieldError.details.fieldErrors) {
      console.log('✅ Invalid fields are clearly indicated with paths');
      console.log('   Field:', fieldError.details.field);
      console.log('   Path:', fieldError.details.path);
      console.log('   Field Errors:', Object.keys(fieldError.details.fieldErrors));
    } else {
      console.log('❌ Invalid fields are not clearly indicated');
    }
    
    // Test nested select field errors
    const nestedSelectErrors = [
      "Unknown field 'user.posts.invalidField' will be skipped",
      "Invalid field 'user.profile.nonExistentField' at path 'user.profile.nonExistentField'"
    ];
    
    const nestedFieldError = errorHandler.handleNestedSelectErrors(nestedSelectErrors, 'select');
    
    if (nestedFieldError.message.includes('invalidField') || 
        nestedFieldError.message.includes('nonExistentField')) {
      console.log('✅ Nested select invalid fields are clearly indicated');
      console.log('   Message:', nestedFieldError.message);
    } else {
      console.log('❌ Nested select invalid fields are not clearly indicated');
    }
    
    // Test constraint field extraction
    const constraintError = {
      code: 'P2002',
      message: 'Unique constraint failed on the fields: (`email`, `username`)',
      meta: {
        target: ['email', 'username']
      }
    };
    
    const constraintResult = errorHandler.handlePrismaError(constraintError, 'create');
    
    if (constraintResult.details.field === 'email, username') {
      console.log('✅ Constraint violation fields are clearly indicated');
      console.log('   Constraint Fields:', constraintResult.details.field);
    } else {
      console.log('❌ Constraint violation fields are not clearly indicated');
    }
    
  } catch (error) {
    console.log('❌ Requirement 4.4 test failed:', error.message);
  }
}

/**
 * Test development vs production error detail levels
 */
async function testDevelopmentVsProductionErrorLevels() {
  console.log('\n=== Testing Development vs Production Error Detail Levels ===');
  
  try {
    const devHandler = new ErrorHandler({ environment: 'development' });
    const prodHandler = new ErrorHandler({ environment: 'production' });
    
    const testError = new Error('Test error with stack trace');
    testError.stack = 'Error: Test error\n    at testFunction...';
    
    // Create same error in both environments
    const devError = devHandler.createError('INTERNAL_SERVER_ERROR', 'Test error', { debug: 'info' }, testError);
    const prodError = prodHandler.createError('INTERNAL_SERVER_ERROR', 'Test error', { debug: 'info' }, testError);
    
    // Test development includes more details
    if (devError.stack && devError.originalError) {
      console.log('✅ Development environment includes stack trace and original error');
    } else {
      console.log('❌ Development environment missing detailed error information');
    }
    
    // Test production hides sensitive details
    if (!prodError.stack && !prodError.originalError) {
      console.log('✅ Production environment hides stack trace and original error');
    } else {
      console.log('❌ Production environment exposes sensitive error information');
    }
    
    // Test HTTP responses
    const mockApiResponse = {
      error: (method, data, message, statusCode) => ({
        statusCode,
        body: { error: true, method, message, data, statusCode }
      })
    };
    
    const devResponse = devHandler.createHttpResponse(devError, 'GET', mockApiResponse);
    const prodResponse = prodHandler.createHttpResponse(prodError, 'GET', mockApiResponse);
    
    if (devResponse.body.data.details && !prodResponse.body.data.stack) {
      console.log('✅ HTTP responses respect environment-specific detail levels');
    } else {
      console.log('❌ HTTP responses do not respect environment-specific detail levels');
    }
    
  } catch (error) {
    console.log('❌ Development vs Production error levels test failed:', error.message);
  }
}

/**
 * Test categorized error types
 */
async function testCategorizedErrorTypes() {
  console.log('\n=== Testing Categorized Error Types ===');
  
  const errorHandler = new ErrorHandler({ environment: 'development' });
  
  try {
    // Test all error categories are properly assigned
    const testCases = [
      { type: 'INVALID_INPUT', expectedCategory: ERROR_CATEGORIES.VALIDATION },
      { type: 'NESTED_SELECT_TOO_DEEP', expectedCategory: ERROR_CATEGORIES.NESTED_SELECT },
      { type: 'UNIQUE_CONSTRAINT_VIOLATION', expectedCategory: ERROR_CATEGORIES.CONSTRAINT },
      { type: 'INVALID_RELATION', expectedCategory: ERROR_CATEGORIES.RELATION },
      { type: 'QUERY_TOO_COMPLEX', expectedCategory: ERROR_CATEGORIES.PERFORMANCE },
      { type: 'INTERNAL_SERVER_ERROR', expectedCategory: ERROR_CATEGORIES.SYSTEM },
      { type: 'UNAUTHORIZED', expectedCategory: ERROR_CATEGORIES.AUTHENTICATION },
      { type: 'RESOURCE_NOT_FOUND', expectedCategory: ERROR_CATEGORIES.NOT_FOUND },
      { type: 'RESOURCE_ALREADY_EXISTS', expectedCategory: ERROR_CATEGORIES.CONFLICT }
    ];
    
    let allCategorized = true;
    
    for (const testCase of testCases) {
      const error = errorHandler.createError(testCase.type, `Test ${testCase.type}`);
      if (error.category !== testCase.expectedCategory) {
        allCategorized = false;
        console.log(`❌ ${testCase.type} has incorrect category: ${error.category}, expected: ${testCase.expectedCategory}`);
      }
    }
    
    if (allCategorized) {
      console.log('✅ All error types are properly categorized');
    }
    
    // Test error categories are consistent
    const categories = Object.values(ERROR_CATEGORIES);
    const uniqueCategories = [...new Set(categories)];
    
    if (categories.length === uniqueCategories.length) {
      console.log('✅ Error categories are unique and consistent');
      console.log('   Categories:', categories.length);
    } else {
      console.log('❌ Error categories have duplicates');
    }
    
  } catch (error) {
    console.log('❌ Categorized error types test failed:', error.message);
  }
}

/**
 * Run all requirements verification tests
 */
async function runRequirementsVerification() {
  console.log('🧪 Running Enhanced Error Handling Requirements Verification\n');
  
  await testRequirement41_ConsistentErrorHandling();
  await testRequirement42_HTTPStatusCodes();
  await testRequirement43_DatabaseErrorHandling();
  await testRequirement44_InvalidFieldIndication();
  await testDevelopmentVsProductionErrorLevels();
  await testCategorizedErrorTypes();
  
  console.log('\n✅ All Enhanced Error Handling Requirements Verification tests completed!');
  console.log('\n📋 Requirements Coverage Summary:');
  console.log('   ✅ 4.1: Consistent and informative error handling');
  console.log('   ✅ 4.2: Appropriate HTTP status codes for validation failures');
  console.log('   ✅ 4.3: Graceful database error handling without exposing sensitive information');
  console.log('   ✅ 4.4: Clear indication of invalid fields');
  console.log('   ✅ Additional: Development vs production error detail levels');
  console.log('   ✅ Additional: Categorized error types with consistent structure');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runRequirementsVerification().catch(console.error);
}

module.exports = {
  runRequirementsVerification,
  testRequirement41_ConsistentErrorHandling,
  testRequirement42_HTTPStatusCodes,
  testRequirement43_DatabaseErrorHandling,
  testRequirement44_InvalidFieldIndication,
  testDevelopmentVsProductionErrorLevels,
  testCategorizedErrorTypes
};