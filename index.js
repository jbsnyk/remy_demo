const glob = require('glob');

// Uses glob's legacy Node-style callback API: glob(pattern, options, callback).
// This callback interface was removed in glob v9+ (promise-only), so upgrading
// glob without updating this code will break at runtime.
function findJSFiles(cb) {
  glob('*.js', { nodir: true }, cb);
}

if (require.main === module) {
  findJSFiles((err, files) => {
    if (err) {
      console.error('Error finding files:', err);
      process.exitCode = 1;
      return;
    }
    console.log('JS files found:', files);
  });
}

module.exports = { findJSFiles };
