const glob = require('glob');

class FileProcessor {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalSize: 0
    };
  }

  // THE KEY BREAKING CHANGE: Callback signature changes in glob 12.x
  async findFilesAsync(pattern) {
    console.log(`🔍 Searching for files matching: ${pattern}`);
    
    return new Promise((resolve, reject) => {
      // ❌ BREAKING CHANGE: In glob 7.x, callback is (err, files)
      // ❌ In glob 12.x, callback becomes (err, files, infos) - extra parameter!
      glob(pattern, (err, files) => {
        if (err) {
          console.error('❌ Error:', err.message);
          reject(err);
        } else {
          console.log(`✅ Found ${files.length} files:`, files);
          resolve(files);
        }
      });
    });
  }

  // For comparison: sync method (also has breaking changes but simpler)
  findFilesSync(pattern) {
    console.log(`🔍 Sync search for: ${pattern}`);
    try {
      // This still works in 12.x but with different default behavior
      const files = glob.sync(pattern);
      console.log(`✅ Sync found ${files.length} files:`, files);
      return files;
    } catch (error) {
      console.error('❌ Sync error:', error.message);
      return [];
    }
  }
}

async function main() {
  console.log('=== Glob API Breaking Change Demo ===');
  console.log('🚨 This demonstrates the callback signature change from glob 7.x → 12.x\n');

  const processor = new FileProcessor();
  
  console.log('📝 The Problem:');
  console.log('  • glob 7.x callback: (err, files)');  
  console.log('  • glob 12.x callback: (err, files, infos) ← Extra parameter!');
  console.log('  • Code expecting 2 params breaks with 3 params\n');

  // Demonstrate the breaking change
  console.log('--- Testing Current glob 7.x Behavior ---');
  try {
    const files = await processor.findFilesAsync('*.js');
    console.log(`📊 Results: Found ${files.length} JavaScript files\n`);
  } catch (error) {
    console.error('💥 Async search failed:', error.message);
  }

  // Show sync version for comparison
  console.log('--- Sync Version (less breaking changes) ---');
  const syncFiles = processor.findFilesSync('*.json');
  console.log(`📊 Sync Results: Found ${syncFiles.length} JSON files\n`);

  console.log('🔧 To Fix for glob 12.x:');
  console.log('  1. Update callback to handle 3 parameters: (err, files, infos)');
  console.log('  2. Or switch to glob.glob() promise-based API');
  console.log('  3. Or use glob.globSync() for synchronous calls');
  console.log('\n✅ Demo Complete - Ready to break on glob 12.x upgrade!');
}

// Run the application
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FileProcessor };