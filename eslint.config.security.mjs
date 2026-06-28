/**
 * ESLint Security Configuration — SAST scan for common security anti-patterns.
 *
 * Detects:
 * - eval() usage (no-eval)
 * - innerHTML/outerHTML assignments (no-restricted-syntax)
 * - Math.random() in security-sensitive contexts (no-restricted-syntax)
 * - Function constructor (no-new-func)
 * - Implied eval via setTimeout/setInterval strings (no-implied-eval)
 *
 * Reports: file path, line number, rule ID, severity (via ESLint formatter output).
 *
 * Usage:
 *   npx eslint -c eslint.config.security.mjs apps/ packages/
 */
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Disallow eval() — arbitrary code execution risk
      'no-eval': 'error',

      // Disallow indirect eval via Function constructor
      'no-new-func': 'error',

      // Disallow implied eval (setTimeout/setInterval with strings)
      'no-implied-eval': 'error',

      // Disallow innerHTML/outerHTML assignment and Math.random()
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.object.name="Math"][callee.property.name="random"]',
          message:
            'Math.random() is not cryptographically secure. Use crypto.getRandomValues() or crypto.randomUUID() for security-sensitive contexts.',
        },
        {
          selector: 'AssignmentExpression[left.property.name="innerHTML"]',
          message:
            'Direct innerHTML assignment is a security risk (XSS). Use textContent or a sanitization library.',
        },
        {
          selector: 'AssignmentExpression[left.property.name="outerHTML"]',
          message:
            'Direct outerHTML assignment is a security risk (XSS). Use textContent or a sanitization library.',
        },
        {
          selector: 'CallExpression[callee.object.name="document"][callee.property.name="write"]',
          message: 'document.write() is a security risk. Use DOM manipulation methods instead.',
        },
        {
          selector: 'CallExpression[callee.object.name="document"][callee.property.name="writeln"]',
          message: 'document.writeln() is a security risk. Use DOM manipulation methods instead.',
        },
      ],

      // Disable rules that would generate noise for a security-focused scan
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Disallow eval() — arbitrary code execution risk
      'no-eval': 'error',

      // Disallow indirect eval via Function constructor
      'no-new-func': 'error',

      // Disallow implied eval (setTimeout/setInterval with strings)
      'no-implied-eval': 'error',

      // Disallow innerHTML/outerHTML assignment and Math.random()
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.object.name="Math"][callee.property.name="random"]',
          message:
            'Math.random() is not cryptographically secure. Use crypto.getRandomValues() or crypto.randomUUID() for security-sensitive contexts.',
        },
        {
          selector: 'AssignmentExpression[left.property.name="innerHTML"]',
          message:
            'Direct innerHTML assignment is a security risk (XSS). Use textContent or a sanitization library.',
        },
        {
          selector: 'AssignmentExpression[left.property.name="outerHTML"]',
          message:
            'Direct outerHTML assignment is a security risk (XSS). Use textContent or a sanitization library.',
        },
        {
          selector: 'CallExpression[callee.object.name="document"][callee.property.name="write"]',
          message: 'document.write() is a security risk. Use DOM manipulation methods instead.',
        },
        {
          selector: 'CallExpression[callee.object.name="document"][callee.property.name="writeln"]',
          message: 'document.writeln() is a security risk. Use DOM manipulation methods instead.',
        },
      ],

      // Disable rules that would generate noise for a security-focused scan
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.nx/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/test/**',
      '**/tests/**',
      '**/__tests__/**',
      '**/scripts/**',
      '**/storybook-static/**',
      '**/.storybook/**',
      '**/mockServiceWorker.js',
      '**/routeTree.gen.ts',
      // mock-engine is a test data generator (fake prices, random tickers, simulated latency)
      // Math.random() is appropriate here — no security context
      'packages/mock-engine/**',
    ],
  },
];
