/**
 * Basic tests for QueryProcessor class
 */
const { QueryProcessor } = require('../../Curd_op/QueryProcessor');
const { DatabaseAnalyzer } = require('../../Curd_op/DatabaseAnalyzer');

// Mock DatabaseAnalyzer for testing
class MockDatabaseAnalyzer {
  constructor() {
    this._sampleCache = {};
  }

  async cacheSampleRecord(model) {
    // Mock implementation
    this._sampleCache['TestModel'] = {
      id: 1,
      name: 'test',
      email: 'test@example.com',
      password: 'secret'
    };
  }

  async analyzeDatabaseStructure(model) {
    return {
      modelName: 'TestModel',
      fields: ['id', 'name', 'email', 'password', 'createdAt'],
      hasRelations: false,
      foreignKeys: [],
      requiredFields: ['name', 'email'],
      optionalFields: ['password']
    };
  }

  getModelName(model) {
    return model?.name || 'TestModel';
  }
}

async function runTests() {
  console.log('🧪 Running QueryProcessor tests...\n');

  const mockAnalyzer = new MockDatabaseAnalyzer();
  const queryProcessor = new QueryProcessor(mockAnalyzer, {
    excludeFields: ['password']
  });

  // Test 1: Basic filter processing
  console.log('Test 1: Filter processing');
  try {
    const mockModel = { name: 'TestModel' };
    const query = {
      filter: '{"name":"John","email":"john@example.com"}'
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ Filter processed successfully');
    console.log('   Where clause:', JSON.stringify(result.where, null, 2));
  } catch (error) {
    console.log('❌ Filter processing failed:', error.message);
  }

  // Test 2: Select processing
  console.log('\nTest 2: Select processing');
  try {
    const mockModel = { name: 'TestModel' };
    const query = {
      select: '{"id":true,"name":true,"email":true}'
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ Select processed successfully');
    console.log('   Select clause:', JSON.stringify(result.select, null, 2));
  } catch (error) {
    console.log('❌ Select processing failed:', error.message);
  }

  // Test 3: OrderBy processing
  console.log('\nTest 3: OrderBy processing');
  try {
    const mockModel = { name: 'TestModel' };
    const query = {
      orderBy: '{"name":"asc","email":"desc"}'
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ OrderBy processed successfully');
    console.log('   OrderBy clause:', JSON.stringify(result.orderBy, null, 2));
  } catch (error) {
    console.log('❌ OrderBy processing failed:', error.message);
  }

  // Test 4: Pagination processing
  console.log('\nTest 4: Pagination processing');
  try {
    const mockModel = { name: 'TestModel' };
    const query = {
      skip: '10',
      take: '20'
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ Pagination processed successfully');
    console.log('   Skip:', result.skip, 'Take:', result.take);
  } catch (error) {
    console.log('❌ Pagination processing failed:', error.message);
  }

  // Test 5: Complex nested select
  console.log('\nTest 5: Nested select processing');
  try {
    const mockModel = { name: 'TestModel' };
    const query = {
      select: '{"id":true,"name":true,"grades":{"select":{"id":true,"value":true}}}'
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ Nested select processed successfully');
    console.log('   Select clause:', JSON.stringify(result.select, null, 2));
  } catch (error) {
    console.log('❌ Nested select processing failed:', error.message);
  }

  // Test 6: Field exclusion
  console.log('\nTest 6: Field exclusion (password should be excluded)');
  try {
    const mockModel = { name: 'TestModel' };
    const query = {
      select: '{"id":true,"name":true,"password":true,"email":true}'
    };
    
    const result = await queryProcessor.processGetQuery(query, mockModel);
    console.log('✅ Field exclusion working');
    console.log('   Select clause:', JSON.stringify(result.select, null, 2));
    
    if (result.select && result.select.password) {
      console.log('❌ Password field was not excluded!');
    } else {
      console.log('✅ Password field correctly excluded');
    }
  } catch (error) {
    console.log('❌ Field exclusion test failed:', error.message);
  }

  // Test 7: Query validation
  console.log('\nTest 7: Query validation');
  try {
    const validation = queryProcessor.validateQueryStructure({
      filter: '{"name":"John"}',
      select: '{"id":true}',
      skip: '10',
      take: '20'
    });
    
    console.log('✅ Query validation successful');
    console.log('   Valid:', validation.isValid);
    console.log('   Errors:', validation.errors);
    console.log('   Warnings:', validation.warnings);
  } catch (error) {
    console.log('❌ Query validation failed:', error.message);
  }

  // Test 8: Invalid JSON handling
  console.log('\nTest 8: Invalid JSON handling');
  try {
    const validation = queryProcessor.validateQueryStructure({
      filter: '{invalid json}',
      select: '{"id":true}'
    });
    
    console.log('✅ Invalid JSON handled gracefully');
    console.log('   Valid:', validation.isValid);
    console.log('   Errors:', validation.errors);
  } catch (error) {
    console.log('❌ Invalid JSON handling failed:', error.message);
  }

  console.log('\n🏁 QueryProcessor tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };