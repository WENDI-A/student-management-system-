# SelectValidator

The SelectValidator is a comprehensive validation system for nested select queries in the PrismaCrudRouter. It provides robust validation, field filtering, depth limiting, and complexity checks for complex nested select operations.

## Features

- **Recursive Validation**: Validates nested select structures at any depth
- **Field Validation**: Validates fields against database schema
- **Depth Limiting**: Prevents excessively deep nested queries
- **Complexity Checks**: Monitors and limits query complexity
- **Field Exclusion**: Automatically excludes sensitive fields (e.g., passwords)
- **Relation Validation**: Validates nested relation selections
- **Performance Optimization**: Caches model information for better performance
- **Comprehensive Error Reporting**: Provides detailed error messages with field paths

## Usage

### Basic Usage

```javascript
const { SelectValidator } = require('./SelectValidator');
const { DatabaseAnalyzer } = require('./DatabaseAnalyzer');

const databaseAnalyzer = new DatabaseAnalyzer();
const selectValidator = new SelectValidator(databaseAnalyzer, {
  excludeFields: ['password', 'secret'],
  maxSelectDepth: 5,
  maxComplexityScore: 100
});

// Validate a select object
const selectObj = {
  id: true,
  firstName: true,
  lastName: true,
  class: {
    select: {
      id: true,
      name: true
    }
  }
};

const result = await selectValidator.validateSelectObject(selectObj, model);
console.log('Valid:', result.isValid);
console.log('Validated select:', result.validatedSelect);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

### Configuration Options

```javascript
const options = {
  // Maximum nesting depth allowed (default: 5)
  maxSelectDepth: 5,
  
  // Maximum complexity score allowed (default: 100)
  maxComplexityScore: 100,
  
  // Maximum fields per level (default: 50)
  maxFieldsPerLevel: 50,
  
  // Fields to exclude from selection (default: ['password'])
  excludeFields: ['password', 'secret', 'token'],
  
  // Allow unknown fields (default: false)
  allowUnknownFields: false
};

const selectValidator = new SelectValidator(databaseAnalyzer, options);
```

## Validation Result Structure

The `validateSelectObject` method returns a comprehensive result object:

```javascript
{
  isValid: boolean,           // Whether the select object is valid
  validatedSelect: object,    // Cleaned and validated select object
  errors: string[],          // Array of error messages
  warnings: string[],        // Array of warning messages
  metadata: {
    depth: number,           // Maximum depth reached
    complexityScore: number, // Calculated complexity score
    fieldCount: number,      // Total number of fields
    relationCount: number    // Number of relations included
  }
}
```

## Supported Select Formats

### Boolean Field Selection

```javascript
{
  id: true,
  firstName: true,
  lastName: false  // Explicitly exclude
}
```

### Nested Select with Explicit Select

```javascript
{
  id: true,
  firstName: true,
  class: {
    select: {
      id: true,
      name: true,
      section: true
    }
  }
}
```

### Direct Nested Object

```javascript
{
  id: true,
  firstName: true,
  class: {
    id: true,
    name: true
  }
}
```

### Complex Nested Relations

```javascript
{
  id: true,
  firstName: true,
  lastName: true,
  class: {
    select: {
      id: true,
      name: true,
      section: true
    }
  },
  grades: {
    select: {
      id: true,
      value: true,
      assessment: {
        select: {
          id: true,
          title: true
        }
      }
    }
  },
  attendances: {
    select: {
      id: true,
      date: true,
      status: true
    }
  }
}
```

## Validation Features

### Field Exclusion

Automatically excludes sensitive fields:

```javascript
// Input
{
  id: true,
  firstName: true,
  password: true,  // Will be excluded
  email: true
}

// Output
{
  id: true,
  firstName: true,
  email: true
}
// Warning: "Field 'password' is excluded and will be skipped"
```

### Unknown Field Handling

Filters out unknown fields with warnings:

```javascript
// Input
{
  id: true,
  firstName: true,
  unknownField: true,  // Will be filtered out
  email: true
}

// Output
{
  id: true,
  firstName: true,
  email: true
}
// Warning: "Unknown field 'unknownField' will be skipped"
```

### Depth Limiting

Prevents excessively deep nesting:

```javascript
// With maxSelectDepth: 3
{
  level1: {
    select: {
      level2: {
        select: {
          level3: {
            select: {
              level4: true  // Error: exceeds depth limit
            }
          }
        }
      }
    }
  }
}
// Error: "Select nesting too deep at path 'level1.level2.level3.level4' (max: 3)"
```

### Complexity Scoring

Monitors query complexity to prevent performance issues:

- Base score: number of fields × (depth + 1)
- Relations add +5 to complexity
- Nested objects multiply complexity by depth

## Utility Methods

### Field Filtering

```javascript
const filtered = selectValidator.filterValidFields(selectObj, validFields);
```

### Depth Validation

```javascript
const depthResult = selectValidator.validateSelectDepth(selectObj, maxDepth);
console.log('Valid:', depthResult.isValid);
console.log('Max depth reached:', depthResult.maxDepthReached);
```

### Complexity Calculation

```javascript
const score = selectValidator.calculateComplexityScore(selectObj);
console.log('Complexity score:', score);
```

### Prisma Include Building

```javascript
const prismaInclude = await selectValidator.buildNestedInclude(selectObj, model);
```

## Integration with QueryProcessor

The SelectValidator is automatically integrated with the QueryProcessor:

```javascript
const { QueryProcessor } = require('./QueryProcessor');
const { DatabaseAnalyzer } = require('./DatabaseAnalyzer');

const databaseAnalyzer = new DatabaseAnalyzer();
const queryProcessor = new ueryProcessor(databaseAnalyzer, {
  excludeFields: ['password'],
  maxSelectDepth: 5
});

// SelectValidator is automatically used for select validation
const result = await queryProcessor.processGetQuery(query, model);
```

## Error Handling

The SelectValidator provides comprehensive error handling:

### Validation Errors
- Field validation failures
- Depth limit violations
- Complexity limit violations
- Invalid field value types

### Warnings
- Excluded fields
- Unknown fields
- Performance warnings
- Field count warnings

## Performance Considerations

- **Caching**: Model information is cached for better performance
- **Lazy Loading**: Related model information is loaded on demand
- **Complexity Limits**: Prevents resource-intensive queries
- **Field Limits**: Limits number of fields per level

## Best Practices

1. **Set Appropriate Limits**: Configure depth and complexity limits based on your use case
2. **Use Field Exclusion**: Always exclude sensitive fields like passwords
3. **Monitor Warnings**: Pay attention to warnings for potential issues
4. **Cache Model Info**: The validator automatically caches model information
5. **Handle Errors Gracefully**: Always check validation results before using

## Testing

Run the comprehensive test suite:

```bash
node backend/CURD/Curd_op/SelectValidator.test.js
```

The test suite covers:
- Basic field validation
- Field exclusion
- Unknown field handling
- Nested select validation
- Deep nesting validation
- Depth limit validation
- Complex query validation
- Invalid field value types
- Complexity score calculation
- Utility method testing

## Examples

### Student with Class and Grades

```javascript
const selectObj = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  class: {
    select: {
      id: true,
      name: true,
      section: true
    }
  },
  grades: {
    select: {
      id: true,
      value: true,
      assessmentId: true
    }
  }
};

const result = await selectValidator.validateSelectObject(selectObj, studentModel);
```

### Complex Multi-Level Relations

```javascript
const selectObj = {
  id: true,
  firstName: true,
  enrollments: {
    select: {
      id: true,
      course: {
        select: {
          id: true,
          name: true,
          teachers: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  }
};
```

This comprehensive validation system ensures that your nested select queries are safe, performant, and correctly structured while providing detailed feedback for debugging and optimization.