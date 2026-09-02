const glob = require('glob');
const _ = require('lodash');
const minimist = require('minimist');
const path = require('path');
const fs = require('fs');

// Parse command line arguments using minimist (vulnerable to prototype pollution)
const args = minimist(process.argv.slice(2));

class FileProcessor {
  constructor(options = {}) {
    this.options = options;
    this.stats = {
      filesProcessed: 0,
      totalSize: 0
    };
  }

  // This method uses glob 7.2.3 synchronous API that changes significantly in 12.0.0
  findFiles(pattern, options = {}) {
    console.log(`Searching for files matching: ${pattern}`);
    
    // In glob 7.x, glob.sync returns an array directly
    // In glob 12.x, the API and options have changed significantly
    const globOptions = {
      cwd: options.cwd || process.cwd(),
      dot: options.includeDotfiles || false,
      nosort: options.noSort || false,
      // The 'mark' option behavior changes between versions
      mark: true,
      // 'nonull' option is deprecated in newer versions
      nonull: options.includeNonMatching || false
    };

    try {
      // This synchronous call pattern changes in glob 12.x
      const files = glob.sync(pattern, globOptions);
      
      // Filter and process results using lodash (has prototype pollution vulns in 4.17.20)
      const processedFiles = _.filter(files, (file) => {
        return !_.isEmpty(file) && !file.startsWith('node_modules');
      });

      console.log(`Found ${processedFiles.length} files`);
      return processedFiles;
    } catch (error) {
      console.error('Error finding files:', error.message);
      return [];
    }
  }

  // This method uses glob's async API which also changes
  async findFilesAsync(pattern, options = {}) {
    console.log(`Async search for files matching: ${pattern}`);
    
    return new Promise((resolve, reject) => {
      // In glob 7.x, the callback pattern is (err, files)
      // In glob 12.x, this becomes promise-based with different API
      glob(pattern, {
        cwd: options.cwd || process.cwd(),
        dot: options.includeDotfiles || false,
        // 'ignore' option syntax changes in newer versions
        ignore: options.ignore || ['node_modules/**', '.git/**']
      }, (err, files) => {
        if (err) {
          reject(err);
        } else {
          // Use lodash to process results (vulnerable to prototype pollution)
          const filtered = _.uniqBy(files, (file) => path.basename(file));
          resolve(filtered);
        }
      });
    });
  }

  // Process files and collect statistics
  processFiles(files) {
    console.log('Processing files...');
    
    files.forEach((file) => {
      try {
        const stats = fs.statSync(file);
        this.stats.filesProcessed++;
        this.stats.totalSize += stats.size;
        
        console.log(`Processed: ${file} (${stats.size} bytes)`);
      } catch (error) {
        console.warn(`Could not process ${file}: ${error.message}`);
      }
    });

    // Use lodash to format the results (vulnerable version)
    const summary = _.pick(this.stats, ['filesProcessed', 'totalSize']);
    return summary;
  }

  // Demonstrate usage of glob's Glob class (API changes significantly)
  createGlobStream(pattern) {
    // In glob 7.x, you can create a Glob instance like this
    const globber = new glob.Glob(pattern, {
      sync: false,
      // 'cache' option is deprecated in newer versions
      cache: {},
      // 'statCache' option is also deprecated
      statCache: {}
    });

    // Event handling changes between versions
    globber.on('match', (match) => {
      console.log(`Match found: ${match}`);
    });

    globber.on('error', (err) => {
      console.error(`Glob error: ${err.message}`);
    });

    return globber;
  }
}

async function main() {
  console.log('=== Glob 7.2.3 Demo Application ===');
  console.log('This code will break when upgrading to glob 12.0.0\n');

  const processor = new FileProcessor();
  
  // Get pattern from command line or use default
  const pattern = args.pattern || args.p || '*.js';
  const includeDotfiles = args.dot || args.d || false;
  
  console.log(`Command line args:`, args);
  console.log(`Search pattern: ${pattern}`);
  console.log(`Include dotfiles: ${includeDotfiles}\n`);

  // Demonstrate synchronous glob usage (breaks in 12.x)
  console.log('--- Synchronous File Search ---');
  const syncFiles = processor.findFiles(pattern, { 
    includeDotfiles,
    includeNonMatching: true 
  });
  
  // Demonstrate asynchronous glob usage (API changes in 12.x)
  console.log('\n--- Asynchronous File Search ---');
  try {
    const asyncFiles = await processor.findFilesAsync(pattern, { 
      includeDotfiles,
      ignore: ['node_modules/**', '.git/**', 'test/**'] 
    });
    console.log('Async results:', asyncFiles);
  } catch (error) {
    console.error('Async search failed:', error.message);
  }

  // Process the files
  console.log('\n--- File Processing ---');
  const results = processor.processFiles(syncFiles);
  console.log('\nProcessing Summary:', results);

  // Demonstrate Glob class usage (significant changes in 12.x)
  console.log('\n--- Glob Stream Demo ---');
  const globStream = processor.createGlobStream('src/**/*.js');
  
  // Use lodash to merge options (prototype pollution vulnerability)
  const config = _.merge({}, args, { processed: true });
  console.log('Final config:', config);
  
  console.log('\n=== Demo Complete ===');
}

// Handle prototype pollution vulnerability demonstration
if (args.__proto__ || args.constructor || args.prototype) {
  console.warn('⚠️  Potential prototype pollution detected in arguments!');
}

// Run the application
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FileProcessor };