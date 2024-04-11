// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: ['**/*.{js,ts,vue,json,yml,markdown,mjs}', '.vscode'],
  rules: {
    '@stylistic/arrow-parens': ['error', 'always'],
  },
}, antfu({
  rules: {
    'curly': ['error', 'all'],
    'style/arrow-parens': ['error', 'always'],
    'vue/no-unused-refs': 0,
  },
}))
