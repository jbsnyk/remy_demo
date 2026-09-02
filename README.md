# Glob 7.2.3 Demo - Breaking Changes & Security Issues

This project demonstrates code that works with `glob 7.2.3` but breaks when upgrading to `glob 12.0.0`, along with other packages containing known vulnerabilities.

## 📦 Vulnerable Dependencies

### 1. glob 7.2.3 → 12.0.0 (Major Breaking Changes)

**Breaking Changes:**
- **Synchronous API**: `glob.sync()` return behavior and options changed
- **Async API**: Callback-based pattern replaced with Promise-based API
- **Glob Class**: Constructor options and event handling significantly changed  
- **Deprecated Options**: `nonull`, `cache`, `statCache`, `mark` options removed or changed
- **Import/Export**: Module system changes (ESM vs CommonJS)

### 2. lodash 4.17.20 (Prototype Pollution - CVE-2020-8203)

**Vulnerability:**
- Prototype pollution in `zipObjectDeep` function
- Allows attackers to modify object prototypes
- Can lead to denial of service or remote code execution

### 3. minimist 1.2.5 (Prototype Pollution - CVE-2020-7598)  

**Vulnerability:**
- Prototype pollution via command line arguments
- Allows modification of Object.prototype
- Can be exploited through malicious command line inputs

## 🚨 Breaking Changes When Upgrading to Glob 12.x

### 1. Synchronous API Changes
```javascript
// ❌ Breaks in glob 12.x
const files = glob.sync(pattern, { 
  nonull: true,    // Option removed
  cache: {},       // Option removed  
  statCache: {}    // Option removed
});

// ✅ Works in glob 12.x
const { globSync } = require('glob');
const files = globSync(pattern, {
  // New option structure
  dot: true,
  ignore: ['node_modules/**']
});
```

### 2. Async API Changes  
```javascript  
// ❌ Breaks in glob 12.x - Callback pattern
glob(pattern, options, (err, files) => {
  // Handle results
});

// ✅ Works in glob 12.x - Promise pattern
const { glob } = require('glob');
const files = await glob(pattern, options);
```

### 3. Glob Class Changes
```javascript
// ❌ Breaks in glob 12.x
const globber = new glob.Glob(pattern, {
  cache: {},        // Removed
  statCache: {},    // Removed  
  sync: false       // Changed
});

// ✅ Works in glob 12.x  
const { Glob } = require('glob');
const globber = new Glob(pattern, {
  // New constructor options
});
```

## 🔧 Installation & Usage

```bash
# Install dependencies (includes vulnerable packages)
npm install

# Run the demo application  
node index.js

# Run with custom pattern
node index.js --pattern "src/**/*.js" --dot

# Run tests
node test.js
```

## 🧪 Test Suite

The project includes a very simple custom test framework that tests:
- FileProcessor instantiation
- Synchronous file finding with glob
- Asynchronous file finding  
- File processing and statistics
- Glob stream creation
- Various glob options that break in 12.x

## 🔒 Security Remediation

### Fix glob Breaking Changes:
```bash
# Upgrade and fix API usage
npm install glob@latest
```

### Fix Prototype Pollution:
```bash  
# Update vulnerable packages
npm install lodash@latest minimist@latest
```

### Alternative Packages:
- **glob alternative**: `fast-glob`, `globby` 
- **lodash alternative**: Use native JS methods where possible
- **minimist alternative**: `yargs`, `commander`

## 📋 Breaking Change Checklist

When upgrading to glob 12.x, you need to:

- [ ] Replace `glob.sync()` with `globSync()` import
- [ ] Convert callback-based `glob()` to Promise-based
- [ ] Update `new glob.Glob()` to `new Glob()` with new options
- [ ] Remove deprecated options: `nonull`, `cache`, `statCache`  
- [ ] Update `mark` option usage (behavior changed)
- [ ] Handle new error patterns and return types
- [ ] Test all glob patterns and options thoroughly
- [ ] Update TypeScript types if using TypeScript

## 🎯 Purpose

This demo shows realistic breaking changes that require non-trivial code modifications, making it perfect for testing:
- Dependency upgrade tools
- Security vulnerability scanners  
- Breaking change detection
- Automated migration assistance

The code intentionally uses patterns that will break to demonstrate the complexity of major version upgrades in the JavaScript ecosystem.