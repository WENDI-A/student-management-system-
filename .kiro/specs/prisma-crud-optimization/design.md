# Design Document

## Overview

This design focuses on optimizing the PrismaCrudRouter while maintaining all existing functionality and enhancing support for complex nested select queries. The optimization will improve code structure, performance, and maintainability through modular refactoring and enhanced query processing capabilities.

## Architecture

### Current Architecture Issues
- Large monolithic route method with complex nested logic
- Inconsistent error handling patterns
- Limited validation for nested select parameters
- Performance concerns with field filtering and validation
- Code duplication in query processing

### Proposed Architecture
The refactored architecture will follow a modular approach with clear separation of concerns:

```
PrismaCrudRouter
├── QueryProcessor (new)
│   ├── SelectValidator
│   ├── FilterProcessor
│   └── RelationHandler
├── RouteHandler (refactored)
│   ├── GetHandler
│   ├── CreateHandler
│   ├── UpdateHandler
│   └── DeleteHandler
├── ValidationManager (enhanced)
└── ErrorHandler (enhanced)
```

## Components and Interfaces

### 1. QueryProcessor Class
Handles all query parameter processing and validation.

```javascript
class QueryProcessor {
  constructor(databaseAnalyzer, options) {
    this.databaseAnalyzer = databaseAnalyzer;
    this.options = options;
  }

  async processGetQuery(query, model) {
    // Process filter, select, orderBy, pagination
  }

  validateNestedSelect(selectObj, model) {
    // Validate nested select structure
  }

  buildPrismaQuery(processedQuery) {
    // Build final Prisma query object
  }
}
```

### 2. SelectValidator Class
Validates and processes nested select parameters.

```javascript
class SelectValidator {
  constructor(databaseAnalyzer) {
    this.databaseAnalyzer = databaseAnalyzer;
  }

  async validateSelectObject(selectObj, model, depth = 0) {
    // Recursive validation of nested select
  }

  filterValidFields(selectObj, validFields) {
    // Filter out invalid fields from select
  }

  buildNestedInclude(selectObj, model) {
    // Convert select to Prisma include/select format
  }
}
```

### 3. RouteHandler Classes
Separate handlers for each HTTP method to reduce complexity.

```javascript
class GetHandler {
  constructor(queryProcessor, apiResponse, options) {
    this.queryProcessor = queryProcessor;
    this.apiResponse = apiResponse;
    this.options = options;
  }

  async handleGetAll(req, res, model, routeOptions) {
    // Handle GET / requests
  }

  async handleGetById(req, res, model, routeOptions) {
    // Handle GET /:id requests
  }
}
```

### 4. Enhanced ValidationManager
Improved validation with better error reporting.

```javascript
class ValidationManager {
  constructor(databaseAnalyzer) {
    this.databaseAnalyzer = databaseAnalyzer;
  }

  async validateCreateData(data, model, validation) {
    // Enhanced create validation
  }

  async validateUpdateData(data, model, validation) {
    // Enhanced update validation
  }

  validateNestedRelations(data, model) {
    // Validate nested relation data
  }
}
```

## Data Models

### Query Processing Flow
```javascript
// Input query structure
{
  filter: { /* Prisma where clause */ },
  select: {
    id: true,
    firstName: true,
    class: {
      select: {
        id: true,
        name: true
      }
    },
    grades: {
      select: {
        id: true,
        value: true
      }
    }
  },
  orderBy: { /* Prisma orderBy clause */ },
  skip: 0,
  take: 10
}

// Processed query structure
{
  where: { /* validated filter */ },
  select: { /* validated nested select */ },
  orderBy: { /* validated orderBy */ },
  skip: 0,
  take: 10
}
```

### Nested Select Validation Result
```javascript
{
  isValid: true,
  validatedSelect: { /* cleaned select object */ },
  errors: [],
  warnings: [],
  depth: 2,
  relationCount: 3
}
```

## Error Handling

### Enhanced Error Categories
1. **Validation Errors** - Invalid field names, malformed queries
2. **Constraint Errors** - Database constraint violations
3. **Relation Errors** - Invalid nested relations
4. **Performance Errors** - Query too complex or deep
5. **System Errors** - Database connection, internal errors

### Error Response Structure
```javascript
{
  error: true,
  type: 'VALIDATION_ERROR',
  message: 'Invalid field in nested select',
  details: {
    field: 'invalidField',
    path: 'student.class.invalidField',
    validFields: ['id', 'name', 'section']
  },
  statusCode: 400
}
```

## Testing Strategy

### Unit Tests
- QueryProcessor validation logic
- SelectValidator nested select processing
- RouteHandler individual method logic
- ValidationManager constraint checking

### Integration Tests
- Complete CRUD operations with nested select
- Complex query combinations
- Error handling scenarios
- Performance with large datasets

### Performance Tests
- Query processing time with deep nesting
- Memory usage with large result sets
- Database query optimization
- Concurrent request handling

## Implementation Plan

### Phase 1: Core Refactoring
1. Extract QueryProcessor from main route method
2. Create SelectValidator for nested select handling
3. Implement enhanced error handling
4. Add comprehensive validation

### Phase 2: Route Handler Separation
1. Create individual handler classes for each HTTP method
2. Implement consistent error handling across handlers
3. Add method-specific optimizations
4. Enhance middleware composition

### Phase 3: Performance Optimization
1. Implement query result caching
2. Add query complexity limits
3. Optimize field validation performance
4. Add query performance monitoring

### Phase 4: Testing and Documentation
1. Comprehensive test suite
2. Performance benchmarking
3. API documentation updates
4. Migration guide for existing users

## Security Considerations

### Input Validation
- Sanitize all query parameters
- Validate nested select depth limits
- Prevent SQL injection through parameter validation
- Rate limiting for complex queries

### Field Access Control
- Respect excludeFields configuration
- Validate relation access permissions
- Prevent unauthorized field exposure
- Audit field access patterns

## Performance Optimizations

### Query Optimization
- Lazy loading for deep relations
- Query result caching
- Batch processing for bulk operations
- Connection pooling optimization

### Memory Management
- Streaming for large result sets
- Garbage collection optimization
- Memory usage monitoring
- Result set size limits

## Backward Compatibility

### API Compatibility
- All existing API endpoints remain unchanged
- Existing query parameter formats supported
- Response format consistency maintained
- Gradual deprecation of legacy features

### Configuration Compatibility
- All existing options supported
- New options with sensible defaults
- Migration path for deprecated options
- Clear upgrade documentation