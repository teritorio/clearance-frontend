module.exports = {
  root: true,
  env: {
    browser: true,
    "jest/globals": true,
    node: true,
  },
  extends: [
    "@nuxt/eslint-config",
    "@nuxtjs/eslint-config-typescript",
    "plugin:nuxt/recommended",
    "prettier",
  ],
  plugins: ["jest"],
  // add your custom rules here
  rules: {},
};
