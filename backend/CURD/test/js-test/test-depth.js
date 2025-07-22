const { SelectValidator } = require('../../Curd_op/SelectValidator');

// Simple mock for testing depth
class SimpleMockAnalyzer {
  constructor() {
    this._sampleCache = {};
  }

  async cacheSampleRecord(model) {
    this._sampleCache['TestModel'] = { id: 1, level1: 1, level2: 1, level3: 1, level4: 1, level5: 1, level6: 1 };
  }

  async analyzeDatabaseStructure(model) {
    return {
      modelName: 'TestModel',
      fields: ['id', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6'],
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
    return model?.name || 'TestModel';
  }
}

async function testDepth() {
  console.log('🧪 Testing SelectValidator depth detection...\n');

  const mockAnalyzer = new SimpleMockAnalyzer();
  const selectValidator = new SelectValidator(mockAnalyzer, {
    maxSelectDepth: 3 // Set to 3 for easier testing
  });

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
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  try {
    const result = await selectValidator.validateSelectObject(deepSelect, { name: 'TestModel' });
    console.log('Result:', result);
    console.log('Should have thrown error for depth > 3');
  } catch (error) {
    console.log('✅ Correctly caught depth error:', error.message);
  }
}

testDepth().catch(console.error);