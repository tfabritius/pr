module.exports = {
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  extends: [],
  env: {
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    'no-console': 'warn',
    'no-debugger': 'warn',
  },
};
