const { ErrorHandler } = require('./ErrorHandler');

/**
 * CreateHandler - Handles POST requests for CRUD operations
 * Extracts POST logic from the main route method
 * Integrates enhanced validation and error handling
 * Maintains auto-detected relations functionality
 */
class CreateHandler {
  /**
   * Create a new CreateHandler instance
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
   * Handle POST / requests - create new records
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Object} model - Prisma model instance
   * @param {Object} routeOptions - Route configuration options
   * @param {Function} errorHandler - Custom error handler
   */
  async handleCreate(req, res, model, routeOptions, errorHandler = null) {
    try {
      let data = req.body;
      
      // Validate input data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data provided for creation');
      }
      
      // Execute beforeActions.create hook if provided
      if (routeOptions.beforeActions && routeOptions.beforeActions.create) {
        const result = await routeOptions.beforeActions.create(data, req);
        if (typeof result !== 'undefined') data = result;
      }
      
      // Enhanced validation using ValidationManager
      const validationResult = await this.validationManager.validateCreateData(
        data, 
        model, 
        routeOptions.validation, 
        req
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
      
      // Create record with auto-detected relations if enabled
      const autoDetectRelations = routeOptions.autoDetectRelations !== false;
      const created = autoDetectRelations ? 
        await this._createWithAutoDetectedRelations(data, model) : 
        await model.create({ data });
      
      let responseData = created;
      
      // Execute afterActions.create hook if provided
      if (routeOptions.afterActions && routeOptions.afterActions.create) {
        const result = await routeOptions.afterActions.create(created, req);
        if (typeof result !== 'undefined') responseData = result;
      }
      
      const apiResponse = this.apiResponse.success('post', responseData);
      this.apiResponse.setResponseHeaders(res, apiResponse);
      res.status(201).json(apiResponse.body);
      
    } catch (error) {
      this._handleError(error, 'post', res, errorHandler);
    }
  }

  /**
   * Create record with auto-detected relations
   * @param {Object} data - Data to create
   * @param {Object} model - Prisma model instance
   * @returns {Object} Created record
   * @private
   */
  async _createWithAutoDetectedRelations(data, model) {
    const { mainData, singleRelations, bulkRelations } = this._processNestedData(data, 'create');
    
    // If no relations detected, use simple create
    if (Object.keys(singleRelations).length === 0 && Object.keys(bulkRelations).length === 0) {
      return await model.create({ data: mainData });
    }

    const createData = { ...mainData };
    
    // Handle single relations
    for (const [relation, items] of Object.entries(singleRelations)) {
      createData[relation] = {
        create: items
      };
    }
    
    // Handle bulk relations
    for (const [relation, items] of Object.entries(bulkRelations)) {
      createData[relation] = {
        create: items
      };
    }

    // Create with relations and include them in response
    const created = await model.create({
      data: createData,
      include: {
        ...Object.keys(singleRelations).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        ...Object.keys(bulkRelations).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      }
    });
    
    return created;
  }

  /**
   * Process nested data to separate main data from relations
   * @param {Object} data - Input data
   * @param {string} operation - Operation type ('create')
   * @returns {Object} Processed data with separated relations
   * @private
   */
  _processNestedData(data, operation = 'create') {
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

module.exports = { CreateHandler };