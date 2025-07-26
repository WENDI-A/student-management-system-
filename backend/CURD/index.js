const Api_Response = require('./api_response_folder/Api_Response');
const DatabaseAnalyzer = require('./Curd_op/DatabaseAnalyzer').DatabaseAnalyzer
const ErrorCode = require('./Curd_op/PrismaError').ErrorCode
const FileHandler = require("./Curd_op/handler/FileHandler")
const { QueryProcessor } = require('./Curd_op/QueryProcessor')
const { GetHandler } = require('./Curd_op/handler/GetHandler')
const { CreateHandler } = require('./Curd_op/handler/CreateHandler')
const { UpdateHandler } = require('./Curd_op/handler/UpdateHandler')
const { DeleteHandler } = require('./Curd_op/handler/DeleteHandler')

class PrismaCrudRouter {
  /**
   * Create a new CRUD router instance
   * @param {Object} app - Express application instance
   * @param {Object} models - Prisma client models object
   * @param {boolean} [isDev=false] - Development mode flag (enables detailed errors)
   * @param {Object} [options] - Configuration options:
   *      - version {string} - API version (default: "1.0.0")
   *      - encryptionValue {string|null} - Encryption key for responses (default: null)
   *      - logsPath {string|null} - Path for error logs (default: null)
   *      - defaultMiddleware {Array<Function>} - Global middleware array (default: [])
   *      - plugins {Array<Function|Object>} - Plugin functions/objects (default: [])
   *      - enableRelationAnalysis {boolean} - Enable relation detection (default: true)
   *      - enableConstraintChecking {boolean} - Enable DB constraint checks (default: true)
   *      - enableCascadeHandling {boolean} - Enable cascade operations (default: true)
   *      - powered_by {string} for the api tag 
   * @example
   * const router = new PrismaCrudRouter(app, prisma, true, {
   *   version: '2.0.0',
   *   defaultMiddleware: [loggerMiddleware]
   * });
   */
  constructor(app, models, isDev = false, options = {}) {
    this.app = app;
    this.models = models;
    this.isDev = isDev;
    this.options = {
      version: options.version || "1.0.0",
      encryptionValue: options.encryptionValue || null,
      logsPath: options.logsPath || null,
      defaultMiddleware: options.defaultMiddleware || [],
      plugins: options.plugins || [],
      enableRelationAnalysis: options.enableRelationAnalysis !== false,
      enableConstraintChecking: options.enableConstraintChecking !== false,
      enableCascadeHandling: options.enableCascadeHandling !== false,
      excludeFields: options.excludeFields || ['password'], // Default exclude fields
      ...options
    };

    this.apiResponse = new Api_Response(
      this.isDev,
      this.options.version,
      this.options.encryptionValue,
      this.options.logsPath,
      this.options.powered_by
    );

    this.databaseAnalyzer = new DatabaseAnalyzer();
    this.databaseAnalyzer.models = this.models;

    // Initialize QueryProcessor with database analyzer and options
    this.queryProcessor = new QueryProcessor(this.databaseAnalyzer, this.options);

    // Initialize handler classes with shared dependencies
    this.getHandler = new GetHandler(this.queryProcessor, this.apiResponse, this.databaseAnalyzer, this.options);
    this.createHandler = new CreateHandler(this.apiResponse, this.databaseAnalyzer, this.options);
    this.updateHandler = new UpdateHandler(this.apiResponse, this.databaseAnalyzer, this.options);
    this.deleteHandler = new DeleteHandler(this.apiResponse, this.databaseAnalyzer, this.options);

    this.registerPlugins();
  }

  /**
   * Register plugins for customization
   */
  registerPlugins() {
    this.options.plugins.forEach(plugin => {
      if (typeof plugin === 'function') {
        plugin(this);
      } else if (plugin && typeof plugin.register === 'function') {
        plugin.register(this);
      }
    });
  }

  /**
   * Add a plugin to extend router functionality
   * @param {Function|Object} plugin - Plugin can be either:
   *      - A function that receives the router instance
   *      - An object with register() method that receives the router instance
   * @example
   * // Function plugin
   * router.addPlugin((router) => {
   *   router.addGlobalMiddleware(myMiddleware);
   * });
   *
   * // Object plugin
   * router.addPlugin({
   *   register: (router) => {
   *     router.addGlobalMiddleware(myMiddleware);
   *   }
   * });
   */
  addPlugin(plugin) {
    this.options.plugins.push(plugin);
    if (typeof plugin === 'function') {
      plugin(this);
    } else if (plugin && typeof plugin.register === 'function') {
      plugin.register(this);
    }
  }

  /**
 * Creates CRUD routes with flexible configuration using a custom generator.
 *
 * @param {string} routePath - The base route path (e.g., '/users').
 * @param {Object} model - Prisma model instance used for CRUD operations.
 * @param {Object} routeOptions - Configuration options for the route.
 * @param {Function[]|Object} [routeOptions.middleware] - Array of Express middleware functions, or an object with per-method arrays (default, create, update, delete, get, getById)  { default: [], create: [], update: [], delete: [], get: [], getById: [] } .
 * @param {Function} [routeOptions.authMiddleware] - Middleware for authentication.
 *
 * @param {Object} [routeOptions.validation] - Validation functions.
 * @param {Function} [routeOptions.validation.create] - Validation function for create operations.
 * @param {Function} [routeOptions.validation.update] - Validation function for update operations.
 *
 * @param {Object} [routeOptions.beforeActions] - Pre-operation hooks.
 * @param {Function} [routeOptions.beforeActions.get] - Hook before GET all.
 * @param {Function} [routeOptions.beforeActions.create] - Hook before POST.
 * @param {Function} [routeOptions.beforeActions.update] - Hook before PUT.
 * @param {Function} [routeOptions.beforeActions.destroy] - Hook before DELETE.
 *
 * @param {Object} [routeOptions.afterActions] - Post-operation hooks (same structure as beforeActions).
 * @param {Function} [routeOptions.afterActions.get]
 * @param {Function} [routeOptions.afterActions.create]
 * @param {Function} [routeOptions.afterActions.update]
 * @param {Function} [routeOptions.afterActions.destroy]
 *
 * @param {Object<string, Function>} [routeOptions.customActions] - Custom route handlers keyed by HTTP method.
 * @param {Function} [routeOptions.errorHandler] - Custom error handler.
 * @param {boolean} [routeOptions.includeRelations=false] - Include related models.
 * @param {string[]} [routeOptions.excludeRelations] - Relation fields to exclude.
 * @param {boolean} [routeOptions.enableConstraintChecking=true] - Enable DB constraint validation.
 * @param {boolean} [routeOptions.enableCascadeHandling=true] - Enable cascade operation handling.
 *
 * @param {boolean} [routeOptions.autoDetectRelations=true] - Automatically detect and handle relations.
 * @param {string[]} [routeOptions.excludeRoute] - HTTP methods to exclude (e.g., ['get', 'post']).
 * @param {string[]} [routeOptions.excludeFields] - Fields to exclude from select, orderBy, and include (e.g., ['password']).
 */



  route(routePath, model, routeOptions = {}) {
    const {
      middleware = {},
      authMiddleware = null,
      customActions = {},
      errorHandler = null,
      excludeRoute = [],
    } = routeOptions;

    // Middleware composition
    // Accepts: middleware: { default: [], create: [], update: [], delete: [], get: [], getById: [] }
    // Fallback: if middleware is array, treat as default
    const middlewareObj = Array.isArray(middleware) ? { default: middleware } : (middleware || {});
    const composeMiddleware = (type) => [
      ...(this.options.defaultMiddleware || []),
      ...(middlewareObj.default || []),
      ...(middlewareObj[type] || []),
      ...(authMiddleware ? [authMiddleware] : [])
    ];

    const isExcluded = (method) => Array.isArray(excludeRoute) && excludeRoute.map(m => m.toLowerCase()).includes(method.toLowerCase());

    // Track which routes are registered
    const routeStatus = [
      { method: 'GET', label: 'GET', path: routePath, excluded: isExcluded('get') },
      { method: 'GET', label: 'GET BY ID', path: `${routePath}/:id`, excluded: isExcluded('getById') },
      { method: 'POST', label: 'POST', path: routePath, excluded: isExcluded('post') },
      { method: 'PUT', label: 'PUT', path: `${routePath}/:id`, excluded: isExcluded('put') },
      { method: 'DELETE', label: 'DELETE', path: `${routePath}/:id`, excluded: isExcluded('delete') },
    ];

    // Register custom actions first
    const customActionMethods = customActions ? Object.keys(customActions).map(m => m.toLowerCase()) : [];
    if (customActions && typeof customActions === 'object') {
      Object.entries(customActions).forEach(([method, handler]) => {
        const methodLower = method.toLowerCase();
        if (["get", "post", "put", "delete", "patch"].includes(methodLower) && typeof handler === 'function') {
          // For PUT and DELETE, use the /:id path
          if (methodLower === 'put' || methodLower === 'delete') {
            this.app[methodLower](`${routePath}/:id`, ...composeMiddleware(methodLower), handler);
            // console.log(`Registered custom ${methodLower.toUpperCase()} for ${routePath}/:id`);
          } else {
            this.app[methodLower](routePath, ...composeMiddleware(methodLower), handler);
            // console.log(`Registered custom ${methodLower.toUpperCase()} for ${routePath}`);
          }
        }
      });
    }

    // Then register default CRUD routes, but skip if a custom action exists for that method
    if (!isExcluded('get') && !customActionMethods.includes('get')) {
      this.app.get(routePath, ...composeMiddleware('get'), (req, res) => {
        this.getHandler.handleGetAll(req, res, model, routeOptions, errorHandler);
      });
    }

    // GET /:id: get by id
    if (!isExcluded('getById') && !customActionMethods.includes('getbyid')) {
      this.app.get(`${routePath}/:id`, ...composeMiddleware('getById'), (req, res) => {
        this.getHandler.handleGetById(req, res, model, routeOptions, errorHandler);
      });
    }

    // POST /: create
    if (!isExcluded('post') && !customActionMethods.includes('post')) {
      this.app.post(routePath, ...composeMiddleware('create'), (req, res) => {
        this.createHandler.handleCreate(req, res, model, routeOptions, errorHandler);
      });
    }

    // PUT /:id: update
    if (!isExcluded('put') && !customActionMethods.includes('put')) {
      this.app.put(`${routePath}/:id`, ...composeMiddleware('update'), (req, res) => {
        this.updateHandler.handleUpdate(req, res, model, routeOptions, errorHandler);
      });
    }

    // DELETE /:id: delete
    if (!isExcluded('delete') && !customActionMethods.includes('delete')) {
      this.app.delete(`${routePath}/:id`, ...composeMiddleware('delete'), (req, res) => {
        this.deleteHandler.handleDelete(req, res, model, routeOptions, errorHandler);
      });
    }

    console.log(`\n[ROUTER] ${routePath}`);
    routeStatus.forEach(r => {
      const status = r.excluded ? '❌ (excluded)' : '✔️';
      console.log(`  ${r.label.padEnd(10)} ${status}  ${r.excluded ? '' : r.path}`);
    });
  }

  /**
   * Standardize error handling and response formatting
   * @param {Error|Object} error - Error object, can be Prisma error or custom error
   * @param {string} method - HTTP method that triggered the error ('get', 'post', etc)
   * @param {Function} [customErrorHandler] - Optional custom error handler function
   * @returns {Object} Formatted error response with:
   *      - body: Error response body for React Admin
   *      - headers: Response headers
   *      - statusCode: HTTP status code
   * @example
   * // Default error handling
   * router.handleError(new Error('Not found'), 'get');
   *
   * // With custom handler
   * router.handleError(new Error('Not found'), 'get', (err, method, apiResponse) => {
   *   return apiResponse.error(method, null, 'Custom error', 400);
   * });
   */
  handleError(error, method, customErrorHandler) {
    if (customErrorHandler) {
      return customErrorHandler(error, method, this.apiResponse);
    }

    let errorMessage = this.isDev ? (error.code ? ErrorCode[error.code]?.errorMessage : error.message) : ErrorCode.default.errorMessage;
    let statusCode = error.code ? ErrorCode[error.code]?.statusCode : ErrorCode.default.statusCode;

    return this.apiResponse.error(method, null, errorMessage, statusCode);
  }

  /**
   * Add middleware that runs before all routes
   * @param {Function} middleware - Express middleware function
   * @example
   * // Add authentication middleware
   * router.addGlobalMiddleware(authMiddleware);
   *
   * // Add logging middleware
   * router.addGlobalMiddleware((req, res, next) => {
   *   console.log(`${req.method} ${req.path}`);
   *   next();
   * });
   */
  addGlobalMiddleware(middleware) {
    this.options.defaultMiddleware.push(middleware);
  }

  /**
   * Set default error handler for all routes
   * @param {Function} errorHandler - Function that receives:
   *      - error: The error object
   *      - method: HTTP method
   *      - apiResponse: Api_Response instance
   * @returns {Object} Should return formatted error response
   * @example
   * router.setGlobalErrorHandler((error, method, apiResponse) => {
   *   if (error.code === 'P2025') {
   *     return apiResponse.error(method, null, 'Not found', 404);
   *   }
   *   return apiResponse.error(method, null, 'Server error', 500);
   * });
   */
  setGlobalErrorHandler(errorHandler) {
    this.globalErrorHandler = errorHandler;
  }

  /**
   * Get the API response helper instance
   * @returns {Api_Response} Instance configured with router settings
   * @example
   * const apiResponse = router.getApiResponse();
   * res.json(apiResponse.success('get', data));
   */
  getApiResponse() {
    return this.apiResponse;
  }

  /**
   * Legacy method for creating CRUD routes (use route() instead)
   * @param {string} routePath - The base route path
   * @param {Object} model - Prisma model instance
   * @param {Object} [options] - Route configuration options
   * @deprecated Use route() method for more flexibility
   * @see route
   */
  createCrudRoute(routePath, model, options = {}) {
    this.route(routePath, model, options);
  }

  /**
   * Get model name from Prisma model
   * @param {Object} model - Prisma model
   * @returns {string} Model name
   */
  getModelName(model) {
    return model.constructor.name || 'Unknown';
  }
}



module.exports = { PrismaCrudRouter, DatabaseAnalyzer, Api_Response, FileHandler };