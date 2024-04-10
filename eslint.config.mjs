// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: ['**/*.{js,ts,vue,json,yml,markdown,mjs}', '.vscode'],
}, antfu({
  rules: {
    'vue/no-unused-refs': 0,
  },
}))
