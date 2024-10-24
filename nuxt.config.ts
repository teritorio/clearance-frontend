import process from 'node:process'

export default defineNuxtConfig({
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  app: {
    head: {
      title: 'Clearance',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [{ rel: 'icon', href: '/favicon.ico' }],
    },
  },

  runtimeConfig: {
    public: {
      API: process.env.API,
      sentry: {
        dsn: undefined,
        environment: 'production',
      },
    },
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxt/eslint', '@element-plus/nuxt', '@nuxtjs/i18n'],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/lodash.*/],
  },

  typescript: {
    typeCheck: 'build',
  },

  eslint: {
    config: {
      standalone: false,
      stylistic: true,
    },
  },

  i18n: {
    strategy: 'no_prefix',
    lazy: true,
    detectBrowserLanguage: {
      useCookie: false,
    },
    locales: [
      { code: 'en', name: 'English', flag: 'GB', language: 'en-US', file: 'en.js' },
      { code: 'es', name: 'Español', flag: 'ES', language: 'es-ES', file: 'es.js' },
      { code: 'fr', name: 'Français', flag: 'FR', language: 'fr-FR', file: 'fr.js' },
    ],
    defaultLocale: 'en',
    langDir: './locales',
  },

  compatibilityDate: '2024-07-16',
})
