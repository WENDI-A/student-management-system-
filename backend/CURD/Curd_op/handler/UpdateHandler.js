const { ErrorHandler } = require('./ErrorHandler');

/**
 * UpdateHandler - Handles PUT requests for CRUD operations
 * Extracts PUT logic from the main route method
 * Integrates enhanced validation and error handling
 * Maintains auto-detected relations functionality
 */
class UpdateHandler {
  /**
   * Create a new UpdateHandler instance
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
   * Handle PUT /:id requests - update existing records
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Object} model - Prisma model instance
   * @param {Object} routeOptions - Route configuration options
   * @param {Function} errorHandler - Custom error handler
   */
  async handleUpdate(req, res, model, routeOptions, errorHandler = null) {
    try {
      const id = req.params.id;
      let data = req.body;
      
      // Basic input validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data provided for update');
      }
      
      // Execute beforeActions.update hook if provided
      if (routeOptions.beforeActions && routeOptions.beforeActions.update) {
        const result = await routeOptions.beforeActions.update(data, req);
        if (typeof result !== 'undefined') data = result;
      }
      
      // Enhanced validation using ValidationManager
      const validationResult = await this.validationManager.validateUpdateData(
        data, 
        model, 
        routeOptions.validation, 
        req, 
        id
      );
      
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
      
      // Use processed data from validation
      data = validationResult.processedData;
      
      // Handle cascade operations if enabled
      if (routeOptions.enableCascadeHandling !== false) {
        const cascadeResult = await this.databaseAnalyzer.handleCascadeOperations('update', data, model, id);
        if (!cascadeResult.success) {
          console.warn(`Cascade operations completed with warnings: ${cascadeResult.results.join(', ')}`);
        }
      }
      
      // Update record with auto-detected relations if enabled
      const autoDetectRelations = routeOptions.autoDetectRelations !== false;
      const updated = autoDetectRelations ? 
        await this._updateWithAutoDetectedRelations(id, data, model) : 
        await model.update({ 
          where: { id: this._convertId(id) }, 
          data 
        });
      
      let responseData = updated;
      
      // Execute afterActions.update hook if provided
      if (routeOptions.afterActions && routeOptions.afterActions.update) {
        const result = await routeOptions.afterActions.update(updated, req);
        if (typeof result !== 'undefined') responseData = result;
      }
      
      const apiResponse = this.apiResponse.success('put', responseData);
      this.apiResponse.setResponseHeaders(res, apiResponse);
      res.status(apiResponse.statusCode).json(apiResponse.body);
      
    } catch (error) {
      this._handleError(error, 'put', res, errorHandler);
    }
  }

  /**
   * Update record with auto-detected relations
   * @param {string|number} id - Record ID
   * @param {Object} data - Data to update
   * @param {Object} model - Prisma model instance
   * @returns {Object} Updated record
   * @private
   */
  async _updateWithAutoDetectedRelations(id, data, model) {
    let finalId;
    
    // Convert ID to appropriate type
    if (typeof id === 'string') {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        finalId = numericId;
      } else {
        finalId = id;
      }
    } else if (typeof id === 'number') {
      finalId = id;
    } else {
      throw new Error(`Invalid ID type: expected string or number, got ${typeof id}`);
    }
    
    const { mainData, singleRelations, bulkRelations } = this._processNestedData(data, 'update');
    
    // If no relations detected, use simple update
    if (Object.keys(singleRelations).length === 0 && Object.keys(bulkRelations).length === 0) {
      return await model.update({ 
        where: { id: finalId }, 
        data: mainData 
      });
    }

    const updateData = { ...mainData };
    
    // Handle single relations
    for (const [relation, items] of Object.entries(singleRelations)) {
      updateData[relation] = {
        create: items
      };
    }
    
    // Handle bulk relations
    for (const [relation, items] of Object.entries(bulkRelations)) {
      updateData[relation] = {
        create: items
      };
    }

    // Update with relations and include them in response
    const updated = await model.update({
      where: { id: finalId },
      data: updateData,
      include: {
        ...Object.keys(singleRelations).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        ...Object.keys(bulkRelations).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      }
    });
    
    return updated;
  }

  /**
   * Process nested data to separate main data from relations
   * @param {Object} data - Input data
   * @param {string} operation - Operation type ('update')
   * @returns {Object} Processed data with separated relations
   * @private
   */
  _processNestedData(data, operation = 'update') {
    const mainData = { ...data };
    const { singleRelations, bulkRelations } = this._detectRelationTypes(data);

    // Remove relation data from main data
    Object.keys(singleRelations).forEach(key => {
      delete mainData[key];
    });
    Object.keys(bulkRelations).forEach(key => {
      delete mainData[key];
    });

    return { mainData, singleRelations, bulkRelations };
  }

  /**
   * Detect relation types in data
   * @param {Object} data - Input data
   * @returns {Object} Detected relations
   * @private
   */
  _detectRelationTypes(data) {
    const singleRelations = {};
    const bulkRelations = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'object' || value === null || 
          ['id', 'createdAt', 'updatedAt', 'uploadedFiles'].includes(key)) {
        continue;
      }

      if (Array.isArray(value)) {
        bulkRelations[key] = value;
      }
      else if (typeof value === 'object' && !Array.isArray(value)) {
        singleRelations[key] = value;
      }
    }

    return { singleRelations, bulkRelations };
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

module.exports = { UpdateHandler };