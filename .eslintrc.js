module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // General rules
    'no-console': 'off', // We use console for logging
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'warn', // Warn instead of error for now
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    '*.js', // Ignore JS files in root
    'bin/',
    'public/',
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        // Disable base rule and enable TypeScript version
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { 
          argsIgnorePattern: '^_', 
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          args: 'after-used'
        }],
      },
    },
  ],
};