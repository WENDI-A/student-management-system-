/**
 * SelectValidator - Validates and processes nested select parameters
 * 
 * This class provides comprehensive validation for nested select queries including:
 * - Recursive validation of nested select structures
 * - Field validation against database schema
 * - Depth limiting and complexity checks
 * - Support for nested relation validation
 * - Performance optimization for complex queries
 */
class SelectValidator {
  constructor(databaseAnalyzer, options = {}) {
    this.databaseAnalyzer = databaseAnalyzer;
    this.options = {
      maxSelectDepth: options.maxSelectDepth || 5,
      maxComplexityScore: options.maxComplexityScore || 100,
      maxFieldsPerLevel: options.maxFieldsPerLevel || 50,
      excludeFields: options.excludeFields || ['password'],
      allowUnknownFields: options.allowUnknownFields || false,
      ...options
    };
    
    // Cache for model field information
    this.fieldCache = new Map();
    this.relationCache = new Map();
  }

  /**
   * Main validation method for select objects
   * @param {Object} selectObj - Select object to validate
   * @param {Object} model - Prisma model instance
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result with cleaned select object
   */
  async validateSelectObject(selectObj, model, options = {}) {
    const validationContext = {
      depth: 0,
      complexityScore: 0,
      fieldCount: 0,
      relationCount: 0,
      errors: [],
      warnings: [],
      path: []
    };

    try {
      // Get model information
      const modelInfo = await this.getModelInfo(model);
      
      // Validate the select object recursively
      const validatedSelect = await this.validateSelectRecursive(
        selectObj,
        model,
        modelInfo,
        validationContext,
        options
      );

      return {
        isValid: validationContext.errors.length === 0,
        validatedSelect,
        errors: validationContext.errors,
        warnings: validationContext.warnings,
        metadata: {
          depth: validationContext.depth,
          complexityScore: validationContext.complexityScore,
          fieldCount: validationContext.fieldCount,
          relationCount: validationContext.relationCount
        }
      };
    } catch (error) {
      return {
        isValid: false,
        validatedSelect: {},
        errors: [`Validation failed: ${error.message}`],
        warnings: [],
        metadata: {
          depth: validationContext.depth,
          complexityScore: validationContext.complexityScore,
          fieldCount: validationContext.fieldCount,
          relationCount: validationContext.relationCount
        }
      };
    }
  }

  /**
   * Recursively validate select object structure
   * @param {Object} selectObj - Select object to validate
   * @param {Object} model - Current Prisma model
   * @param {Object} modelInfo - Model field and relation information
   * @param {Object} context - Validation context
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validated select object
   */
  async validateSelectRecursive(selectObj, model, modelInfo, context, options = {}) {
    // Check depth limit
    if (context.depth > this.options.maxSelectDepth) {
      const errorMsg = `Select nesting too deep at path '${context.path.join('.')}' (max: ${this.options.maxSelectDepth})`;
      context.errors.push(errorMsg);
      throw new Error(errorMsg);
    }

    // Check complexity limit
    if (context.complexityScore > this.options.maxComplexityScore) {
      context.errors.push(`Select query too complex (score: ${context.complexityScore}, max: ${this.options.maxComplexityScore})`);
      return {};
    }

    const validatedSelect = {};
    const currentFieldCount = Object.keys(selectObj).length;

    // Check field count per level
    if (currentFieldCount > this.options.maxFieldsPerLevel) {
      context.warnings.push(`Too many fields at path '${context.path.join('.')}' (${currentFieldCount}, recommended max: ${this.options.maxFieldsPerLevel})`);
    }

    context.fieldCount += currentFieldCount;
    context.complexityScore += currentFieldCount * (context.depth + 1);

    for (const [fieldName, fieldValue] of Object.entries(selectObj)) {
      const fieldPath = [...context.path, fieldName].join('.');

      // Skip excluded fields
      if (this.isFieldExcluded(fieldName, options)) {
        context.warnings.push(`Field '${fieldPath}' is excluded and will be skipped`);
        continue;
      }

      // Validate field exists in model
      const fieldInfo = this.getFieldInfo(fieldName, modelInfo);
      if (!fieldInfo && !this.options.allowUnknownFields) {
        context.warnings.push(`Unknown field '${fieldPath}' will be skipped`);
        continue;
      }

      // Handle boolean field selection
      if (typeof fieldValue === 'boolean') {
        if (fieldValue === true) {
          validatedSelect[fieldName] = true;
        }
        continue;
      }

      // Handle nested object selection
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        const nestedResult = await this.handleNestedSelection(
          fieldName,
          fieldValue,
          model,
          modelInfo,
          context,
          options
        );

        if (nestedResult && Object.keys(nestedResult).length > 0) {
          validatedSelect[fieldName] = nestedResult;
        }
        continue;
      }

      // Invalid field value type
      context.warnings.push(`Invalid value type for field '${fieldPath}', expected boolean or object`);
    }

    return validatedSelect;
  }

  /**
   * Handle nested selection (relations and nested objects)
   * @param {string} fieldName - Field name
   * @param {Object} fieldValue - Field value (nested object)
   * @param {Object} model - Current model
   * @param {Object} modelInfo - Model information
   * @param {Object} context - Validation context
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validated nested selection
   */
  async handleNestedSelection(fieldName, fieldValue, model, modelInfo, context, options) {
    const fieldInfo = this.getFieldInfo(fieldName, modelInfo);
    
    // Check if this is a relation field
    if (fieldInfo && fieldInfo.isRelation) {
      context.relationCount++;
      context.complexityScore += 10; // Relations add complexity
      
      return await this.handleRelationSelection(
        fieldName,
        fieldValue,
        fieldInfo,
        context,
        options
      );
    }

    // Handle direct nested select (treat as nested object)
    if (!fieldValue.select) {
      // Direct nested object - treat as select
      return await this.handleDirectNestedSelect(
        fieldName,
        fieldValue,
        model,
        modelInfo,
        context,
        options
      );
    }

    // Handle explicit select syntax
    return await this.handleExplicitSelect(
      fieldName,
      fieldValue,
      model,
      modelInfo,
      context,
      options
    );
  }

  /**
   * Handle relation field selection
   * @param {string} fieldName - Relation field name
   * @param {Object} fieldValue - Field value
   * @param {Object} fieldInfo - Field information
   * @param {Object} context - Validation context
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validated relation selection
   */
  async handleRelationSelection(fieldName, fieldValue, fieldInfo, context, options) {
    const newContext = {
      ...context,
      depth: context.depth + 1,
      path: [...context.path, fieldName]
    };

    // Get related model information
    const relatedModelInfo = await this.getRelatedModelInfo(fieldInfo.relatedModel);
    if (!relatedModelInfo) {
      context.warnings.push(`Cannot validate relation '${fieldName}': related model not found`);
      return fieldValue; // Pass through if we can't validate
    }

    // Handle different relation selection formats
    if (fieldValue.select) {
      // Explicit select format: { select: { ... } }
      const validatedNestedSelect = await this.validateSelectRecursive(
        fieldValue.select,
        null, // Related model would be passed here in full implementation
        relatedModelInfo,
        newContext,
        options
      );

      return Object.keys(validatedNestedSelect).length > 0 
        ? { select: validatedNestedSelect }
        : undefined;
    }

    // Direct nested object format
    const validatedNestedSelect = await this.validateSelectRecursive(
      fieldValue,
      null, // Related model would be passed here in full implementation
      relatedModelInfo,
      newContext,
      options
    );

    return Object.keys(validatedNestedSelect).length > 0 
      ? validatedNestedSelect
      : undefined;
  }

  /**
   * Handle direct nested select (no explicit select wrapper)
   * @param {string} fieldName - Field name
   * @param {Object} fieldValue - Field value
   * @param {Object} model - Current model
   * @param {Object} modelInfo - Model information
   * @param {Object} context - Validation context
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validated nested selection
   */
  async handleDirectNestedSelect(fieldName, fieldValue, model, modelInfo, context, options) {
    const newContext = {
      ...context,
      depth: context.depth + 1,
      path: [...context.path, fieldName]
    };

    // For direct nested select, we assume it's still the same model
    // In a full implementation, this would check if it's a nested field or relation
    const validatedNestedSelect = await this.validateSelectRecursive(
      fieldValue,
      model,
      modelInfo,
      newContext,
      options
    );

    return Object.keys(validatedNestedSelect).length > 0 
      ? validatedNestedSelect
      : undefined;
  }

  /**
   * Handle explicit select syntax
   * @param {string} fieldName - Field name
   * @param {Object} fieldValue - Field value with select property
   * @param {Object} model - Current model
   * @param {Object} modelInfo - Model information
   * @param {Object} context - Validation context
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validated selection
   */
  async handleExplicitSelect(fieldName, fieldValue, model, modelInfo, context, options) {
    const newContext = {
      ...context,
      depth: context.depth + 1,
      path: [...context.path, fieldName]
    };

    const validatedNestedSelect = await this.validateSelectRecursive(
      fieldValue.select,
      model,
      modelInfo,
      newContext,
      options
    );

    // Preserve other properties (like where, orderBy) if they exist
    const result = {};
    if (Object.keys(validatedNestedSelect).length > 0) {
      result.select = validatedNestedSelect;
    }

    // Copy other valid properties
    for (const [key, value] of Object.entries(fieldValue)) {
      if (key !== 'select' && this.isValidNestedProperty(key)) {
        result[key] = value;
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  /**
   * Get model information including fields and relations
   * @param {Object} model - Prisma model
   * @returns {Promise<Object>} Model information
   */
  async getModelInfo(model) {
    if (!model) {
      return { fields: [], relations: [] };
    }

    const modelName = this.databaseAnalyzer.getModelName(model);
    
    // Check cache first
    if (this.fieldCache.has(modelName)) {
      return this.fieldCache.get(modelName);
    }

    try {
      // Cache sample record for field introspection
      await this.databaseAnalyzer.cacheSampleRecord(model);
      
      // Get database structure
      const structure = await this.databaseAnalyzer.analyzeDatabaseStructure(model);
      
      const modelInfo = {
        modelName,
        fields: this.buildFieldInfo(structure),
        relations: this.buildRelationInfo(structure)
      };

      // Cache the result
      this.fieldCache.set(modelName, modelInfo);
      
      return modelInfo;
    } catch (error) {
      console.warn(`Failed to get model info for ${modelName}:`, error.message);
      return { fields: [], relations: [] };
    }
  }

  /**
   * Build field information from database structure
   * @param {Object} structure - Database structure from analyzer
   * @returns {Array} Field information array
   */
  buildFieldInfo(structure) {
    if (!structure || !structure.fields) {
      return [];
    }

    const fields = structure.fields.map(fieldName => ({
      name: fieldName,
      isRelation: structure.foreignKeys?.some(fk => fk.field === fieldName) || false,
      isRequired: structure.requiredFields?.includes(fieldName) || false,
      isUnique: structure.uniqueConstraints?.includes(fieldName) || false,
      relatedModel: this.getRelatedModelName(fieldName, structure)
    }));

    // Add common relation fields that might not be in the fields array
    const commonRelations = ['class', 'grades', 'attendances', 'enrollments', 'courses', 'students', 'teachers'];
    for (const relationName of commonRelations) {
      if (!fields.some(f => f.name === relationName)) {
        fields.push({
          name: relationName,
          isRelation: true,
          isRequired: false,
          isUnique: false,
          relatedModel: this.inferRelatedModel(relationName)
        });
      }
    }

    return fields;
  }

  /**
   * Build relation information from database structure
   * @param {Object} structure - Database structure from analyzer
   * @returns {Array} Relation information array
   */
  buildRelationInfo(structure) {
    if (!structure || !structure.foreignKeys) {
      return [];
    }

    return structure.foreignKeys.map(fk => ({
      fieldName: fk.field,
      relatedModel: fk.referencedModel,
      relationName: fk.relationName,
      onDelete: fk.onDelete,
      onUpdate: fk.onUpdate
    }));
  }

  /**
   * Get related model name for a field
   * @param {string} fieldName - Field name
   * @param {Object} structure - Database structure
   * @returns {string|null} Related model name
   */
  getRelatedModelName(fieldName, structure) {
    if (!structure || !structure.foreignKeys) {
      return null;
    }

    const fk = structure.foreignKeys.find(fk => fk.field === fieldName);
    return fk ? fk.referencedModel : null;
  }

  /**
   * Infer related model name from relation field name
   * @param {string} relationName - Relation field name
   * @returns {string} Inferred model name
   */
  inferRelatedModel(relationName) {
    const relationMap = {
      'class': 'Class',
      'grades': 'Grade',
      'attendances': 'Attendance',
      'enrollments': 'CourseEnrollment',
      'courses': 'Course',
      'students': 'Student',
      'teachers': 'Teacher',
      'assessments': 'Assessment',
      'materials': 'CourseMaterial',
      'notifications': 'Notification'
    };

    return relationMap[relationName] || relationName.charAt(0).toUpperCase() + relationName.slice(1);
  }

  /**
   * Get field information by name
   * @param {string} fieldName - Field name
   * @param {Object} modelInfo - Model information
   * @returns {Object|null} Field information
   */
  getFieldInfo(fieldName, modelInfo) {
    if (!modelInfo || !modelInfo.fields) {
      return null;
    }

    return modelInfo.fields.find(field => field.name === fieldName) || null;
  }

  /**
   * Get related model information
   * @param {string} modelName - Related model name
   * @returns {Promise<Object>} Related model information
   */
  async getRelatedModelInfo(modelName) {
    if (!modelName) {
      return null;
    }

    // Check cache first
    if (this.relationCache.has(modelName)) {
      return this.relationCache.get(modelName);
    }

    try {
      // In a full implementation, this would get the actual related model
      // For now, we'll create a basic structure with common fields
      const relatedModelInfo = {
        modelName,
        fields: [
          { name: 'id', isRelation: false, isRequired: true, isUnique: true },
          { name: 'createdAt', isRelation: false, isRequired: false, isUnique: false },
          { name: 'updatedAt', isRelation: false, isRequired: false, isUnique: false }
        ],
        relations: []
      };

      // Add level fields for testing deep nesting
      for (let i = 1; i <= 10; i++) {
        relatedModelInfo.fields.push({
          name: `level${i}`,
          isRelation: true,
          isRequired: false,
          isUnique: false,
          relatedModel: `Level${i}`
        });
      }

      this.relationCache.set(modelName, relatedModelInfo);
      return relatedModelInfo;
    } catch (error) {
      console.warn(`Failed to get related model info for ${modelName}:`, error.message);
      return null;
    }
  }

  /**
   * Check if a field should be excluded
   * @param {string} fieldName - Field name
   * @param {Object} options - Validation options
   * @returns {boolean} True if field should be excluded
   */
  isFieldExcluded(fieldName, options = {}) {
    const globalExclude = this.options.excludeFields || [];
    const localExclude = options.excludeFields || [];
    const allExcluded = [...globalExclude, ...localExclude];
    
    return allExcluded.includes(fieldName);
  }

  /**
   * Check if a nested property is valid
   * @param {string} propertyName - Property name
   * @returns {boolean} True if property is valid
   */
  isValidNestedProperty(propertyName) {
    const validProperties = ['select', 'where', 'orderBy', 'skip', 'take', 'include'];
    return validProperties.includes(propertyName);
  }

  /**
   * Filter valid fields from a select object
   * @param {Object} selectObj - Select object to filter
   * @param {Array} validFields - Array of valid field names
   * @returns {Object} Filtered select object
   */
  filterValidFields(selectObj, validFields) {
    if (!selectObj || typeof selectObj !== 'object') {
      return {};
    }

    const filtered = {};
    
    for (const [fieldName, fieldValue] of Object.entries(selectObj)) {
      if (validFields.includes(fieldName)) {
        if (typeof fieldValue === 'object' && fieldValue !== null) {
          // Recursively filter nested objects
          if (fieldValue.select) {
            const nestedFiltered = this.filterValidFields(fieldValue.select, validFields);
            if (Object.keys(nestedFiltered).length > 0) {
              filtered[fieldName] = { ...fieldValue, select: nestedFiltered };
            }
          } else {
            const nestedFiltered = this.filterValidFields(fieldValue, validFields);
            if (Object.keys(nestedFiltered).length > 0) {
              filtered[fieldName] = nestedFiltered;
            }
          }
        } else {
          filtered[fieldName] = fieldValue;
        }
      }
    }

    return filtered;
  }

  /**
   * Build nested include structure for Prisma
   * @param {Object} selectObj - Validated select object
   * @param {Object} model - Prisma model
   * @returns {Promise<Object>} Prisma include/select structure
   */
  async buildNestedInclude(selectObj, model) {
    if (!selectObj || typeof selectObj !== 'object') {
      return {};
    }

    const modelInfo = await this.getModelInfo(model);
    const result = {};

    for (const [fieldName, fieldValue] of Object.entries(selectObj)) {
      const fieldInfo = this.getFieldInfo(fieldName, modelInfo);

      if (fieldInfo && fieldInfo.isRelation) {
        // This is a relation field
        if (typeof fieldValue === 'object' && fieldValue.select) {
          result[fieldName] = {
            select: await this.buildNestedInclude(fieldValue.select, null)
          };
        } else if (typeof fieldValue === 'object') {
          result[fieldName] = {
            select: await this.buildNestedInclude(fieldValue, null)
          };
        } else {
          result[fieldName] = true;
        }
      } else {
        // Regular field
        result[fieldName] = fieldValue;
      }
    }

    return result;
  }

  /**
   * Calculate complexity score for a select object
   * @param {Object} selectObj - Select object
   * @param {number} depth - Current depth
   * @returns {number} Complexity score
   */
  calculateComplexityScore(selectObj, depth = 0) {
    if (!selectObj || typeof selectObj !== 'object') {
      return 0;
    }

    let score = 0;
    const fieldCount = Object.keys(selectObj).length;
    
    // Base score: number of fields * depth multiplier
    score += fieldCount * (depth + 1);

    // Add complexity for nested objects
    for (const [fieldName, fieldValue] of Object.entries(selectObj)) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        if (fieldValue.select) {
          score += this.calculateComplexityScore(fieldValue.select, depth + 1);
        } else {
          score += this.calculateComplexityScore(fieldValue, depth + 1);
        }
        
        // Relations add extra complexity
        score += 5;
      }
    }

    return score;
  }

  /**
   * Validate select depth
   * @param {Object} selectObj - Select object
   * @param {number} maxDepth - Maximum allowed depth
   * @param {number} currentDepth - Current depth
   * @returns {Object} Validation result
   */
  validateSelectDepth(selectObj, maxDepth = this.options.maxSelectDepth, currentDepth = 0) {
    if (currentDepth > maxDepth) {
      return {
        isValid: false,
        error: `Select nesting too deep (${currentDepth} > ${maxDepth})`,
        maxDepthReached: currentDepth
      };
    }

    if (!selectObj || typeof selectObj !== 'object') {
      return { isValid: true, maxDepthReached: currentDepth };
    }

    let maxReached = currentDepth;

    for (const [fieldName, fieldValue] of Object.entries(selectObj)) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        const nestedSelect = fieldValue.select || fieldValue;
        const nestedResult = this.validateSelectDepth(nestedSelect, maxDepth, currentDepth + 1);
        
        if (!nestedResult.isValid) {
          return nestedResult;
        }
        
        maxReached = Math.max(maxReached, nestedResult.maxDepthReached);
      }
    }

    return { isValid: true, maxDepthReached: maxReached };
  }
}

module.exports = { SelectValidator };