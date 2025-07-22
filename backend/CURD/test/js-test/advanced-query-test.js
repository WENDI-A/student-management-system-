/**
 * Test advanced queries matching ADVANCED_SEARCH.md examples
 */
const { QueryProcessor } = require('../../Curd_op/QueryProcessor');
const { DatabaseAnalyzer } = require('../../Curd_op/DatabaseAnalyzer');

// Enhanced mock for testing complex nested queries
class AdvancedMockAnalyzer {
  constructor() {
    this._sampleCache = {};
  }

  async cacheSampleRecord(model) {
    const modelName = this.getModelName(model);
    if (!this._sampleCache[modelName]) {
      // Mock different model structures
      if (modelName === 'Student') {
        this._sampleCache[modelName] = {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          classId: 1
        };
      } else if (modelName === 'Class') {
        this._sampleCache[modelName] = {
          id: 1,
          name: 'Grade 10',
          section: 'A'
        };
      } else if (modelName === 'Grade') {
        this._sampleCache[modelName] = {
          id: 1,
          studentId: 1,
          assessmentId: 1,
          value: 95
        };
      }
    }
  }

  async analyzeDatabaseStructure(model) {
    const modelName = this.getModelName(model);
    
    // Mock different model structures based on schema
    if (modelName === 'Student') {
      return {
        modelName: 'Student',
        fields: ['id', 'firstName', 'lastName', 'email', 'classId', 'createdAt', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6'],
        hasRelations: true,
        foreignKeys: [
          { field: 'classId', referencedModel: 'Class', relationName: 'class' },
          { field: 'level1', referencedModel: 'Level1', relationName: 'level1' },
          { field: 'level2', referencedModel: 'Level2', relationName: 'level2' },
          { field: 'level3', referencedModel: 'Level3', relationName: 'level3' },
          { field: 'level4', referencedModel: 'Level4', relationName: 'level4' },
          { field: 'level5', referencedModel: 'Level5', relationName: 'level5' },
          { field: 'level6', referencedModel: 'Level6', relationName: 'level6' }
        ],
        requiredFields: ['firstName', 'lastName', 'email'],
        optionalFields: ['classId', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6']
      };
    } else if (modelName === 'Class') {
      return {
        modelName: 'Class',
        fields: ['id', 'name', 'section', 'createdAt'],
        hasRelations: false,
        foreignKeys: [],
        requiredFields: ['name'],
        optionalFields: ['section']
      };
    } else if (modelName === 'Grade') {
      return {
        modelName: 'Grade',
        fields: ['id', 'studentId', 'assessmentId', 'value', 'createdAt'],
        hasRelations: true,
        foreignKeys: [
          { field: 'studentId', referencedModel: 'Student', relationName: 'student' },
          { field: 'assessmentId', referencedModel: 'Assessment', relationName: 'assessment' }
        ],
        requiredFields: ['studentId', 'assessmentId', 'value'],
        optionalFields: []
      };
    }
    
    return {
      modelName,
      fields: ['id', 'createdAt', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6'],
      hasRelations: true,
      foreignKeys: [
        { field: 'level1', referencedModel: 'Level1', relationName: 'level1' },
        { field: 'level2', referencedModel: 'Level2', relationName: 'level2' },
        { field: 'level3', referencedModel: 'Level3', relationName: 'level3' },
        { field: 'level4', referencedModel: 'Level4', relationName: 'level4' },
        { field: 'level5', referencedModel: 'Level5', relationName: 'level5' },
        { field: 'level6', referencedModel: 'Level6', relationName: 'level6' }
      ],
      requiredFields: [],
      optionalFields: ['level1', 'level2', 'level3', 'level4', 'level5', 'level6']
    };
  }

  getModelName(model) {
    return model.name || 'Unknown';
  }
}

async function testAdvancedQueries() {
  console.log('🧪 Testing Advanced Query Processing (ADVANCED_SEARCH.md examples)...\n');

  const mockAnalyzer = new AdvancedMockAnalyzer();
  const queryProcessor = new QueryProcessor(mockAnalyzer, {
    excludeFields: ['password'],
    maxSelectDepth: 5
  });

  // Test 1: Complex nested select from ADVANCED_SEARCH.md
  console.log('Test 1: Complex nested select (Student with Class, Grades, Attendances)');
  try {
    const mockModel = { name: 'Student' };
    const complexSelect = {
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
          assessmentId: true,
          value: true
        }
      },
      attendances: {
        select: {
          id: true,
          courseId: true,
          date: true,
          status: true
        }
      }
    };

    const query = {
      select: JSON.stringify(complexSelect)
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ Complex nested select processed successfully');
    console.log('   Select structure:', JSON.stringify(result.select, null, 2));
  } catch (error) {
    console.log('❌ Complex nested select failed:', error.message);
  }

  // Test 2: Complex filter with nested relations
  console.log('\nTest 2: Complex filter with nested relations');
  try {
    const mockModel = { name: 'Student' };
    const complexFilter = {
      enrollments: {
        some: {
          course: {
            teachers: {
              some: {
                teacherId: "abc123"
              }
            }
          }
        }
      }
    };

    const query = {
      filter: JSON.stringify(complexFilter),
      select: JSON.stringify({
        id: true,
        firstName: true,
        lastName: true,
        grades: true
      })
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ Complex filter processed successfully');
    console.log('   Where clause:', JSON.stringify(result.where, null, 2));
    console.log('   Select clause:', JSON.stringify(result.select, null, 2));
  } catch (error) {
    console.log('❌ Complex filter failed:', error.message);
  }

  // Test 3: Combining filter, select, orderBy, and pagination
  console.log('\nTest 3: Combined complex query');
  try {
    const mockModel = { name: 'Student' };
    const query = {
      filter: JSON.stringify({
        grades: {
          some: {
            value: { gt: 90 }
          }
        }
      }),
      select: JSON.stringify({
        id: true,
        firstName: true,
        lastName: true,
        grades: {
          select: {
            value: true,
            assessmentId: true
          }
        }
      }),
      orderBy: JSON.stringify({
        lastName: 'asc',
        firstName: 'asc'
      }),
      skip: '0',
      take: '10'
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ Combined complex query processed successfully');
    console.log('   Full query:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Combined complex query failed:', error.message);
  }

  // Test 4: Deep nesting validation
  console.log('\nTest 4: Deep nesting depth limit');
  try {
    const mockModel = { name: 'Student' };
    const deepSelect = {
      id: true,
      level1: {
        select: {
          id: true,
          level2: {
            select: {
              id: true,
              level3: {
                select: {
                  id: true,
                  level4: {
                    select: {
                      id: true,
                      level5: {
                        select: {
                          id: true,
                          level6: {
                            select: {
                              id: true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    console.log('   Testing with maxSelectDepth: 5, actual depth: 6');
    const query = {
      select: JSON.stringify(deepSelect)
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('❌ Deep nesting should have been rejected');
    console.log('   Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✅ Deep nesting correctly rejected:', error.message);
  }

  // Test 5: Invalid field filtering
  console.log('\nTest 5: Invalid field filtering');
  try {
    const mockModel = { name: 'Student' };
    const query = {
      select: JSON.stringify({
        id: true,
        firstName: true,
        invalidField: true,
        anotherInvalidField: true,
        email: true
      }),
      filter: JSON.stringify({
        firstName: 'John',
        invalidFilterField: 'test'
      }),
      orderBy: JSON.stringify({
        firstName: 'asc',
        invalidOrderField: 'desc'
      })
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ Invalid fields filtered successfully');
    console.log('   Cleaned select:', JSON.stringify(result.select, null, 2));
    console.log('   Cleaned where:', JSON.stringify(result.where, null, 2));
    console.log('   Cleaned orderBy:', JSON.stringify(result.orderBy, null, 2));
  } catch (error) {
    console.log('❌ Invalid field filtering failed:', error.message);
  }

  console.log('\n🏁 Advanced query tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAdvancedQueries().catch(console.error);
}

module.exports = { testAdvancedQueries };