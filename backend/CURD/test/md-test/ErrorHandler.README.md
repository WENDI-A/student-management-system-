# Enhanced Error Handling System

## Overview

The Enhanced Error Handling System provides centralized, consistent, and informative error handling for the PrismaCrudRouter. It addresses all requirements for robust error management while maintaining backward compatibility.

## Features

### ✅ Centralized Error Handling
- Single `ErrorHandler` class manages all error processing
- Consistent error structure across all handlers
- Categorized error types for better organization
- Standardized HTTP status code mapping

### ✅ Detailed Error Messages with Field Paths
- Nested select errors include full field paths
- Validation errors specify exact field locations
- Constraint violations identify affected fields
- Clear error descriptions for debugging

### ✅ Environment-Specific Error Details
- **Development**: Full stack traces, original errors, detailed debugging info
- **Production**: Sanitized messages, no sensitive information exposure
- Configurable error detail levels

### ✅ Comprehensive Error Categories

#### Validation Errors (400)
- `INVALID_INPUT` - General validation failures
- `INVALID_FIELD` - Invalid field names or types
- `MISSING_REQUIRED_FIELD` - Required fields not provided
- `FIELD_VALUE_OUT_OF_RANGE` - Values outside acceptable ranges

#### Nested Select Errors (400)
- `NESTED_SELECT_TOO_DEEP` - Exceeds maximum nesting depth
- `NESTED_SELECT_TOO_COMPLEX` - Query complexity too high
- `INVALID_NESTED_FIELD` - Unknown fields in nested select
- `NESTED_SELECT_SYNTAX_ERROR` - Malformed select structure

#### Constraint Errors
- `UNIQUE_CONSTRAINT_VIOLATION` (409) - Duplicate values
- `FOREIGN_KEY_CONSTRAINT_VIOLATION` (400) - Invalid references
- `CHECK_CONSTRAINT_VIOLATION` (400) - Data constraint failures

#### System Errors (500)
- `DATABASE_CONNECTION_ERROR` (503) - Database connectivity issues
- `INTERNAL_SERVER_ERROR` (500) - Unexpected system failures
- `SERVICE_UNAVAILABLE` (503) - Service temporarily unavailable

#### Performance Errors
- `QUERY_TOO_COMPLEX` (400) - Query exceeds complexity limits
- `QUERY_TIMEOUT` (408) - Query execution timeout
- `RESULT_SET_TOO_LARGE` (413) - Result set size exceeded

## Usage

### Basic Error Creation

```javascript
const { ErrorHandler } = require('./ErrorHandler');

const errorHandler = new ErrorHandler({
  environment: 'development',
  includeStackTrace: true,
  includeErrorDetails: true,
  logErrors: true
});

// Create a validation error
const error = errorHandler.createError(
  'INVALID_INPUT',
  'Email is required',
  { field: 'email', path: 'user.profile.email' }
);
```

### Prisma Error Handling

```javascript
try {
  await model.create(data);
} catch (prismaError) {
  const standardizedError = errorHandler.handlePrismaError(
    prismaError, 
    'create', 
    { model: 'User' }
  );
  
  const httpResponse = errorHandler.createHttpResponse(
    standardizedError, 
    'POST', 
    apiResponse
  );
}
```

### Nested Select Error Handling

```javascript
const validationErrors = [
  "Select nesting too deep at path 'user.posts.comments' (max: 5)",
  "Unknown field 'user.posts.invalidField' will be skipped"
];

const error = errorHandler.handleNestedSelectErrors(validationErrors, 'select');
```

### Validation Error Handling

```javascript
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
    email: 'Must be a valid email address'
  }
};

const error = errorHandler.handleValidationErrors(validationResult, 'create');
```

## Integration with Handlers

All CRUD handlers (`GetHandler`, `CreateHandler`, `UpdateHandler`, `DeleteHandler`) have been updated to use the enhanced error handling system:

```javascript
class GetHandler {
  constructor(queryProcessor, apiResponse, databaseAnalyzer, options = {}) {
    // ... other initialization
    
    this.errorHandler = new ErrorHandler({
      environment: options.environment || process.env.NODE_ENV || 'development',
      includeStackTrace: options.includeStackTrace !== false,
      includeErrorDetails: options.includeErrorDetails !== false,
      logErrors: options.logErrors !== false
    });
  }

  _handleError(error, method, res, errorHandler) {
    if (errorHandler) {
      // Use custom error handler if provided
      errResp = errorHandler(error, method, this.apiResponse);
    } else {
      // Use enhanced error handler
      let standardizedError;
      
      if (error.code && error.code.startsWith('P')) {
        standardizedError = this.errorHandler.handlePrismaError(error, method);
      } else if (error.validationErrors) {
        standardizedError = this.errorHandler.handleNestedSelectErrors(error.validationErrors, method);
      } else if (error.isValid === false) {
        standardizedError = this.errorHandler.handleValidationErrors(error, method);
      } else {
        standardizedError = this.errorHandler.createError('INTERNAL_SERVER_ERROR', error.message, {}, error);
      }
      
      errResp = this.errorHandler.createHttpResponse(standardizedError, method, this.apiResponse);
    }
    
    this.apiResponse.setResponseHeaders(res, errResp);
    res.status(errResp.statusCode || 500).json(errResp.body);
  }
}
```

## Error Response Format

### Development Environment Response
```json
{
  "error": true,
  "type": "UNIQUE_CONSTRAINT_VIOLATION",
  "category": "CONSTRAINT_ERROR",
  "message": "Unique constraint violation on field: email",
  "timestamp": "2025-07-22T09:38:02.682Z",
  "details": {
    "operation": "create",
    "field": "email",
    "prismaCode": "P2002",
    "model": "User"
  },
  "stack": "Error: Unique constraint failed...",
  "originalError": {
    "name": "PrismaClientKnownRequestError",
    "message": "Unique constraint failed on the fields: (`email`)"
  },
  "statusCode": 409
}
```

### Production Environment Response
```json
{
  "error": true,
  "type": "UNIQUE_CONSTRAINT_VIOLATION",
  "category": "CONSTRAINT_ERROR",
  "message": "Unique constraint violation on field: email",
  "timestamp": "2025-07-22T09:38:02.682Z",
  "statusCode": 409
}
```

## Configuration Options

```javascript
const errorHandler = new ErrorHandler({
  environment: 'development',           // 'development' | 'production'
  includeStackTrace: true,              // Include stack traces in development
  includeErrorDetails: true,            // Include detailed error information
  maxErrorMessageLength: 1000,          // Maximum error message length
  logErrors: true                       // Enable error logging
});
```

## Security Features

### Sensitive Data Sanitization
- Automatically redacts `password`, `token`, `secret`, `key` fields
- Sanitizes query parameters in error details
- Prevents exposure of internal system information

### Environment-Based Information Disclosure
- Production mode hides stack traces and internal details
- Development mode provides full debugging information
- Configurable detail levels for different environments

## Testing

The enhanced error handling system includes comprehensive tests:

### Unit Tests (`ErrorHandler.test.js`)
- Basic error creation and structure validation
- Prisma error handling
- Nested select error processing
- Validation error handling
- Environment-specific behavior
- Message truncation and sanitization

### Integration Tests (`enhanced-error-integration.test.js`)
- Handler integration with ErrorHandler
- End-to-end error processing
- Custom error handler compatibility
- HTTP response generation

### Requirements Verification (`error-requirements-verification.test.js`)
- Requirement 4.1: Consistent and informative error handling ✅
- Requirement 4.2: Appropriate HTTP status codes ✅
- Requirement 4.3: Graceful database error handling ✅
- Requirement 4.4: Clear indication of invalid fields ✅

## Backward Compatibility

The enhanced error handling system maintains full backward compatibility:
- Existing custom error handlers continue to work
- API response format remains consistent
- All existing error handling patterns are preserved
- No breaking changes to public interfaces

## Performance Considerations

- Error categorization uses efficient lookup tables
- Message truncation prevents memory issues with large errors
- Lazy evaluation of error details in production
- Minimal overhead for successful operations

## Future Enhancements

- Error rate limiting and throttling
- Advanced error analytics and monitoring
- Custom error templates for different error types
- Integration with external error tracking services
- Automated error recovery mechanisms

## Files

- `ErrorHandler.js` - Main error handling class
- `ErrorHandler.test.js` - Unit tests
- `enhanced-error-integration.test.js` - Integration tests
- `error-requirements-verification.test.js` - Requirements verification
- `ErrorHandler.README.md` - This documentation

## Requirements Fulfilled

✅ **4.1**: Consistent and informative error handling  
✅ **4.2**: Appropriate HTTP status codes for validation failures  
✅ **4.3**: Graceful database error handling without exposing sensitive information  
✅ **4.4**: Clear indication of invalid fields  

The enhanced error handling system successfully addresses all requirements while providing a robust, scalable, and maintainable error management solution for the PrismaCrudRouter.