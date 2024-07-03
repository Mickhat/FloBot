module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [
    {
      files: ['./**/*.ts'],
      rules: {
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/quotes': 'off',
        '@typescript-eslint/space-before-function-paren': 'off',
        '@typescript-eslint/member-delimiter-style': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/no-misused-promises': 'off'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  rules: {}
}
