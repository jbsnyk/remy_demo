const { test, describe } = require('node:test');
const assert = require('node:assert');
const { FileProcessor } = require('./index');

// Test suite focused on the glob callback breaking change
describe('Glob 7.x → 12.x Breaking Change Demo', () => {
  test('FileProcessor should be instantiable', () => {
    const processor = new FileProcessor();
    assert.ok(processor instanceof FileProcessor, 'Should create FileProcessor instance');
    assert.ok(processor.stats, 'Should have stats property');
    assert.strictEqual(processor.stats.filesProcessed, 0, 'Initial files processed should be 0');
  });

  test('findFilesAsync demonstrates the callback breaking change', async () => {
    const processor = new FileProcessor();
    
    // This works in glob 7.x but will break in 12.x
    // because the callback signature changes from (err, files) to (err, files, infos)
    const files = await processor.findFilesAsync('*.js');
    
    assert.ok(Array.isArray(files), 'Should return an array');
    assert.ok(files.length > 0, 'Should find JavaScript files');
    assert.ok(files.includes('index.js'), 'Should find index.js');
    assert.ok(files.includes('test.js'), 'Should find test.js');
  });

  test('findFilesSync shows less breaking changes', () => {
    const processor = new FileProcessor();
    
    // Sync version has fewer breaking changes in 12.x
    const files = processor.findFilesSync('*.json');
    
    assert.ok(Array.isArray(files), 'Should return an array');
    assert.ok(files.includes('package.json'), 'Should find package.json');
  });

  test('async callback handles current glob 7.x signature', async () => {
    const processor = new FileProcessor();
    
    // Test that our current implementation works with 2-parameter callback
    // In glob 12.x, this will receive a 3rd parameter (infos) which our code ignores
    const files = await processor.findFilesAsync('*.md');
    
    assert.ok(Array.isArray(files), 'Should return an array for markdown files');
    // May or may not find .md files, but should not crash
  });
});