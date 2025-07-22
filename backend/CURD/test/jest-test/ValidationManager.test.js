/**
 * ValidationManager Tests
 * Tests for enhanced validation system with comprehensive error reporting
 */

const { ValidationManager } = require('../../Curd_op/ValidationManager');

// Mock DatabaseAnalyzer
class MockDatabaseAnalyzer {
  constructor() {
    this.mockStructure = {
      modelName: 'TestModel',
      tableName: 'testmodel',
      fields: [],
      relations: [],
      constraints: [],
      indexes: [],
      hasRelations: false,
      foreignKeys: [],
      uniqueConstraints: ['email'],
      requiredFields: ['firstName', 'lastName', 'email'],
      optionalFields: ['middleName'],
      computedFields: [],
      cascadeDelete: [],
      cascadeUpdate: []
    };
  }

  async analyzeDatabaseStructure(model) {
    return this.mockStructure;
  }

  getReferencedModel(modelName) {
    return null; // Mock implementation
  }

  async checkConstraints(operation, data, model) {
    return { isValid: true, violations: [] };
  }
}

// Mock Prisma model
class MockModel {
  static async findFirst(query) {
    if (query.where && query.where.email === 'existing@test.com') {
      return { id: 1, email: 'existing@test.com' };
    }
    return null;
  }

  static async findUnique(query) {
    if (query.where && query.where.id === 1) {
      return { id: 1, email: 'test@test.com' };
    }
    return null;
  }
}

describe('ValidationManager', () => {
  let validationManager;
  let mockDatabaseAnalyzer;
  let mockModel;

  beforeEach(() => {
    mockDatabaseAnalyzer = new MockDatabaseAnalyzer();
    validationManager = new ValidationManager(mockDatabaseAnalyzer);
    mockModel = MockModel;
  });

  describe('validateCreateData', () => {
    test('should validate valid create data successfully', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com'
      };

      const result = await validationManager.validateCreateData(data, mockModel);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.processedData).toEqual(data);
    });

    test('should fail validation for missing required fields', async () => {
      const data = {
        firstName: 'John'
        // Missing lastName and email
      };

      const result = await validationManager.validateCreateData(data, mockModel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].type).toBe('REQUIRED_FIELD_MISSING');
      expect(result.errors[0].path).toBe('lastName');
      expect(result.errors[1].type).toBe('REQUIRED_FIELD_MISSING');
      expect(result.errors[1].path).toBe('email');
    });

    test('should fail validation for unique constraint violation', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@test.com' // This email already exists in mock
      };

      const result = await validationManager.validateCreateData(data, mockModel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('UNIQUE_CONSTRAINT_VIOLATION');
      expect(result.errors[0].path).toBe('email');
      expect(result.errors[0].code).toBe('P2002');
    });

    test('should fail validation for invalid email format', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      const result = await validationManager.validateCreateData(data, mockModel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('INVALID_EMAIL_FORMAT');
      expect(result.errors[0].path).toBe('email');
    });

    test('should fail validation for invalid data type', async () => {
      const data = null;

      const result = await validationManager.validateCreateData(data, mockModel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('INVALID_DATA_TYPE');
      expect(result.errors[0].path).toBe('root');
    });
  });

  describe('validateUpdateData', () => {
    test('should validate valid update data successfully', async () => {
      const data = {
        firstName: 'Jane',
        email: 'jane@test.com'
      };

      const result = await validationManager.validateUpdateData(data, mockModel, null, null, 1);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.processedData).toEqual(data);
    });

    test('should fail validation for missing ID', async () => {
      const data = {
        firstName: 'Jane'
      };

      const result = await validationManager.validateUpdateData(data, mockModel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('MISSING_ID');
      expect(result.errors[0].path).toBe('id');
    });
  });

  describe('validateNestedRelations', () => {
    test('should validate single relations', async () => {
      const data = {
        firstName: 'John',
        profile: {
          bio: 'Test bio'
        }
      };

      const result = await validationManager.validateNestedRelations(data, mockModel, 'create');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1); // Warning about model not found
      expect(result.warnings[0].type).toBe('RELATION_MODEL_NOT_FOUND');
    });

    test('should validate bulk relations', async () => {
      const data = {
        firstName: 'John',
        posts: [
          { title: 'Post 1' },
          { title: 'Post 2' }
        ]
      };

      const result = await validationManager.validateNestedRelations(data, mockModel, 'create');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1); // Warning about model not found for posts relation
      expect(result.warnings[0].type).toBe('RELATION_MODEL_NOT_FOUND');
    });

    test('should fail validation for invalid bulk relation data', async () => {
      const data = {
        firstName: 'John',
        posts: 'invalid' // Should be array
      };

      const result = await validationManager.validateNestedRelations(data, mockModel, 'create');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('INVALID_BULK_RELATION_DATA');
      expect(result.errors[0].path).toBe('posts');
    });
  });

  describe('formatValidationErrors', () => {
    test('should return null for valid results', () => {
      const validResult = {
        isValid: true,
        errors: [],
        warnings: [],
        fieldErrors: {}
      };

      const formatted = validationManager.formatValidationErrors(validResult);

      expect(formatted).toBeNull();
    });

    test('should format validation errors correctly', () => {
      const invalidResult = {
        isValid: false,
        errors: [
          { type: 'TEST_ERROR', message: 'Test error', path: 'field1' }
        ],
        warnings: [
          { type: 'TEST_WARNING', message: 'Test warning', path: 'field2' }
        ],
        fieldErrors: {
          field1: { type: 'TEST_ERROR', message: 'Test error' }
        }
      };

      const formatted = validationManager.formatValidationErrors(invalidResult);

      expect(formatted).toEqual({
        message: 'Validation failed',
        errors: invalidResult.errors,
        fieldErrors: invalidResult.fieldErrors,
        totalErrors: 1,
        warnings: invalidResult.warnings
      });
    });
  });

  describe('_detectRelationTypes', () => {
    test('should detect single and bulk relations correctly', () => {
      const data = {
        firstName: 'John',
        profile: { bio: 'Test' }, // Single relation
        posts: [{ title: 'Post 1' }], // Bulk relation
        id: 1, // Should be ignored
        createdAt: new Date(), // Should be ignored
        uploadedFiles: [] // Should be ignored
      };

      const { singleRelations, bulkRelations } = validationManager._detectRelationTypes(data);

      expect(Object.keys(singleRelations)).toEqual(['profile']);
      expect(Object.keys(bulkRelations)).toEqual(['posts']);
    });
  });

  describe('_convertId', () => {
    test('should convert string numbers to numbers', () => {
      expect(validationManager._convertId('123')).toBe(123);
    });

    test('should keep string IDs as strings', () => {
      expect(validationManager._convertId('abc123')).toBe('abc123');
    });

    test('should keep number IDs as numbers', () => {
      expect(validationManager._convertId(123)).toBe(123);
    });
  });

  describe('clearCache', () => {
    test('should clear validation cache', () => {
      validationManager.validationCache.set('test', 'value');
      expect(validationManager.validationCache.size).toBe(1);

      validationManager.clearCache();
      expect(validationManager.validationCache.size).toBe(0);
    });
  });
});