/**
 * ValidationManager - Enhanced validation system for CRUD operations
 * Provides comprehensive error reporting with field paths
 * Implements nested relation validation and constraint checking improvements
 */
class ValidationManager {
    /**
     * Create a new ValidationManager instance
     * @param {Object} databaseAnalyzer - DatabaseAnalyzer instance for schema analysis
     * @param {Object} options - Configuration options
     */
    constructor(databaseAnalyzer, options = {}) {
        this.databaseAnalyzer = databaseAnalyzer;
        this.options = options;
        this.validationCache = new Map();
    }

    /**
     * Validate data for create operations
     * @param {Object} data - Data to validate
     * @param {Object} model - Prisma model instance
     * @param {Object} validation - Validation configuration
     * @param {Object} req - Express request object
     * @returns {Object} Validation result with detailed error reporting
     */
    async validateCreateData(data, model, validation = null, req = null) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            fieldErrors: {},
            processedData: { ...data }
        };

        try {
            // Basic data validation
            if (!data || typeof data !== 'object') {
                result.isValid = false;
                result.errors.push({
                    type: 'INVALID_DATA_TYPE',
                    message: 'Invalid data provided for creation',
                    path: 'root',
                    code: 'VALIDATION_ERROR'
                });
                return result;
            }

            // Execute custom validation if provided
            if (validation && validation.create) {
                const customValidation = await this._executeCustomValidation(
                    validation.create,
                    data,
                    req,
                    'create'
                );
                if (!customValidation.isValid) {
                    result.isValid = false;
                    result.errors.push(...customValidation.errors);
                    result.fieldErrors = { ...result.fieldErrors, ...customValidation.fieldErrors };
                }
            }

            // Database constraint validation
            const constraintValidation = await this._validateConstraints('create', data, model);
            if (!constraintValidation.isValid) {
                result.isValid = false;
                result.errors.push(...constraintValidation.errors);
                result.fieldErrors = { ...result.fieldErrors, ...constraintValidation.fieldErrors };
            }

            // Nested relation validation
            const relationValidation = await this._validateNestedRelations(data, model, 'create');
            if (!relationValidation.isValid) {
                result.isValid = false;
                result.errors.push(...relationValidation.errors);
                result.fieldErrors = { ...result.fieldErrors, ...relationValidation.fieldErrors };
            }
            result.warnings.push(...relationValidation.warnings);

            // Field type validation
            const typeValidation = await this._validateFieldTypes(data, model, 'create');
            if (!typeValidation.isValid) {
                result.isValid = false;
                result.errors.push(...typeValidation.errors);
                result.fieldErrors = { ...result.fieldErrors, ...typeValidation.fieldErrors };
            }

        } catch (error) {
            result.isValid = false;
            result.errors.push({
                type: 'VALIDATION_SYSTEM_ERROR',
                message: `Validation system error: ${error.message}`,
                path: 'system',
                code: 'INTERNAL_ERROR'
            });
        }

        return result;
    }

    /**
     * Validate data for update operations
     * @param {Object} data - Data to validate
     * @param {Object} model - Prisma model instance
     * @param {Object} validation - Validation configuration
     * @param {Object} req - Express request object
     * @param {string|number} id - Record ID being updated
     * @returns {Object} Validation result with detailed error reporting
     */
    async validateUpdateData(data, model, validation = null, req = null, id = null) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            fieldErrors: {},
            processedData: { ...data }
        };

        try {
            // Basic data validation
            if (!data || typeof data !== 'object') {
                result.isValid = false;
                result.errors.push({
                    type: 'INVALID_DATA_TYPE',
                    message: 'Invalid data provided for update',
                    path: 'root',
                    code: 'VALIDATION_ERROR'
                });
                return result;
            }

            // ID validation
            if (!id) {
                result.isValid = false;
                result.errors.push({
                    type: 'MISSING_ID',
                    message: 'ID is required for update operation',
                    path: 'id',
                    code: 'VALIDATION_ERROR'
                });
                return result;
            }

            // Execute custom validation if provided
            if (validation && validation.update) {
                const customValidation = await this._executeCustomValidation(
                    validation.update,
                    data,
                    req,
                    'update'
                );
                if (!customValidation.isValid) {
                    result.isValid = false;
                    result.errors.push(...customValidation.errors);
                    result.fieldErrors = { ...result.fieldErrors, ...customValidation.fieldErrors };
                }
            }

            // Database constraint validation (excluding ID constraints for updates)
            const constraintValidation = await this._validateConstraints('update', data, model, id);
            if (!constraintValidation.isValid) {
                result.isValid = false;
                result.errors.push(...constraintValidation.errors);
                result.fieldErrors = { ...result.fieldErrors, ...constraintValidation.fieldErrors };
            }

            // Nested relation validation
            const relationValidation = await this._validateNestedRelations(data, model, 'update');
            if (!relationValidation.isValid) {
                result.isValid = false;
                result.errors.push(...relationValidation.errors);
                result.fieldErrors = { ...result.fieldErrors, ...relationValidation.fieldErrors };
            }
            result.warnings.push(...relationValidation.warnings);

            // Field type validation
            const typeValidation = await this._validateFieldTypes(data, model, 'update');
            if (!typeValidation.isValid) {
                result.isValid = false;
                result.errors.push(...typeValidation.errors);
                result.fieldErrors = { ...result.fieldErrors, ...typeValidation.fieldErrors };
            }

            // Remove password field if it exists but is not being updated
            if (data && !('password' in data)) {
                delete result.processedData.password;
            }

        } catch (error) {
            result.isValid = false;
            result.errors.push({
                type: 'VALIDATION_SYSTEM_ERROR',
                message: `Validation system error: ${error.message}`,
                path: 'system',
                code: 'INTERNAL_ERROR'
            });
        }

        return result;
    }

    /**
     * Validate nested relations in data
     * @param {Object} data - Data containing potential nested relations
     * @param {Object} model - Prisma model instance
     * @param {string} operation - Operation type ('create' or 'update')
     * @returns {Object} Validation result for nested relations
     */
    async validateNestedRelations(data, model, operation = 'create') {
        return await this._validateNestedRelations(data, model, operation);
    }

    /**
     * Execute custom validation function
     * @param {Function} validationFn - Custom validation function
     * @param {Object} data - Data to validate
     * @param {Object} req - Express request object
     * @param {string} operation - Operation type
     * @returns {Object} Custom validation result
     * @private
     */
    async _executeCustomValidation(validationFn, data, req, operation) {
        const result = {
            isValid: true,
            errors: [],
            fieldErrors: {}
        };

        try {
            const validationResult = await validationFn(data, req);

            if (typeof validationResult === 'boolean') {
                result.isValid = validationResult;
                if (!validationResult) {
                    result.errors.push({
                        type: 'CUSTOM_VALIDATION_FAILED',
                        message: 'Custom validation failed',
                        path: 'custom',
                        code: 'VALIDATION_ERROR'
                    });
                }
            } else if (typeof validationResult === 'object') {
                result.isValid = validationResult.isValid !== false;

                if (validationResult.message) {
                    result.errors.push({
                        type: 'CUSTOM_VALIDATION_FAILED',
                        message: validationResult.message,
                        path: 'custom',
                        code: 'VALIDATION_ERROR'
                    });
                }

                if (validationResult.errors && Array.isArray(validationResult.errors)) {
                    result.errors.push(...validationResult.errors.map(error => ({
                        type: 'CUSTOM_VALIDATION_ERROR',
                        message: error.message || error,
                        path: error.path || 'custom',
                        code: error.code || 'VALIDATION_ERROR'
                    })));
                }

                if (validationResult.fieldErrors) {
                    result.fieldErrors = validationResult.fieldErrors;
                }
            }
        } catch (error) {
            result.isValid = false;
            result.errors.push({
                type: 'CUSTOM_VALIDATION_SYSTEM_ERROR',
                message: `Custom validation system error: ${error.message}`,
                path: 'custom',
                code: 'INTERNAL_ERROR'
            });
        }

        return result;
    }

    /**
     * Validate database constraints
     * @param {string} operation - Operation type ('create' or 'update')
     * @param {Object} data - Data to validate
     * @param {Object} model - Prisma model instance
     * @param {string|number} id - Record ID (for updates)
     * @returns {Object} Constraint validation result
     * @private
     */
    async _validateConstraints(operation, data, model, id = null) {
        const result = {
            isValid: true,
            errors: [],
            fieldErrors: {}
        };

        try {
            const structure = await this.databaseAnalyzer.analyzeDatabaseStructure(model);

            if (!structure) {
                result.errors.push({
                    type: 'STRUCTURE_ANALYSIS_FAILED',
                    message: 'Unable to analyze database structure for validation',
                    path: 'system',
                    code: 'INTERNAL_ERROR'
                });
                result.isValid = false;
                return result;
            }

            // Required field validation (only for create operations)
            if (operation === 'create') {
                for (const field of structure.requiredFields) {
                    if (data[field] === undefined || data[field] === null || data[field] === '') {
                        result.isValid = false;
                        const error = {
                            type: 'REQUIRED_FIELD_MISSING',
                            message: `Required field '${field}' is missing or empty`,
                            path: field,
                            code: 'VALIDATION_ERROR'
                        };
                        result.errors.push(error);
                        result.fieldErrors[field] = error;
                    }
                }
            }

            // Unique constraint validation
            for (const uniqueField of structure.uniqueConstraints) {
                if (data[uniqueField] !== undefined) {
                    try {
                        const whereClause = { [uniqueField]: data[uniqueField] };

                        // For updates, exclude the current record
                        if (operation === 'update' && id) {
                            whereClause.NOT = { id: this._convertId(id) };
                        }

                        const existing = await model.findFirst({ where: whereClause });

                        if (existing) {
                            result.isValid = false;
                            const error = {
                                type: 'UNIQUE_CONSTRAINT_VIOLATION',
                                message: `Unique constraint violation on field '${uniqueField}' with value '${data[uniqueField]}'`,
                                path: uniqueField,
                                code: 'P2002'
                            };
                            result.errors.push(error);
                            result.fieldErrors[uniqueField] = error;
                        }
                    } catch (error) {
                        result.errors.push({
                            type: 'UNIQUE_CONSTRAINT_CHECK_ERROR',
                            message: `Error checking unique constraint for field '${uniqueField}': ${error.message}`,
                            path: uniqueField,
                            code: 'INTERNAL_ERROR'
                        });
                    }
                }
            }

            // Foreign key constraint validation
            for (const fk of structure.foreignKeys) {
                if (data[fk.field] !== undefined && data[fk.field] !== null) {
                    try {
                        const referencedModel = this.databaseAnalyzer.getReferencedModel(fk.referencedModel);
                        if (referencedModel) {
                            const exists = await referencedModel.findUnique({
                                where: { id: this._convertId(data[fk.field]) }
                            });

                            if (!exists) {
                                result.isValid = false;
                                const error = {
                                    type: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
                                    message: `Foreign key constraint violation: ${fk.field} references non-existent ${fk.referencedModel} with id '${data[fk.field]}'`,
                                    path: fk.field,
                                    code: 'P2003'
                                };
                                result.errors.push(error);
                                result.fieldErrors[fk.field] = error;
                            }
                        }
                    } catch (error) {
                        result.errors.push({
                            type: 'FOREIGN_KEY_CHECK_ERROR',
                            message: `Error checking foreign key constraint for ${fk.field}: ${error.message}`,
                            path: fk.field,
                            code: 'INTERNAL_ERROR'
                        });
                    }
                }
            }

        } catch (error) {
            result.isValid = false;
            result.errors.push({
                type: 'CONSTRAINT_VALIDATION_SYSTEM_ERROR',
                message: `Constraint validation system error: ${error.message}`,
                path: 'system',
                code: 'INTERNAL_ERROR'
            });
        }

        return result;
    }

    /**
     * Validate nested relations in data
     * @param {Object} data - Data containing potential nested relations
     * @param {Object} model - Prisma model instance
     * @param {string} operation - Operation type
     * @returns {Object} Nested relation validation result
     * @private
     */
    async _validateNestedRelations(data, model, operation) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            fieldErrors: {}
        };

        try {
            // First check for potential relation fields that have invalid types
            for (const [key, value] of Object.entries(data)) {
                // Skip known non-relation fields
                if (['id', 'createdAt', 'updatedAt', 'uploadedFiles'].includes(key)) {
                    continue;
                }

                // Check for fields that might be intended as relations but have wrong types
                // Only flag as invalid if it's a string and looks like it could be a relation name
                if (typeof value === 'string' && !key.toLowerCase().includes('id') &&
                    !key.toLowerCase().includes('email') && !key.toLowerCase().includes('name') &&
                    !key.toLowerCase().includes('password') && !key.toLowerCase().includes('code') &&
                    !key.toLowerCase().includes('first') && !key.toLowerCase().includes('last') &&
                    !key.toLowerCase().includes('title') && !key.toLowerCase().includes('content') &&
                    !key.toLowerCase().includes('bio') && !key.toLowerCase().includes('description') &&
                    !key.toLowerCase().includes('address') && !key.toLowerCase().includes('phone') &&
                    !key.toLowerCase().includes('url') && !key.toLowerCase().includes('date') &&
                    !key.toLowerCase().includes('time') && !key.toLowerCase().includes('status') &&
                    !key.toLowerCase().includes('type') && !key.toLowerCase().includes('category') &&
                    key.length > 3) { // Only check longer field names that might be relations
                    // This might be a bulk relation with invalid type
                    result.isValid = false;
                    result.errors.push({
                        type: 'INVALID_BULK_RELATION_DATA',
                        message: `Bulk relation '${key}' must be an array`,
                        path: key,
                        code: 'VALIDATION_ERROR'
                    });
                    result.fieldErrors[key] = [{
                        type: 'INVALID_BULK_RELATION_DATA',
                        message: `Bulk relation '${key}' must be an array`,
                        path: key,
                        code: 'VALIDATION_ERROR'
                    }];
                }
            }

            const { singleRelations, bulkRelations } = this._detectRelationTypes(data);

            // Validate single relations
            for (const [relationName, relationData] of Object.entries(singleRelations)) {
                const relationValidation = await this._validateSingleRelation(
                    relationName,
                    relationData,
                    model,
                    operation
                );

                if (!relationValidation.isValid) {
                    result.isValid = false;
                    result.errors.push(...relationValidation.errors);
                    result.fieldErrors[relationName] = relationValidation.errors;
                }
                result.warnings.push(...relationValidation.warnings);
            }

            // Validate bulk relations
            for (const [relationName, relationDataArray] of Object.entries(bulkRelations)) {
                const bulkValidation = await this._validateBulkRelation(
                    relationName,
                    relationDataArray,
                    model,
                    operation
                );

                if (!bulkValidation.isValid) {
                    result.isValid = false;
                    result.errors.push(...bulkValidation.errors);
                    result.fieldErrors[relationName] = bulkValidation.errors;
                }
                result.warnings.push(...bulkValidation.warnings);
            }

        } catch (error) {
            result.isValid = false;
            result.errors.push({
                type: 'NESTED_RELATION_VALIDATION_ERROR',
                message: `Nested relation validation error: ${error.message}`,
                path: 'relations',
                code: 'INTERNAL_ERROR'
            });
        }

        return result;
    }

    /**
     * Validate field types against expected schema
     * @param {Object} data - Data to validate
     * @param {Object} model - Prisma model instance
     * @param {string} operation - Operation type
     * @returns {Object} Field type validation result
     * @private
     */
    async _validateFieldTypes(data, model, operation) {
        const result = {
            isValid: true,
            errors: [],
            fieldErrors: {}
        };

        try {
            const structure = await this.databaseAnalyzer.analyzeDatabaseStructure(model);

            if (!structure) {
                return result; // Skip type validation if structure analysis fails
            }

            // Basic type validation for common field types
            for (const [fieldName, fieldValue] of Object.entries(data)) {
                if (fieldValue === null || fieldValue === undefined) {
                    continue; // Skip null/undefined values
                }

                // Skip relation fields (they're handled separately)
                if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
                    continue;
                }
                if (Array.isArray(fieldValue)) {
                    continue;
                }

                // Email validation
                if (fieldName.toLowerCase().includes('email') && typeof fieldValue === 'string') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(fieldValue)) {
                        result.isValid = false;
                        const error = {
                            type: 'INVALID_EMAIL_FORMAT',
                            message: `Invalid email format for field '${fieldName}'`,
                            path: fieldName,
                            code: 'VALIDATION_ERROR'
                        };
                        result.errors.push(error);
                        result.fieldErrors[fieldName] = error;
                    }
                }

                // String length validation for very long strings
                if (typeof fieldValue === 'string' && fieldValue.length > 10000) {
                    result.warnings.push({
                        type: 'LONG_STRING_WARNING',
                        message: `Field '${fieldName}' contains a very long string (${fieldValue.length} characters)`,
                        path: fieldName,
                        code: 'WARNING'
                    });
                }
            }

        } catch (error) {
            result.errors.push({
                type: 'FIELD_TYPE_VALIDATION_ERROR',
                message: `Field type validation error: ${error.message}`,
                path: 'types',
                code: 'INTERNAL_ERROR'
            });
        }

        return result;
    }

    /**
     * Validate a single relation
     * @param {string} relationName - Name of the relation
     * @param {Object} relationData - Relation data to validate
     * @param {Object} model - Parent model instance
     * @param {string} operation - Operation type
     * @returns {Object} Single relation validation result
     * @private
     */
    async _validateSingleRelation(relationName, relationData, model, operation) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        try {
            if (!relationData || typeof relationData !== 'object') {
                result.isValid = false;
                result.errors.push({
                    type: 'INVALID_RELATION_DATA',
                    message: `Invalid data for single relation '${relationName}'`,
                    path: `${relationName}`,
                    code: 'VALIDATION_ERROR'
                });
                return result;
            }

            // Try to get the related model for deeper validation
            const relatedModel = this.databaseAnalyzer.getReferencedModel(relationName);
            if (relatedModel) {
                // Recursively validate the nested relation data
                const nestedValidation = operation === 'create'
                    ? await this.validateCreateData(relationData, relatedModel)
                    : await this.validateUpdateData(relationData, relatedModel);

                if (!nestedValidation.isValid) {
                    result.isValid = false;
                    result.errors.push(...nestedValidation.errors.map(error => ({
                        ...error,
                        path: `${relationName}.${error.path}`
                    })));
                }
                result.warnings.push(...nestedValidation.warnings.map(warning => ({
                    ...warning,
                    path: `${relationName}.${warning.path}`
                })));
            } else {
                result.warnings.push({
                    type: 'RELATION_MODEL_NOT_FOUND',
                    message: `Could not find model for relation '${relationName}' - skipping deep validation`,
                    path: relationName,
                    code: 'WARNING'
                });
            }

        } catch (error) {
            result.errors.push({
                type: 'SINGLE_RELATION_VALIDATION_ERROR',
                message: `Single relation validation error for '${relationName}': ${error.message}`,
                path: relationName,
                code: 'INTERNAL_ERROR'
            });
        }

        return result;
    }

    /**
     * Validate a bulk relation (array of related objects)
     * @param {string} relationName - Name of the relation
     * @param {Array} relationDataArray - Array of relation data to validate
     * @param {Object} model - Parent model instance
     * @param {string} operation - Operation type
     * @returns {Object} Bulk relation validation result
     * @private
     */
    async _validateBulkRelation(relationName, relationDataArray, model, operation) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        try {
            if (!Array.isArray(relationDataArray)) {
                result.isValid = false;
                result.errors.push({
                    type: 'INVALID_BULK_RELATION_DATA',
                    message: `Bulk relation '${relationName}' must be an array`,
                    path: relationName,
                    code: 'VALIDATION_ERROR'
                });
                return result;
            }

            // Validate each item in the bulk relation
            for (let i = 0; i < relationDataArray.length; i++) {
                const itemData = relationDataArray[i];
                const itemPath = `${relationName}[${i}]`;

                if (!itemData || typeof itemData !== 'object') {
                    result.isValid = false;
                    result.errors.push({
                        type: 'INVALID_BULK_RELATION_ITEM',
                        message: `Invalid data for bulk relation item at ${itemPath}`,
                        path: itemPath,
                        code: 'VALIDATION_ERROR'
                    });
                    continue;
                }

                // Try to get the related model for deeper validation
                const relatedModel = this.databaseAnalyzer.getReferencedModel(relationName);
                if (relatedModel) {
                    const itemValidation = operation === 'create'
                        ? await this.validateCreateData(itemData, relatedModel)
                        : await this.validateUpdateData(itemData, relatedModel);

                    if (!itemValidation.isValid) {
                        result.isValid = false;
                        result.errors.push(...itemValidation.errors.map(error => ({
                            ...error,
                            path: `${itemPath}.${error.path}`
                        })));
                    }
                    result.warnings.push(...itemValidation.warnings.map(warning => ({
                        ...warning,
                        path: `${itemPath}.${warning.path}`
                    })));
                }
            }

            // Add warning about model not found only once per relation
            const relatedModel = this.databaseAnalyzer.getReferencedModel(relationName);
            if (!relatedModel) {
                result.warnings.push({
                    type: 'RELATION_MODEL_NOT_FOUND',
                    message: `Could not find model for relation '${relationName}' - skipping deep validation`,
                    path: relationName,
                    code: 'WARNING'
                });
            }

        } catch (error) {
            result.errors.push({
                type: 'BULK_RELATION_VALIDATION_ERROR',
                message: `Bulk relation validation error for '${relationName}': ${error.message}`,
                path: relationName,
                code: 'INTERNAL_ERROR'
            });
        }

        return result;
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
     * Format validation errors for API response
     * @param {Object} validationResult - Validation result object
     * @returns {Object} Formatted error response
     */
    formatValidationErrors(validationResult) {
        if (validationResult.isValid) {
            return null;
        }

        return {
            message: 'Validation failed',
            errors: validationResult.errors,
            fieldErrors: validationResult.fieldErrors,
            totalErrors: validationResult.errors.length,
            warnings: validationResult.warnings || []
        };
    }

    /**
     * Clear validation cache
     */
    clearCache() {
        this.validationCache.clear();
    }
}

module.exports = { ValidationManager };