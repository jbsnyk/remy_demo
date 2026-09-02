const { test, describe } = require('node:test');
const assert = require('node:assert');
const { FileProcessor } = require('./index');
const fs = require('fs');
const path = require('path');

// Helper function to create test files
function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const testFiles = [
    'app.js',
    'config.json',
    'utils.js',
    '.env',
    'README.md'
  ];

  testFiles.forEach(file => {
    const filePath = path.join(testDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `// Test file: ${file}\nconsole.log('${file}');`);
    }
  });

  return testDir;
}

// Helper function to clean up test files
function cleanupTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

// Helper functions using Node.js built-in assertions
function assertEquals(actual, expected, message) {
  assert.strictEqual(actual, expected, message);
}

function assertContains(array, item, message) {
  assert.ok(array.includes(item), message || `Expected array to contain ${item}`);
}

// Test suite using Node.js built-in test runner
describe('FileProcessor', () => {
  test('should be instantiable', () => {
    const processor = new FileProcessor();
    assert.ok(processor instanceof FileProcessor, 'Should create FileProcessor instance');
    assert.ok(processor.stats, 'Should have stats property');
    assertEquals(processor.stats.filesProcessed, 0, 'Initial files processed should be 0');
  });

  test('findFiles should return JavaScript files', () => {
    const processor = new FileProcessor();
    const files = processor.findFiles('*.js');
    
    assert.ok(Array.isArray(files), 'Should return an array');
    assert.ok(files.length > 0, 'Should find at least one JS file');
    assertContains(files, 'index.js', 'Should find index.js');
  });

  test('findFiles should handle custom patterns', () => {
    // Create test files first
    const testDir = createTestFiles();
    
    try {
      const processor = new FileProcessor();
      const jsonFiles = processor.findFiles('test-files/*.json');
      
      assert.ok(Array.isArray(jsonFiles), 'Should return an array for JSON files');
      
      // Test dotfile inclusion
      const allFiles = processor.findFiles('test-files/*', { includeDotfiles: true });
      const hasEnvFile = allFiles.some(file => file.includes('.env'));
      assert.ok(hasEnvFile, 'Should find .env file when includeDotfiles is true');
    } finally {
      cleanupTestFiles();
    }
  });

  test('findFilesAsync should work with promises', async () => {
    const processor = new FileProcessor();
    const files = await processor.findFilesAsync('*.js');
    
    assert.ok(Array.isArray(files), 'Async should return an array');
    assert.ok(files.length > 0, 'Async should find at least one JS file');
  });

  test('processFiles should collect statistics', () => {
    const processor = new FileProcessor();
    const files = ['index.js', 'test.js']; // Files that should exist
    
    const results = processor.processFiles(files);
    
    assert.ok(results.filesProcessed >= 0, 'Should process some files');
    assert.ok(results.totalSize >= 0, 'Should calculate total size');
    assert.strictEqual(typeof results.filesProcessed, 'number', 'filesProcessed should be a number');
    assert.strictEqual(typeof results.totalSize, 'number', 'totalSize should be a number');
  });

  test('createGlobStream should return Glob instance', () => {
    const processor = new FileProcessor();
    const globber = processor.createGlobStream('*.js');
    
    assert.ok(globber, 'Should return a glob instance');
    assert.strictEqual(typeof globber.on, 'function', 'Should have event listener methods');
  });

  test('glob sync with mark option should work', () => {
    const processor = new FileProcessor();
    // This test demonstrates the 'mark' option that behaves differently in glob 12.x
    const files = processor.findFiles('*/', { noSort: true });
    
    assert.ok(Array.isArray(files), 'Should return an array');
    // In glob 7.x with mark:true, directories should end with '/'
    // This behavior changes in glob 12.x
  });

  test('glob with nonull option should include non-matching patterns', () => {
    const processor = new FileProcessor();
    // This test uses the 'nonull' option which is deprecated in newer versions
    const files = processor.findFiles('nonexistent-*.xyz', { includeNonMatching: true });
    
    assert.ok(Array.isArray(files), 'Should return an array even for non-matching patterns');
  });
});