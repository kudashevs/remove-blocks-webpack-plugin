const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    ignores: ['build/**/*', 'coverage/**/*', 'node_modules/**/*', 'test/fixtures/**/*'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2020,
      sourceType: 'commonjs',
    },
    rules: {
      semi: ['warn', 'always'],
      'no-useless-escape': 'warn',
      'no-console': 'error',
      'prefer-const': 'error',
    },
  },
];
