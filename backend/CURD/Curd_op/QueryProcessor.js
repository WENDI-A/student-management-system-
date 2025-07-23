const { SelectValidator } = require('./SelectValidator');

/**
 * QueryProcessor - Centralized query handling for PrismaCrudRouter
 * 
 * This class extracts and centralizes all query processing logic including:
 * - Filter processing and validation
 * - Select parameter handling and nested select validation
 * - OrderBy processing and validation
 * - Pagination handling (skip/take/offset/limit)
 * - Query parameter structure validation
 */
class QueryProcessor {
  constructor(databaseAnalyzer, options = {}) {
    this.databaseAnalyzer = databaseAnalyzer;
    this.options = {
      excludeFields: options.excludeFields || ['password'],
      maxSelectDepth: options.maxSelectDepth || 5,
      maxTakeLimit: options.maxTakeLimit || 1000,
      defaultTake: options.defaultTake || 100,
      ...options
    };

    // Initialize SelectValidator with same options, but allow unknown fields for relations
    this.selectValidator = new SelectValidator(databaseAnalyzer, {
      ...this.options,
      allowUnknownFields: true // Allow inferred relations to pass through
    });
  }

  /**
   * Process GET query parameters and return validated Prisma query object
   * @param {Object} query - Express request query object
   * @param {Object} model - Prisma model instance
   * @param {Object} routeOptions - Route-specific options
   * @returns {Promise<Object>} Processed query object for Prisma
   */
  async processGetQuery(query, model, routeOptions = {}) {
    try {
      // Get database structure and valid fields
      await this.databaseAnalyzer.cacheSampleRecord(model);
      const structure = await this.databaseAnalyzer.analyzeDatabaseStructure(model);
      const validFields = structure && structure.fields && structure.fields.length > 0 ? structure.fields : [];

      // Build exclude list (global + route-specific)
      const globalExclude = this.options.excludeFields || [];
      const routeExclude = routeOptions.excludeFields || [];
      const excludeFields = Array.from(new Set([...globalExclude, ...routeExclude]));

      // Filter valid fields
      const filteredFields = validFields.filter(f => !excludeFields.includes(f));

      // Process each query parameter
      const processedQuery = {
        where: await this.processFilter(query.filter, filteredFields),
        select: await this.processSelect(query.select, model, filteredFields),
        orderBy: await this.processOrderBy(query.orderBy || query.order, filteredFields),
        pagination: this.processPagination(query)
      };

      // Build final Prisma query
      return this.buildPrismaQuery(processedQuery);
    } catch (error) {
      throw new Error(`Query processing failed: ${error.message}`);
    }
  }

  /**
   * Process filter parameter and validate against valid fields
   * @param {string|Object} filterParam - Filter parameter from query
   * @param {Array} validFields - Array of valid field names
   * @returns {Promise<Object>} Processed filter object
   */
  async processFilter(filterParam, validFields) {
    if (!filterParam) return {};

    try {
      let filter = typeof filterParam === 'string' ? JSON.parse(filterParam) : filterParam;
      return this.filterWhereObject(filter, validFields);
    } catch (error) {
      throw new Error(`Invalid filter parameter: ${error.message}`);
    }
  }

  /**
   * Process select parameter with nested select validation
   * @param {string|Object|Array} selectParam - Select parameter from query
   * @param {Object} model - Prisma model instance
   * @param {Array} validFields - Array of valid field names
   * @returns {Promise<Object|undefined>} Processed select object
   */
  async processSelect(selectParam, model, validFields) {
    if (!selectParam) {
      // Default: select all valid fields (excluding excluded fields)
      const filteredFields = validFields.filter(f => !this.options.excludeFields.includes(f));
      return Object.fromEntries(filteredFields.map(f => [f, true]));
    }

    try {
      let select = typeof selectParam === 'string' ? JSON.parse(selectParam) : selectParam;

      // Handle array format: convert to object
      if (Array.isArray(select)) {
        const filteredFields = select.filter(f => validFields.includes(f) && !this.options.excludeFields.includes(f));
        return Object.fromEntries(filteredFields.map(f => [f, true]));
      }

      // Handle object format: use SelectValidator for comprehensive validation
      if (typeof select === 'object') {
        const validationResult = await this.selectValidator.validateSelectObject(select, model);

        if (!validationResult.isValid) {
          console.warn('Select validation warnings:', validationResult.warnings);
          console.warn('Select validation errors:', validationResult.errors);

          // Throw error for critical validation failures
          if (validationResult.errors.length > 0) {
            throw new Error(validationResult.errors[0]);
          }
        }

        return validationResult.validatedSelect;
      }

      throw new Error('Select parameter must be an array or object');
    } catch (error) {
      throw new Error(`Invalid select parameter: ${error.message}`);
    }
  }

  /**
   * Process orderBy parameter and validate fields
   * @param {string|Object|Array} orderByParam - OrderBy parameter from query
   * @param {Array} validFields - Array of valid field names
   * @returns {Promise<Object|Array|undefined>} Processed orderBy object
   */
  async processOrderBy(orderByParam, validFields) {
    if (!orderByParam) return undefined;

    try {
      let orderBy = typeof orderByParam === 'string' ? JSON.parse(orderByParam) : orderByParam;

      // Handle legacy order format: [[field, direction]]
      if (Array.isArray(orderBy) && orderBy.length > 0 && Array.isArray(orderBy[0])) {
        const [field, direction] = orderBy[0];
        if (validFields.includes(field)) {
          return { [field]: direction.toLowerCase() };
        }
        return undefined;
      }

      // Handle array format
      if (Array.isArray(orderBy)) {
        return orderBy.filter(o => {
          if (typeof o === 'object' && o !== null) {
            const field = Object.keys(o)[0];
            return validFields.includes(field);
          }
          return false;
        });
      }

      // Handle object format
      if (typeof orderBy === 'object') {
        return Object.fromEntries(
          Object.entries(orderBy).filter(([field]) => validFields.includes(field))
        );
      }

      return undefined;
    } catch (error) {
      throw new Error(`Invalid orderBy parameter: ${error.message}`);
    }
  }

  /**
   * Process pagination parameters
   * @param {Object} query - Query parameters
   * @returns {Object} Pagination object with skip and take
   */
  processPagination(query) {
    const limit = query.limit ? parseInt(query.limit) : this.options.defaultTake;
    const offset = query.offset ? parseInt(query.offset) : 0;
    const skip = query.skip ? parseInt(query.skip) : offset;
    const take = query.take ? parseInt(query.take) : limit;

    // Apply limits
    const finalTake = Math.min(take, this.options.maxTakeLimit);
    const finalSkip = Math.max(skip, 0);

    return {
      skip: finalSkip,
      take: finalTake
    };
  }

  /**
   * Validate nested select structure recursively
   * @param {Object} selectObj - Select object to validate
   * @param {Object} model - Prisma model instance
   * @param {Array} validFields - Array of valid field names for current level
   * @param {number} depth - Current nesting depth
   * @returns {Promise<Object>} Validated select object
   */
  async validateNestedSelect(selectObj, model, validFields, depth = 0) {
    if (depth > this.options.maxSelectDepth) {
      throw new Error(`Select nesting too deep (max: ${this.options.maxSelectDepth})`);
    }

    const validatedSelect = {};

    for (const [field, value] of Object.entries(selectObj)) {
      // Skip invalid fields at current level
      if (!validFields.includes(field)) {
        continue;
      }

      // Simple field selection
      if (value === true || value === false) {
        validatedSelect[field] = value;
        continue;
      }

      // Nested select object
      if (typeof value === 'object' && value !== null && value.select) {
        try {
          // For nested relations, we would need to get the related model's fields
          // For now, we'll pass the nested select through with basic validation
          const nestedSelect = await this.validateNestedSelect(
            value.select,
            model, // In a full implementation, this should be the related model
            validFields, // In a full implementation, this should be the related model's fields
            depth + 1
          );

          if (Object.keys(nestedSelect).length > 0) {
            validatedSelect[field] = { select: nestedSelect };
          }
        } catch (error) {
          // Skip invalid nested selects
          console.warn(`Skipping invalid nested select for field ${field}: ${error.message}`);
        }
        continue;
      }

      // Direct nested object (treat as select)
      if (typeof value === 'object' && value !== null) {
        try {
          const nestedSelect = await this.validateNestedSelect(
            value,
            model,
            validFields,
            depth + 1
          );

          if (Object.keys(nestedSelect).length > 0) {
            validatedSelect[field] = nestedSelect;
          }
        } catch (error) {
          console.warn(`Skipping invalid nested select for field ${field}: ${error.message}`);
        }
      }
    }

    return validatedSelect;
  }

  /**
   * Build final Prisma query object from processed components
   * @param {Object} processedQuery - Processed query components
   * @returns {Object} Final Prisma query object
   */
  buildPrismaQuery(processedQuery) {
    const prismaQuery = {};

    // Add where clause
    if (processedQuery.where && Object.keys(processedQuery.where).length > 0) {
      prismaQuery.where = processedQuery.where;
    }

    // Add select clause
    if (processedQuery.select && Object.keys(processedQuery.select).length > 0) {
      prismaQuery.select = processedQuery.select;
    }

    // Add orderBy clause
    if (processedQuery.orderBy) {
      if (Array.isArray(processedQuery.orderBy) && processedQuery.orderBy.length > 0) {
        prismaQuery.orderBy = processedQuery.orderBy;
      } else if (typeof processedQuery.orderBy === 'object' && Object.keys(processedQuery.orderBy).length > 0) {
        prismaQuery.orderBy = processedQuery.orderBy;
      }
    }

    // Add pagination
    if (processedQuery.pagination) {
      prismaQuery.skip = processedQuery.pagination.skip;
      prismaQuery.take = processedQuery.pagination.take;
    }

    return prismaQuery;
  }

  /**
   * Recursively filter where object to only allow valid fields and Prisma logical operators
   * @param {Object} where - Where clause object
   * @param {Array} validFields - Array of valid field names
   * @returns {Object} Filtered where object
   */
  filterWhereObject(where, validFields) {
    if (!where || typeof where !== 'object') return where;

    const LOGICAL_OPERATORS = ['AND', 'OR', 'NOT'];
    let result = Array.isArray(where) ? [] : {};

    for (const [key, value] of Object.entries(where)) {
      if (LOGICAL_OPERATORS.includes(key)) {
        // Handle logical operators: recurse into array or object
        if (Array.isArray(value)) {
          result[key] = value
            .map(v => this.filterWhereObject(v, validFields))
            .filter(v => v && Object.keys(v).length > 0);
        } else if (typeof value === 'object') {
          const filtered = this.filterWhereObject(value, validFields);
          if (filtered && Object.keys(filtered).length > 0) {
            result[key] = filtered;
          }
        }
      } else if (validFields.includes(key)) {
        // Valid field: keep and recurse if object
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          result[key] = this.filterWhereObject(value, validFields);
        } else {
          result[key] = value;
        }
      }
      // Invalid fields are skipped
    }

    return result;
  }

  /**
   * Validate query parameter structure
   * @param {Object} query - Query parameters to validate
   * @returns {Object} Validation result
   */
  validateQueryStructure(query) {
    const errors = [];
    const warnings = [];

    // Validate JSON parameters
    const jsonParams = ['filter', 'select', 'orderBy', 'order'];
    for (const param of jsonParams) {
      if (query[param] && typeof query[param] === 'string') {
        try {
          JSON.parse(query[param]);
        } catch (error) {
          errors.push(`Invalid JSON in ${param} parameter: ${error.message}`);
        }
      }
    }

    // Validate numeric parameters
    const numericParams = ['limit', 'offset', 'skip', 'take'];
    for (const param of numericParams) {
      if (query[param] !== undefined) {
        const value = parseInt(query[param]);
        if (isNaN(value) || value < 0) {
          errors.push(`Invalid ${param} parameter: must be a non-negative integer`);
        }
      }
    }

    // Check for conflicting pagination parameters
    if (query.limit && query.take) {
      warnings.push('Both limit and take parameters provided. Using take.');
    }
    if (query.offset && query.skip) {
      warnings.push('Both offset and skip parameters provided. Using skip.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = { QueryProcessor };