const test = require('node:test');
const assert = require('node:assert');
const { findJSFiles } = require('../index');

test('findJSFiles resolves js files via glob callback API', (t, done) => {
  findJSFiles((err, files) => {
    assert.ifError(err);
    assert.ok(Array.isArray(files), 'expected an array of files');
    assert.ok(files.includes('index.js'), 'expected index.js to be found');
    done();
  });
});
