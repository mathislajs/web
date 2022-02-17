module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module'
  },
  root: true,
  env: {
    node: true
  },
  ignorePatterns: ['.eslintrc.js'],
  extends: [
    '@typescript-eslint/eslint-plugin',
    'prettier',
    'airbnb-base',
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    'prettier/prettier': 'error',
    'no-return-await': 'off',
    'max-classes-per-file': 'off',
    'require-await': 2,
    'class-methods-use-this': 'off',
    'no-plusplus': 'off',
    'no-console': 1,
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': 1,
    'no-unused-expressions': 'off',
    'no-useless-constructor': 'off',
    'new-cap': 'off',
    'comma-dangle': ['error', 'never'],
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-commonjs': 1,
    'import/prefer-default-export': 'off',
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: ['state']
      }
    ],

    'vue/max-attributes-per-line': 'off',
    'vue/no-v-html': 'off'
  }
};
