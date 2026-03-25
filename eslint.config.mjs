// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: ['**/*.{js,ts,vue,json,yml,markdown,mjs}', '.vscode'],
}, antfu({
  vue: {
    overrides: {
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
        },
      }],
      'vue/no-unused-refs': 0,
    },
  },
  rules: {
    'curly': ['error', 'all'],
    'style/arrow-parens': ['error', 'always'],
  },
}))
