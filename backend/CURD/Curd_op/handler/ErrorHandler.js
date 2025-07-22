/**
 * Enhanced Error Handler for PrismaCrudRouter
 * 
 * Provides centralized error handling with:
 * - Categorized error types
 * - Detailed error messages with field paths for nested select errors
 * - Consistent HTTP status code mapping
 * - Development vs production error detail levels
 */

const { ErrorCode } = require('../PrismaError');

/**
 * Error categories for better error classification
 */
const ERROR_CATEGORIES = {
  VALIDATION: 'VALIDATION_ERROR',
  CONSTRAINT: 'CONSTRAINT_ERROR',
  RELATION: 'RELATION_ERROR',
  PERFORMANCE: 'PERFORMANCE_ERROR',
  SYSTEM: 'SYSTEM_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  NESTED_SELECT: 'NESTED_SELECT_ERROR',
  QUERY_PROCESSING: 'QUERY_PROCESSING_ERROR'
};

/**
 * Error types with their default status codes and categories
 */
const ERROR_TYPES = {
  // Validation errors
  INVALID_INPUT: { category: ERROR_CATEGORIES.VALIDATION, statusCode: 400 },
  INVALID_FIELD: { category: ERROR_CATEGORIES.VALIDATION, statusCode: 400 },
  INVALID_FIELD_TYPE: { category: ERROR_CATEGORIES.VALIDATION, statusCode: 400 },
  MISSING_REQUIRED_FIELD: { category: ERROR_CATEGORIES.VALIDATION, statusCode: 400 },
  FIELD_VALUE_OUT_OF_RANGE: { category: ERROR_CATEGORIES.VALIDATION, statusCode: 400 },
  
  // Nested select errors
  NESTED_SELECT_TOO_DEEP: { category: ERROR_CATEGORIES.NESTED_SELECT, statusCode: 400 },
  NESTED_SELECT_TOO_COMPLEX: { category: ERROR_CATEGORIES.NESTED_SELECT, statusCode: 400 },
  INVALID_NESTED_FIELD: { category: ERROR_CATEGORIES.NESTED_SELECT, statusCode: 400 },
  NESTED_SELECT_SYNTAX_ERROR: { category: ERROR_CATEGORIES.NESTED_SELECT, statusCode: 400 },
  
  // Constraint errors
  UNIQUE_CONSTRAINT_VIOLATION: { category: ERROR_CATEGORIES.CONSTRAINT, statusCode: 409 },
  FOREIGN_KEY_CONSTRAINT_VIOLATION: { category: ERROR_CATEGORIES.CONSTRAINT, statusCode: 400 },
  CHECK_CONSTRAINT_VIOLATION: { category: ERROR_CATEGORIES.CONSTRAINT, statusCode: 400 },
  
  // Relation errors
  INVALID_RELATION: { category: ERROR_CATEGORIES.RELATION, statusCode: 400 },
  RELATION_NOT_FOUND: { category: ERROR_CATEGORIES.RELATION, statusCode: 404 },
  CIRCULAR_RELATION: { category: ERROR_CATEGORIES.RELATION, statusCode: 400 },
  
  // Performance errors
  QUERY_TOO_COMPLEX: { category: ERROR_CATEGORIES.PERFORMANCE, statusCode: 400 },
  QUERY_TIMEOUT: { category: ERROR_CATEGORIES.PERFORMANCE, statusCode: 408 },
  RESULT_SET_TOO_LARGE: { category: ERROR_CATEGORIES.PERFORMANCE, statusCode: 413 },
  
  // System errors
  DATABASE_CONNECTION_ERROR: { category: ERROR_CATEGORIES.SYSTEM, statusCode: 503 },
  INTERNAL_SERVER_ERROR: { category: ERROR_CATEGORIES.SYSTEM, statusCode: 500 },
  SERVICE_UNAVAILABLE: { category: ERROR_CATEGORIES.SYSTEM, statusCode: 503 },
  
  // Authentication/Authorization errors
  UNAUTHORIZED: { category: ERROR_CATEGORIES.AUTHENTICATION, statusCode: 401 },
  FORBIDDEN: { category: ERROR_CATEGORIES.AUTHORIZATION, statusCode: 403 },
  TOKEN_EXPIRED: { category: ERROR_CATEGORIES.AUTHENTICATION, statusCode: 401 },
  
  // Not found errors
  RESOURCE_NOT_FOUND: { category: ERROR_CATEGORIES.NOT_FOUND, statusCode: 404 },
  ENDPOINT_NOT_FOUND: { category: ERROR_CATEGORIES.NOT_FOUND, statusCode: 404 },
  
  // Conflict errors
  RESOURCE_ALREADY_EXISTS: { category: ERROR_CATEGORIES.CONFLICT, statusCode: 409 },
  CONCURRENT_MODIFICATION: { category: ERROR_CATEGORIES.CONFLICT, statusCode: 409 },
  
  // Query processing errors
  INVALID_QUERY_SYNTAX: { category: ERROR_CATEGORIES.QUERY_PROCESSING, statusCode: 400 },
  UNSUPPORTED_OPERATION: { category: ERROR_CATEGORIES.QUERY_PROCESSING, statusCode: 400 }
};

class ErrorHandler {
  constructor(options = {}) {
    this.options = {
      environment: options.environment || process.env.NODE_ENV || 'development',
      includeStackTrace: options.includeStackTrace !== false,
      includeErrorDetails: options.includeErrorDetails !== false,
      maxErrorMessageLength: options.maxErrorMessageLength || 1000,
      logErrors: options.logErrors !== false,
      ...options
    };
  }

  /**
   * Create a standardized error object
   * @param {string} type - Error type from ERROR_TYPES
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @param {Error} originalError - Original error object
   * @returns {Object} Standardized error object
   */
  createError(type, message, details = {}, originalError = null) {
    const errorType = ERROR_TYPES[type] || ERROR_TYPES.INTERNAL_SERVER_ERROR;
    
    const error = {
      type,
      category: errorType.category,
      message: this.truncateMessage(message),
      statusCode: details.statusCode || errorType.statusCode,
      timestamp: new Date().toISOString(),
      details: this.sanitizeDetails(details)
    };

    // Add development-specific information
    if (this.isDevelopment()) {
      if (originalError && this.options.includeStackTrace) {
        error.stack = originalError.stack;
      }
      
      if (originalError && this.options.includeErrorDetails) {
        error.originalError = {
          name: originalError.name,
          message: originalError.message
        };
      }
    }

    // Log error if enabled
    if (this.options.logErrors) {
      this.logError(error, originalError);
    }

    return error;
  }

  /**
   * Handle Prisma-specific errors
   * @param {Error} error - Prisma error
   * @param {string} operation - Operation being performed
   * @param {Object} context - Additional context
   * @returns {Object} Standardized error object
   */
  handlePrismaError(error, operation = 'unknown', context = {}) {
    const prismaCode = error.code;
    const prismaErrorInfo = ErrorCode[prismaCode] || ErrorCode.default;

    let errorType = 'INTERNAL_SERVER_ERROR';
    let message = prismaErrorInfo.errorMessage;
    let details = { operation, prismaCode };

    // Map Prisma error codes to our error types
    switch (prismaCode) {
      case 'P2002':
        errorType = 'UNIQUE_CONSTRAINT_VIOLATION';
        details.field = this.extractConstraintField(error);
        message = `Unique constraint violation${details.field ? ` on field: ${details.field}` : ''}`;
        break;
        
      case 'P2003':
        errorType = 'FOREIGN_KEY_CONSTRAINT_VIOLATION';
        details.field = this.extractConstraintField(error);
        message = `Foreign key constraint violation${details.field ? ` on field: ${details.field}` : ''}`;
        break;
        
      case 'P2025':
        errorType = 'RESOURCE_NOT_FOUND';
        message = 'Record not found';
        break;
        
      case 'P2021':
      case 'P2022':
        errorType = 'INTERNAL_SERVER_ERROR';
        break;
        
      default:
        errorType = 'INTERNAL_SERVER_ERROR';
        break;
    }

    return this.createError(errorType, message, {
      ...details,
      statusCode: prismaErrorInfo.statusCode,
      ...context
    }, error);
  }

  /**
   * Handle nested select validation errors
   * @param {Array} validationErrors - Array of validation errors
   * @param {string} operation - Operation being performed
   * @returns {Object} Standardized error object
   */
  handleNestedSelectErrors(validationErrors, operation = 'select') {
    if (!Array.isArray(validationErrors) || validationErrors.length === 0) {
      return this.createError('NESTED_SELECT_SYNTAX_ERROR', 'Invalid nested select structure');
    }

    const primaryError = validationErrors[0];
    let errorType = 'NESTED_SELECT_SYNTAX_ERROR';
    let message = 'Nested select validation failed';

    // Categorize the primary error
    if (typeof primaryError === 'string') {
      if (primaryError.includes('too deep')) {
        errorType = 'NESTED_SELECT_TOO_DEEP';
        message = primaryError;
      } else if (primaryError.includes('too complex')) {
        errorType = 'NESTED_SELECT_TOO_COMPLEX';
        message = primaryError;
      } else if (primaryError.includes('Unknown field')) {
        errorType = 'INVALID_NESTED_FIELD';
        message = primaryError;
      }
    } else if (typeof primaryError === 'object' && primaryError.message) {
      message = primaryError.message;
      if (primaryError.path) {
        message += ` at path: ${primaryError.path}`;
      }
    }

    return this.createError(errorType, message, {
      operation,
      validationErrors: this.isDevelopment() ? validationErrors : validationErrors.slice(0, 5),
      errorCount: validationErrors.length
    });
  }

  /**
   * Handle validation errors with field paths
   * @param {Object} validationResult - Validation result object
   * @param {string} operation - Operation being performed
   * @returns {Object} Standardized error object
   */
  handleValidationErrors(validationResult, operation = 'validation') {
    if (!validationResult || validationResult.isValid) {
      return null;
    }

    const errors = validationResult.errors || [];
    const fieldErrors = validationResult.fieldErrors || {};

    let message = 'Validation failed';
    let details = { operation };

    if (errors.length > 0) {
      const primaryError = errors[0];
      if (typeof primaryError === 'object' && primaryError.message) {
        message = primaryError.message;
        if (primaryError.field) {
          details.field = primaryError.field;
        }
        if (primaryError.path) {
          details.path = primaryError.path;
        }
      } else if (typeof primaryError === 'string') {
        message = primaryError;
      }
    }

    // Add field-specific errors
    if (Object.keys(fieldErrors).length > 0) {
      details.fieldErrors = fieldErrors;
      
      // If no primary message, create one from field errors
      if (message === 'Validation failed') {
        const firstFieldError = Object.keys(fieldErrors)[0];
        message = `Validation failed for field: ${firstFieldError}`;
      }
    }

    // Add all errors in development mode
    if (this.isDevelopment()) {
      details.allErrors = errors;
      details.warnings = validationResult.warnings || [];
    }

    return this.createError('INVALID_INPUT', message, details);
  }

  /**
   * Handle query processing errors
   * @param {Error} error - Query processing error
   * @param {Object} query - Original query object
   * @param {string} operation - Operation being performed
   * @returns {Object} Standardized error object
   */
  handleQueryProcessingError(error, query = {}, operation = 'query') {
    let errorType = 'INVALID_QUERY_SYNTAX';
    let message = 'Query processing failed';

    if (error.message) {
      message = error.message;
      
      // Categorize based on error message
      if (message.includes('too complex')) {
        errorType = 'QUERY_TOO_COMPLEX';
      } else if (message.includes('timeout')) {
        errorType = 'QUERY_TIMEOUT';
      } else if (message.includes('syntax')) {
        errorType = 'INVALID_QUERY_SYNTAX';
      }
    }

    const details = { operation };
    
    // Add query information in development mode
    if (this.isDevelopment()) {
      details.query = this.sanitizeQuery(query);
    }

    return this.createError(errorType, message, details, error);
  }

  /**
   * Create HTTP response from error object
   * @param {Object} error - Error object
   * @param {string} method - HTTP method
   * @param {Object} apiResponse - API response handler
   * @returns {Object} HTTP response object
   */
  createHttpResponse(error, method = 'GET', apiResponse) {
    const statusCode = error.statusCode || 500;
    const responseData = {
      error: true,
      type: error.type,
      category: error.category,
      message: error.message,
      timestamp: error.timestamp
    };

    // Add details based on environment
    if (this.isDevelopment() || this.isDetailedErrorsEnabled()) {
      responseData.details = error.details;
      
      if (error.stack) {
        responseData.stack = error.stack;
      }
    }

    // Use existing API response format if available
    if (apiResponse && typeof apiResponse.error === 'function') {
      return apiResponse.error(method.toLowerCase(), responseData, error.message, statusCode);
    }

    // Fallback response format
    return {
      statusCode,
      body: responseData
    };
  }

  /**
   * Utility methods
   */

  isDevelopment() {
    return this.options.environment === 'development';
  }

  isDetailedErrorsEnabled() {
    return this.options.includeErrorDetails;
  }

  truncateMessage(message) {
    if (!message || typeof message !== 'string') {
      return 'Unknown error';
    }
    
    if (message.length <= this.options.maxErrorMessageLength) {
      return message;
    }
    
    return message.substring(0, this.options.maxErrorMessageLength - 3) + '...';
  }

  sanitizeDetails(details) {
    if (!details || typeof details !== 'object') {
      return {};
    }

    const sanitized = { ...details };
    
    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  sanitizeQuery(query) {
    if (!query || typeof query !== 'object') {
      return {};
    }

    const sanitized = { ...query };
    
    // Remove potentially sensitive query parameters
    if (sanitized.filter && typeof sanitized.filter === 'object') {
      const filter = { ...sanitized.filter };
      if (filter.password) filter.password = '[REDACTED]';
      if (filter.token) filter.token = '[REDACTED]';
      sanitized.filter = filter;
    }

    return sanitized;
  }

  extractConstraintField(error) {
    if (!error || !error.meta) {
      return null;
    }

    // Try to extract field name from Prisma error meta
    if (error.meta.target && Array.isArray(error.meta.target)) {
      return error.meta.target.join(', ');
    }

    if (error.meta.field_name) {
      return error.meta.field_name;
    }

    return null;
  }

  logError(error, originalError = null) {
    const logData = {
      timestamp: error.timestamp,
      type: error.type,
      category: error.category,
      message: error.message,
      statusCode: error.statusCode
    };

    if (originalError) {
      logData.originalMessage = originalError.message;
      logData.originalStack = originalError.stack;
    }

    // Use console.error for now, can be replaced with proper logging
    console.error('[ErrorHandler]', JSON.stringify(logData, null, 2));
  }
}

module.exports = {
  ErrorHandler,
  ERROR_CATEGORIES,
  ERROR_TYPES
};