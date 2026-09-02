# Known Vulnerabilities in Dependencies

This document outlines the known security vulnerabilities in the packages used in this demo.

## 🚨 Critical & High Severity Issues

### 1. glob 7.2.3
- **Status**: Deprecated with known security vulnerabilities
- **Issue**: Old versions contain widely publicized security vulnerabilities
- **Severity**: Critical
- **CVE**: Multiple CVEs affecting old versions
- **Fix**: Upgrade to latest version (12.x)

### 2. lodash 4.17.20  
- **CVE**: CVE-2020-8203
- **Severity**: High  
- **Issue**: Prototype Pollution in zipObjectDeep function
- **CVSS Score**: 7.4
- **Description**: Allows attackers to modify object prototypes leading to DoS or RCE
- **Fix**: Upgrade to lodash 4.17.21 or later

### 3. minimist 1.2.5
- **CVE**: CVE-2020-7598  
- **Severity**: High
- **Issue**: Prototype Pollution via command line arguments
- **CVSS Score**: 5.6
- **Description**: Allows modification of Object.prototype through malicious arguments
- **Fix**: Upgrade to minimist 1.2.6 or later

## 📋 Vulnerability Details

### Prototype Pollution Explained

Prototype pollution is a vulnerability that allows attackers to modify the prototype of base objects like `Object.prototype`. This can lead to:

1. **Denial of Service**: Crashing the application
2. **Property Injection**: Adding unexpected properties to all objects  
3. **Logic Bypass**: Circumventing security checks
4. **Remote Code Execution**: In some cases, executing arbitrary code

### Example Exploitation

```javascript
// minimist vulnerability example
const args = require('minimist')(['--__proto__.polluted=true']);
console.log({}.polluted); // outputs: true

// lodash vulnerability example  
const _ = require('lodash');
_.zipObjectDeep(['__proto__.polluted'], [true]);
console.log({}.polluted); // outputs: true
```

## 🔧 Remediation Steps

### 1. Update Dependencies
```bash
npm update glob lodash minimist
```

### 2. Use Alternative Packages
```bash
# Replace glob with fast-glob
npm install fast-glob
npm uninstall glob

# Replace minimist with yargs
npm install yargs  
npm uninstall minimist

# Minimize lodash usage
npm uninstall lodash
# Use native JavaScript methods instead
```

### 3. Implement Input Validation
```javascript
// Validate command line arguments
function sanitizeArgs(args) {
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  for (const key of Object.keys(args)) {
    if (dangerous.includes(key)) {
      delete args[key];
    }
  }
  return args;
}
```

## 🛡️ Security Best Practices

1. **Regular Updates**: Keep dependencies up to date
2. **Audit Regularly**: Run `npm audit` frequently  
3. **Use Security Tools**: Implement tools like Snyk, npm audit, etc.
4. **Input Validation**: Always validate and sanitize user input
5. **Principle of Least Privilege**: Limit package permissions where possible

## 📊 Expected npm audit Output

When running `npm audit`, you should see:

```
2 vulnerabilities (1 high, 1 critical)

Some issues need review, and may require choosing
a different dependency.

Run `npm audit fix` to fix them, or `npm audit` for details.
```

## 🎯 Demo Purpose  

This intentionally vulnerable setup demonstrates:
- Real-world security issues in JavaScript packages
- Breaking changes between major versions  
- The importance of dependency management
- Security scanning and remediation workflows