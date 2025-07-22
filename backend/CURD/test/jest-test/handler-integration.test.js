/**
 * Handler Integration Tests
 * Tests for CreateHandler, UpdateHandler, and DeleteHandler with ValidationManager
 */

const { CreateHandler } = require('./CreateHandler');
const { UpdateHandler } = require('./UpdateHandler');
const { DeleteHandler } = require('./DeleteHandler');
const { DatabaseAnalyzer } = require('../../Curd_op/DatabaseAnalyzer');

// Mock Api_Response
class MockApiResponse {
  success(method, data) {
    return {
      statusCode: method === 'post' ? 201 : 200,
      body: {
        success: true,
        data: data,
        message: `${method.toUpperCase()} operation successful`
      }
    };
  }

  error(method, data, message, statusCode = 500) {
    return {
      statusCode: statusCode,
      body: {
        success: false,
        error: message,
        data: data
      }
    };
  }

  setResponseHeaders(res, response) {
    // Mock implementation
  }
}

// Mock DatabaseAnalyzer
class MockDatabaseAnalyzer {
  constructor() {
    this.mockStructure = {
      modelName: 'Student',
      tableName: 'student',
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
    return null;
  }

  async checkConstraints(operation, data, model) {
    return { isValid: true, violations: [] };
  }

  async handleCascadeOperations(operation, data, model, id) {
    return { success: true, results: [] };
  }
}

// Mock Prisma model
class MockStudentModel {
  static async create({ data }) {
    return {
      id: 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static async update({ where, data }) {
    return {
      id: where.id,
      ...data,
      updatedAt: new Date()
    };
  }

  static async delete({ where }) {
    return {
      id: where.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com'
    };
  }

  static async findFirst(query) {
    // Only return existing record for the specific test email
    if (query.where && query.where.email === 'existing@test.com') {
      return { id: 2, email: 'existing@test.com' };
    }
    // For all other emails, return null (no existing record)
    return null;
  }

  static async findUnique(query) {
    if (query.where && query.where.id === 1) {
      return { id: 1, email: 'test@test.com' };
    }
    return null;
  }
}

describe('Handler Integration Tests', () => {
  let createHandler;
  let updateHandler;
  let deleteHandler;
  let mockApiResponse;
  let mockDatabaseAnalyzer;
  let mockModel;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockApiResponse = new MockApiResponse();
    mockDatabaseAnalyzer = new MockDatabaseAnalyzer();
    mockModel = MockStudentModel;
    
    // Reset the mock methods to their default behavior
    MockStudentModel.findFirst = jest.fn().mockImplementation(async (query) => {
      // Only return existing record for the specific test email
      if (query.where && query.where.email === 'existing@test.com') {
        return { id: 2, email: 'existing@test.com' };
      }
      // For all other emails, return null (no existing record)
      return null;
    });

    MockStudentModel.findUnique = jest.fn().mockImplementation(async (query) => {
      if (query.where && query.where.id === 1) {
        return { id: 1, email: 'test@test.com' };
      }
      return null;
    });
    
    createHandler = new CreateHandler(mockApiResponse, mockDatabaseAnalyzer);
    updateHandler = new UpdateHandler(mockApiResponse, mockDatabaseAnalyzer);
    deleteHandler = new DeleteHandler(mockApiResponse, mockDatabaseAnalyzer);

    mockReq = {
      body: {},
      params: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('CreateHandler Integration', () => {
    test('should successfully create a record with valid data', async () => {
      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123'
      };

      const routeOptions = {};

      await createHandler.handleCreate(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com'
          })
        })
      );
    });

    test('should fail validation for missing required fields', async () => {
      mockReq.body = {
        firstName: 'John'
        // Missing lastName and email
      };

      const routeOptions = {};

      await createHandler.handleCreate(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: 'REQUIRED_FIELD_MISSING',
              path: 'lastName'
            }),
            expect.objectContaining({
              type: 'REQUIRED_FIELD_MISSING',
              path: 'email'
            })
          ])
        })
      );
    });

    test('should fail validation for unique constraint violation', async () => {
      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@test.com' // This email already exists
      };

      const routeOptions = {};

      await createHandler.handleCreate(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: 'UNIQUE_CONSTRAINT_VIOLATION',
              path: 'email',
              code: 'P2002'
            })
          ])
        })
      );
    });

    test('should execute custom validation if provided', async () => {
      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com'
      };

      const customValidation = jest.fn().mockResolvedValue({
        isValid: false,
        message: 'Custom validation failed'
      });

      const routeOptions = {
        validation: {
          create: customValidation
        }
      };

      await createHandler.handleCreate(mockReq, mockRes, mockModel, routeOptions);

      expect(customValidation).toHaveBeenCalledWith(mockReq.body, mockReq);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should execute beforeActions and afterActions hooks', async () => {
      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com'
      };

      const beforeAction = jest.fn().mockResolvedValue({
        ...mockReq.body,
        middleName: 'Modified'
      });

      const afterAction = jest.fn().mockResolvedValue({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        middleName: 'Modified',
        processed: true
      });

      const routeOptions = {
        beforeActions: {
          create: beforeAction
        },
        afterActions: {
          create: afterAction
        }
      };

      await createHandler.handleCreate(mockReq, mockRes, mockModel, routeOptions);

      expect(beforeAction).toHaveBeenCalledWith(mockReq.body, mockReq);
      expect(afterAction).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('UpdateHandler Integration', () => {
    test('should successfully update a record with valid data', async () => {
      mockReq.params.id = '1';
      mockReq.body = {
        firstName: 'Jane',
        email: 'jane@test.com'
      };

      const routeOptions = {};

      await updateHandler.handleUpdate(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            firstName: 'Jane',
            email: 'jane@test.com'
          })
        })
      );
    });

    test('should fail validation for missing ID', async () => {
      mockReq.params = {}; // No ID provided
      mockReq.body = {
        firstName: 'Jane'
      };

      const routeOptions = {};

      await updateHandler.handleUpdate(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: 'MISSING_ID',
              path: 'id'
            })
          ])
        })
      );
    });

    test('should handle unique constraint validation for updates', async () => {
      mockReq.params.id = '1';
      mockReq.body = {
        email: 'existing@test.com'
      };

      // Mock findFirst to return a different record for unique check
      MockStudentModel.findFirst = jest.fn().mockResolvedValue({
        id: 2,
        email: 'existing@test.com'
      });

      const routeOptions = {};

      await updateHandler.handleUpdate(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: 'UNIQUE_CONSTRAINT_VIOLATION',
              path: 'email'
            })
          ])
        })
      );
    });
  });

  describe('DeleteHandler Integration', () => {
    test('should successfully delete a record', async () => {
      mockReq.params.id = '1';

      const routeOptions = {};

      await deleteHandler.handleDelete(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1
          })
        })
      );
    });

    test('should fail validation for missing ID', async () => {
      const routeOptions = {};

      await deleteHandler.handleDelete(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: 'MISSING_ID',
              path: 'id'
            })
          ])
        })
      );
    });

    test('should fail validation for non-existent record', async () => {
      mockReq.params.id = '999';

      // Mock findUnique to return null for non-existent record
      MockStudentModel.findUnique = jest.fn().mockResolvedValue(null);

      const routeOptions = {};

      await deleteHandler.handleDelete(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: 'RECORD_NOT_FOUND',
              path: 'id',
              code: 'P2025'
            })
          ])
        })
      );
    });

    test('should execute beforeActions and afterActions hooks', async () => {
      mockReq.params.id = '1';

      // Ensure the record exists for validation
      MockStudentModel.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com'
      });

      const beforeAction = jest.fn().mockResolvedValue(undefined);
      const afterAction = jest.fn().mockResolvedValue({
        id: 1,
        deleted: true
      });

      const routeOptions = {
        beforeActions: {
          destroy: beforeAction
        },
        afterActions: {
          destroy: afterAction
        }
      };

      await deleteHandler.handleDelete(mockReq, mockRes, mockModel, routeOptions);

      expect(beforeAction).toHaveBeenCalledWith('1', mockReq);
      expect(afterAction).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Nested Relations Validation', () => {
    test('should validate nested single relations', async () => {
      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.relations@test.com',
        userProfile: {
          bio: 'Test bio'
        }
      };

      const routeOptions = {};

      await createHandler.handleCreate(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should validate nested bulk relations', async () => {
      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.bulk@test.com',
        userPosts: [
          { title: 'Post 1', content: 'Content 1' },
          { title: 'Post 2', content: 'Content 2' }
        ]
      };

      const routeOptions = {};

      await createHandler.handleCreate(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should fail validation for invalid bulk relation data', async () => {
      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        posts: 'invalid' // Should be array
      };

      const routeOptions = {};

      await createHandler.handleCreate(mockReq, mockRes, mockModel, routeOptions);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: 'INVALID_BULK_RELATION_DATA',
              path: 'posts'
            })
          ])
        })
      );
    });
  });
});