import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        // Node.js
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',
        // 微信小程序
        wx: 'readonly',
        App: 'readonly',
        Page: 'readonly',
        Component: 'readonly',
        getApp: 'readonly',
        getCurrentPages: 'readonly',
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      'server/node_modules/',
      'miniprogram/miniprogram_npm/',
      'dist/',
      'build/',
      'scripts/',
      'eslint.config.mjs',
    ],
  },
];
