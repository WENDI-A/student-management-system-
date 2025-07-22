/**
 * Comprehensive tests for SelectValidator class
 */
const { SelectValidator } = require('../../Curd_op/SelectValidator');
const { DatabaseAnalyzer } = require('../../Curd_op/DatabaseAnalyzer');

// Mock DatabaseAnalyzer for testing
class MockDatabaseAnalyzer {
  constructor() {
    this._sampleCache = {};
    this.models = {
      Student: { name: 'Student' },
      Class: { name: 'Class' },
      Grade: { name: 'Grade' },
      Attendance: { name: 'Attendance' }
    };
  }

  async cacheSampleRecord(model) {
    const modelName = this.getModelName(model);
    this._sampleCache[modelName] = this.getSampleData(modelName);
  }

  getSampleData(modelName) {
    const samples = {
      Student: {
        id: 'student1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'secret',
        classId: 'class1'
      },
      Class: {
        id: 'class1',
        name: 'Grade 10',
        section: 'A'
      },
      Grade: {
        id: 'grade1',
        studentId: 'student1',
        assessmentId: 'assessment1',
        value: 95
      },
      Attendance: {
        id: 'attendance1',
        studentId: 'student1',
        courseId: 'course1',
        date: '2024-01-01',
        status: 'PRESENT'
      }
    };
    return samples[modelName] || {};
  }

  async analyzeDatabaseStructure(model) {
    const modelName = this.getModelName(model);
    
    const structures = {
      Student: {
        modelName: 'Student',
        fields: ['id', 'firstName', 'lastName', 'email', 'password', 'classId'],
        hasRelations: true,
        foreignKeys: [
          { field: 'classId', referencedModel: 'Class', relationName: 'class' }
        ],
        requiredFields: ['firstName', 'lastName', 'email'],
        optionalFields: ['password'],
        uniqueConstraints: ['email']
      },
      Class: {
        modelName: 'Class',
        fields: ['id', 'name', 'section'],
        hasRelations: false,
        foreignKeys: [],
        requiredFields: ['name'],
        optionalFields: ['section'],
        uniqueConstraints: []
      },
      Grade: {
        modelName: 'Grade',
        fields: ['id', 'studentId', 'assessmentId', 'value'],
        hasRelations: true,
        foreignKeys: [
          { field: 'studentId', referencedModel: 'Student', relationName: 'student' },
          { field: 'assessmentId', referencedModel: 'Assessment', relationName: 'assessment' }
        ],
        requiredFields: ['studentId', 'assessmentId', 'value'],
        optionalFields: [],
        uniqueConstraints: []
      },
      Attendance: {
        modelName: 'Attendance',
        fields: ['id', 'studentId', 'courseId', 'date', 'status'],
        hasRelations: true,
        foreignKeys: [
          { field: 'studentId', referencedModel: 'Student', relationName: 'student' },
          { field: 'courseId', referencedModel: 'Course', relationName: 'course' }
        ],
        requiredFields: ['studentId', 'courseId', 'date', 'status'],
        optionalFields: [],
        uniqueConstraints: []
      }
    };

    return structures[modelName] || {
      modelName,
      fields: [],
      hasRelations: false,
      foreignKeys: [],
      requiredFields: [],
      optionalFields: [],
      uniqueConstraints: []
    };
  }

  getModelName(model) {
    if (!model) return 'Unknown';
    return model.name || 'Unknown';
  }
}

async function runTests() {
  console.log('🧪 Running SelectValidator tests...\n');

  const mockAnalyzer = new MockDatabaseAnalyzer();
  const selectValidator = new SelectValidator(mockAnalyzer, {
    excludeFields: ['password'],
    maxSelectDepth: 3,
    maxComplexityScore: 50
  });

  // Test 1: Basic field validation
  console.log('Test 1: Basic field validation');
  try {
    const mockModel = { name: 'Student' };
    const selectObj = {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    };
    
    const result = await selectValidator.validateSelectObject(selectObj, mockModel);
    console.log('✅ Basic validation successful');
    console.log('   Valid:', result.isValid);
    console.log('   Validated select:', JSON.stringify(result.validatedSelect, null, 2));
    console.log('   Errors:', result.errors);
    console.log('   Warnings:', result.warnings);
  } catch (error) {
    console.log('❌ Basic validation failed:', error.message);
  }

  // Test 2: Field exclusion (password should be excluded)
  console.log('\nTest 2: Field exclusion');
  try {
    const mockModel = { name: 'Student' };
    const selectObj = {
      id: true,
      firstName: true,
      password: true,
      email: true
    };
    
    const result = await selectValidator.validateSelectObject(selectObj, mockModel);
    console.log('✅ Field exclusion test completed');
    console.log('   Valid:', result.isValid);
    console.log('   Validated select:', JSON.stringify(result.validatedSelect, null, 2));
    console.log('   Warnings:', result.warnings);
    
    if (result.validatedSelect.password) {
      console.log('❌ Password field was not excluded!');
    } else {
      console.log('✅ Password field correctly excluded');
    }
  } catch (error) {
    console.log('❌ Field exclusion test failed:', error.message);
  }

  // Test 3: Unknown field handling
  console.log('\nTest 3: Unknown field handling');
  try {
    const mockModel = { name: 'Student' };
    const selectObj = {
      id: true,
      firstName: true,
      unknownField: true,
      anotherUnknownField: true
    };
    
    const result = await selectValidator.validateSelectObject(selectObj, mockModel);
    console.log('✅ Unknown field handling completed');
    console.log('   Valid:', result.isValid);
    console.log('   Validated select:', JSON.stringify(result.validatedSelect, null, 2));
    console.log('   Warnings:', result.warnings);
  } catch (error) {
    console.log('❌ Unknown field handling failed:', error.message);
  }

  // Test 4: Nested select validation
  console.log('\nTest 4: Nested select validation');
  try {
    const mockModel = { name: 'Student' };
    const selectObj = {
      id: true,
      firstName: true,
      lastName: true,
      class: {
        select: {
          id: true,
          name: true,
          section: true
        }
      }
    };
    
    const result = await selectValidator.validateSelectObject(selectObj, mockModel);
    console.log('✅ Nested select validation completed');
    console.log('   Valid:', result.isValid);
    console.log('   Validated select:', JSON.stringify(result.validatedSelect, null, 2));
    console.log('   Metadata:', result.metadata);
  } catch (error) {
    console.log('❌ Nested select validation failed:', error.message);
  }

  // Test 5: Deep nested select (multiple levels)
  console.log('\nTest 5: Deep nested select validation');
  try {
    const mockModel = { name: 'Student' };
    const selectObj = {
      id: true,
      firstName: true,
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
      }
    };
    
    const result = await selectValidator.validateSelectObject(selectObj, mockModel);
    console.log('✅ Deep nested select validation completed');
    console.log('   Valid:', result.isValid);
    console.log('   Depth:', result.metadata.depth);
    console.log('   Complexity score:', result.metadata.complexityScore);
    console.log('   Relation count:', result.metadata.relationCount);
  } catch (error) {
    console.log('❌ Deep nested select validation failed:', error.message);
  }

  // Test 6: Depth limit validation
  console.log('\nTest 6: Depth limit validation');
  try {
    const mockModel = { name: 'Student' };
    const selectObj = {
      id: true,
      level1: {
        select: {
          level2: {
            select: {
              level3: {
                select: {
                  level4: {
                    select: {
                      id: true // This should exceed depth limit
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    const result = await selectValidator.validateSelectObject(selectObj, mockModel);
    console.log('✅ Depth limit validation completed');
    console.log('   Valid:', result.isValid);
    console.log('   Errors:', result.errors);
    console.log('   Max depth reached:', result.metadata.depth);
  } catch (error) {
    console.log('❌ Depth limit validation failed:', error.message);
  }

  // Test 7: Complex query with multiple relations
  console.log('\nTest 7: Complex query validation');
  try {
    const mockModel = { name: 'Student' };
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
      },
      attendances: {
        select: {
          id: true,
          date: true,
          status: true,
          courseId: true
        }
      }
    };
    
    const result = await selectValidator.validateSelectObject(selectObj, mockModel);
    console.log('✅ Complex query validation completed');
    console.log('   Valid:', result.isValid);
    console.log('   Field count:', result.metadata.fieldCount);
    console.log('   Relation count:', result.metadata.relationCount);
    console.log('   Complexity score:', result.metadata.complexityScore);
    console.log('   Warnings:', result.warnings);
  } catch (error) {
    console.log('❌ Complex query validation failed:', error.message);
  }

  // Test 8: Direct nested object (no explicit select)
  console.log('\nTest 8: Direct nested object validation');
  try {
    const mockModel = { name: 'Student' };
    const selectObj = {
      id: true,
      firstName: true,
      class: {
        id: true,
        name: true
      }
    };
    
    const result = await selectValidator.validateSelectObject(selectObj, mockModel);
    console.log('✅ Direct nested object validation completed');
    console.log('   Valid:', result.isValid);
    console.log('   Validated select:', JSON.stringify(result.validatedSelect, null, 2));
  } catch (error) {
    console.log('❌ Direct nested object validation failed:', error.message);
  }

  // Test 9: Invalid field value types
  console.log('\nTest 9: Invalid field value types');
  try {
    const mockModel = { name: 'Student' };
    const selectObj = {
      id: true,
      firstName: 'invalid_string_value',
      lastName: 123,
      email: null
    };
    
    const result = await selectValidator.validateSelectObject(selectObj, mockModel);
    console.log('✅ Invalid field value types handled');
    console.log('   Valid:', result.isValid);
    console.log('   Validated select:', JSON.stringify(result.validatedSelect, null, 2));
    console.log('   Warnings:', result.warnings);
  } catch (error) {
    console.log('❌ Invalid field value types handling failed:', error.message);
  }

  // Test 10: Complexity score calculation
  console.log('\nTest 10: Complexity score calculation');
  try {
    const simpleSelect = { id: true, name: true };
    const complexSelect = {
      id: true,
      name: true,
      relation1: {
        select: {
          id: true,
          nested: {
            select: {
              id: true,
              deepNested: {
                select: { id: true }
              }
            }
          }
        }
      }
    };
    
    const simpleScore = selectValidator.calculateComplexityScore(simpleSelect);
    const complexScore = selectValidator.calculateComplexityScore(complexSelect);
    
    console.log('✅ Complexity score calculation completed');
    console.log('   Simple select score:', simpleScore);
    console.log('   Complex select score:', complexScore);
    console.log('   Complex score is higher:', complexScore > simpleScore ? '✅' : '❌');
  } catch (error) {
    console.log('❌ Complexity score calculation failed:', error.message);
  }

  // Test 11: Depth validation utility
  console.log('\nTest 11: Depth validation utility');
  try {
    const shallowSelect = { id: true, name: true };
    const deepSelect = {
      level1: {
        select: {
          level2: {
            select: {
              level3: {
                select: { id: true }
              }
            }
          }
        }
      }
    };
    
    const shallowResult = selectValidator.validateSelectDepth(shallowSelect, 3);
    const deepResult = selectValidator.validateSelectDepth(deepSelect, 2); // Should fail
    
    console.log('✅ Depth validation utility completed');
    console.log('   Shallow select valid:', shallowResult.isValid);
    console.log('   Shallow max depth:', shallowResult.maxDepthReached);
    console.log('   Deep select valid:', deepResult.isValid);
    console.log('   Deep select error:', deepResult.error);
  } catch (error) {
    console.log('❌ Depth validation utility failed:', error.message);
  }

  // Test 12: Field filtering utility
  console.log('\nTest 12: Field filtering utility');
  try {
    const selectObj = {
      id: true,
      validField: true,
      invalidField: true,
      nested: {
        select: {
          validNested: true,
          invalidNested: true
        }
      }
    };
    
    const validFields = ['id', 'validField', 'validNested', 'nested'];
    const filtered = selectValidator.filterValidFields(selectObj, validFields);
    
    console.log('✅ Field filtering utility completed');
    console.log('   Filtered select:', JSON.stringify(filtered, null, 2));
    console.log('   Invalid fields removed:', !filtered.invalidField && !filtered.nested?.select?.invalidNested ? '✅' : '❌');
  } catch (error) {
    console.log('❌ Field filtering utility failed:', error.message);
  }

  console.log('\n🏁 SelectValidator tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };