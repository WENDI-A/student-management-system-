const { ErrorHandler } = require('./ErrorHandler');

/**
 * DeleteHandler - Handles DELETE requests for CRUD operations
 * Extracts DELETE logic from the main route method
 * Integrates enhanced validation and error handling
 * Maintains cascade handling functionality
 */
class DeleteHandler {
  /**
   * Create a new DeleteHandler instance
   * @param {Object} apiResponse - Api_Response instance for formatting responses
   * @param {Object} databaseAnalyzer - DatabaseAnalyzer instance for schema analysis
   * @param {Object} options - Configuration options
   */
  constructor(apiResponse, databaseAnalyzer, options = {}) {
    this.apiResponse = apiResponse;
    this.databaseAnalyzer = databaseAnalyzer;
    this.options = options;
    
    // Initialize ValidationManager
    const { ValidationManager } = require('../ValidationManager');
    this.validationManager = new ValidationManager(databaseAnalyzer, options);
    
    // Initialize enhanced error handler
    this.errorHandler = new ErrorHandler({
      environment: options.environment || process.env.NODE_ENV || 'development',
      includeStackTrace: options.includeStackTrace !== false,
      includeErrorDetails: options.includeErrorDetails !== false,
      logErrors: options.logErrors !== false
    });
  }

  /**
   * Handle DELETE /:id requests - delete existing records
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Object} model - Prisma model instance
   * @param {Object} routeOptions - Route configuration options
   * @param {Function} errorHandler - Custom error handler
   */
  async handleDelete(req, res, model, routeOptions, errorHandler = null) {
    try {
      const id = req.params.id;
      
      // Enhanced validation for delete operation
      const validationResult = await this._validateDeleteOperation(id, model, req);
      if (!validationResult.isValid) {
        const formattedErrors = this.validationManager.formatValidationErrors(validationResult);
        return res.status(400).json({
          error: true,
          message: formattedErrors.message,
          errors: formattedErrors.errors,
          fieldErrors: formattedErrors.fieldErrors,
          warnings: formattedErrors.warnings
        });
      }
      
      let deleted;
      
      // Execute beforeActions.destroy hook if provided
      if (routeOptions.beforeActions && routeOptions.beforeActions.destroy) {
        const result = await routeOptions.beforeActions.destroy(id, req);
        if (typeof result !== 'undefined') deleted = result;
      }
      
      // If beforeActions didn't handle the deletion, proceed with normal deletion
      if (!deleted) {
        // Handle cascade operations if enabled
        if (routeOptions.enableCascadeHandling !== false) {
          const cascadeResult = await this.databaseAnalyzer.handleCascadeOperations('delete', {}, model, id);
          if (!cascadeResult.success) {
            console.warn(`Cascade operations completed with warnings: ${cascadeResult.results.join(', ')}`);
          }
        }
        
        // Perform the deletion
        deleted = await model.delete({ 
          where: { id: this._convertId(id) } 
        });
      }
      
      // Execute afterActions.destroy hook if provided
      if (routeOptions.afterActions && routeOptions.afterActions.destroy) {
        const result = await routeOptions.afterActions.destroy(deleted, req);
        if (typeof result !== 'undefined') deleted = result;
      }
      
      const apiResponse = this.apiResponse.success('delete', deleted);
      this.apiResponse.setResponseHeaders(res, apiResponse);
      res.status(apiResponse.statusCode).json(apiResponse.body);
      
    } catch (error) {
      this._handleError(error, 'delete', res, errorHandler);
    }
  }

  /**
   * Validate delete operation
   * @param {string|number} id - Record ID to delete
   * @param {Object} model - Prisma model instance
   * @param {Object} req - Express request object
   * @returns {Object} Validation result
   * @private
   */
  async _validateDeleteOperation(id, model, req) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      fieldErrors: {}
    };

    try {
      // Validate ID presence
      if (!id) {
        result.isValid = false;
        result.errors.push({
          type: 'MISSING_ID',
          message: 'ID is required for delete operation',
          path: 'id',
          code: 'VALIDATION_ERROR'
        });
        return result;
      }

      // Validate ID format
      const convertedId = this._convertId(id);
      if (convertedId === null || convertedId === undefined) {
        result.isValid = false;
        result.errors.push({
          type: 'INVALID_ID_FORMAT',
          message: `Invalid ID format: ${id}`,
          path: 'id',
          code: 'VALIDATION_ERROR'
        });
        return result;
      }

      // Check if record exists
      try {
        const existingRecord = await model.findUnique({
          where: { id: convertedId }
        });

        if (!existingRecord) {
          result.isValid = false;
          result.errors.push({
            type: 'RECORD_NOT_FOUND',
            message: `Record with ID '${id}' not found`,
            path: 'id',
            code: 'P2025'
          });
          return result;
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push({
          type: 'RECORD_EXISTENCE_CHECK_ERROR',
          message: `Error checking record existence: ${error.message}`,
          path: 'id',
          code: 'INTERNAL_ERROR'
        });
        return result;
      }

      // Check for cascade constraints that might prevent deletion
      const structure = await this.databaseAnalyzer.analyzeDatabaseStructure(model);
      if (structure && structure.hasRelations) {
        // This is a warning rather than an error since cascade handling will deal with it
        result.warnings.push({
          type: 'CASCADE_OPERATIONS_REQUIRED',
          message: 'Record has related data that may be affected by cascade operations',
          path: 'relations',
          code: 'WARNING'
        });
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push({
        type: 'DELETE_VALIDATION_SYSTEM_ERROR',
        message: `Delete validation system error: ${error.message}`,
        path: 'system',
        code: 'INTERNAL_ERROR'
      });
    }

    return result;
  }

  /**
   * Convert ID to appropriate type (string or number)
   * @param {string|number} id - ID value to convert
   * @returns {string|number} Converted ID
   * @private
   */
  _convertId(id) {
    if (typeof id === 'string' && !isNaN(Number(id))) {
      return Number(id);
    }
    return id;
  }

  /**
   * Handle errors consistently using enhanced error handler
   * @param {Error|Object} error - Error object
   * @param {string} method - HTTP method
   * @param {Object} res - Express response object
   * @param {Function} errorHandler - Custom error handler
   * @private
   */
  _handleError(error, method, res, errorHandler) {
    let errResp;
    
    if (errorHandler) {
      // Use custom error handler if provided
      errResp = errorHandler(error, method, this.apiResponse);
    } else {
      // Use enhanced error handler
      let standardizedError;
      
      // Handle different types of errors
      if (error.code && error.code.startsWith('P')) {
        // Prisma error
        standardizedError = this.errorHandler.handlePrismaError(error, method, { model: 'unknown' });
      } else if (error.validationErrors) {
        // Nested select validation errors
        standardizedError = this.errorHandler.handleNestedSelectErrors(error.validationErrors, method);
      } else if (error.isValid === false) {
        // Validation result errors
        standardizedError = this.errorHandler.handleValidationErrors(error, method);
      } else if (error.message && error.message.includes('Query')) {
        // Query processing errors
        standardizedError = this.errorHandler.handleQueryProcessingError(error, {}, method);
      } else {
        // Generic error
        const errorType = error.name === 'ValidationError' ? 'INVALID_INPUT' : 'INTERNAL_SERVER_ERROR';
        standardizedError = this.errorHandler.createError(
          errorType,
          error.message || 'An unexpected error occurred',
          { operation: method },
          error
        );
      }
      
      // Create HTTP response
      errResp = this.errorHandler.createHttpResponse(standardizedError, method, this.apiResponse);
    }
    
    this.apiResponse.setResponseHeaders(res, errResp);
    res.status(errResp.statusCode || 500).json(errResp.body);
  }
}

module.exports = { DeleteHandler };