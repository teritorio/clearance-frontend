// Workaround: vue-i18n's ComponentCustomProperties augmentation is not picked
// up by vue-tsc in Nuxt 4. Re-declare the i18n template globals.
// Upstream bug: https://github.com/vuejs/language-tools/issues/5995
// Remove this file once vue-tsc fixes ComponentCustomProperties merging.
declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (...args: any[]) => string
    $d: (...args: any[]) => string
    $n: (...args: any[]) => string
  }
}
