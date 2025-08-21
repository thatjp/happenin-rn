// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    // Workaround: disable import resolver errors with TS + flat config
    rules: {
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/export': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/order': 'off',
      'import/extensions': 'off',
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
        // Force-disable the TS resolver to avoid interface mismatch errors
        typescript: false,
      },
    },
  },
]);
