const { ErrorHandler } = require('./ErrorHandler');

/**
 * GetHandler - Handles GET requests for CRUD operations
 * Extracts GET / and GET /:id logic from the main route method
 * Integrates QueryProcessor for advanced query handling
 */
class GetHandler {
  /**
   * Create a new GetHandler instance
   * @param {Object} queryProcessor - QueryProcessor instance for handling queries
   * @param {Object} apiResponse - Api_Response instance for formatting responses
   * @param {Object} databaseAnalyzer - DatabaseAnalyzer instance for schema analysis
   * @param {Object} options - Configuration options
   */
  constructor(queryProcessor, apiResponse, databaseAnalyzer, options = {}) {
    this.queryProcessor = queryProcessor;
    this.apiResponse = apiResponse;
    this.databaseAnalyzer = databaseAnalyzer;
    this.options = options;
    
    // Initialize enhanced error handler
    this.errorHandler = new ErrorHandler({
      environment: options.environment || process.env.NODE_ENV || 'development',
      includeStackTrace: options.includeStackTrace !== false,
      includeErrorDetails: options.includeErrorDetails !== false,
      logErrors: options.logErrors !== false
    });
  }

  /**
   * Handle GET / requests - get all records with query processing
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Object} model - Prisma model instance
   * @param {Object} routeOptions - Route configuration options
   * @param {Function} errorHandler - Custom error handler
   */
  async handleGetAll(req, res, model, routeOptions, errorHandler = null) {
    try {
      let query = req.query;
      
      // Execute beforeActions.get hook if provided
      if (routeOptions.beforeActions && routeOptions.beforeActions.get) {
        const result = await routeOptions.beforeActions.get(query, req);
        if (typeof result !== 'undefined') query = result;
      }

      // Use QueryProcessor for centralized query handling
      const prismaQuery = await this.queryProcessor.processGetQuery(query, model, routeOptions);
      
      // Execute the query
      const [rows, count] = await Promise.all([
        model.findMany(prismaQuery),
        model.count({ where: prismaQuery.where || {} })
      ]);

      let afterGetResult = { rows, count };
      
      // Execute afterActions.get hook if provided
      if (routeOptions.afterActions && routeOptions.afterActions.get) {
        const result = await routeOptions.afterActions.get(afterGetResult, req);
        if (typeof result !== 'undefined') afterGetResult = result;
      }

      const apiResponse = this.apiResponse.success('get', { 
        data: afterGetResult.rows, 
        count: afterGetResult.count 
      });
      
      this.apiResponse.setResponseHeaders(res, apiResponse);
      res.status(apiResponse.statusCode).json(apiResponse.body);
      
    } catch (error) {
      this._handleError(error, 'get', res, errorHandler);
    }
  }

  /**
   * Handle GET /:id requests - get single record by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Object} model - Prisma model instance
   * @param {Object} routeOptions - Route configuration options
   * @param {Function} errorHandler - Custom error handler
   */
  async handleGetById(req, res, model, routeOptions, errorHandler = null) {
    try {
      const id = req.params.id;
      const include = req.query.include ? JSON.parse(req.query.include) : {};
      
      // Analyze database structure for relations
      const structure = await this.databaseAnalyzer.analyzeDatabaseStructure(model);
      let includeObject = {};
      
      // Build include object for relations if enabled
      if (routeOptions.includeRelations && structure && structure.hasRelations) {
        for (const fk of structure.foreignKeys) {
          if (!routeOptions.excludeRelations || !routeOptions.excludeRelations.includes(fk.field)) {
            includeObject[fk.field] = true;
          }
        }
      }
      
      // Merge with query include parameter
      includeObject = { ...includeObject, ...include };
      
      // Find the record
      let row = await model.findUnique({
        where: { id: this._convertId(id) },
        include: Object.keys(includeObject).length > 0 ? includeObject : undefined,
      });
      
      if (!row) {
        throw { code: 'P2025', message: 'Record not found' };
      }
      
      // Execute afterActions.getById hook if provided
      if (routeOptions.afterActions && routeOptions.afterActions.getById) {
        const result = await routeOptions.afterActions.getById(row, req);
        if (typeof result !== 'undefined') row = result;
      }
      
      const apiResponse = this.apiResponse.success('get', row);
      this.apiResponse.setResponseHeaders(res, apiResponse);
      res.status(apiResponse.statusCode).json(apiResponse.body);
      
    } catch (error) {
      this._handleError(error, 'get', res, errorHandler);
    }
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

module.exports = { GetHandler };