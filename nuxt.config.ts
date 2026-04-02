import process from 'node:process'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@element-plus/nuxt', '@nuxtjs/i18n', '@sentry/nuxt/module'],

  plugins: [],
  ssr: false,

  components: true,

  app: {
    head: {
      title: 'Clearance',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [{ rel: 'icon', href: '/favicon.ico' }],
    },
  },

  css: [],

  runtimeConfig: {
    public: {
      api: process.env.NUXT_PUBLIC_API,
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
      sentryEnvironment: process.env.NUXT_PUBLIC_SENTRY_ENVIRONMENT,
    },
  },

  sentry: {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    sentryUrl: process.env.SENTRY_URL,
    telemetry: false,
  },

  sourcemap: {
    client: 'hidden',
  },

  build: {
    transpile: [/lodash.*/],
  },

  compatibilityDate: '2026-03-25',

  typescript: {
    typeCheck: 'build',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  i18n: {
    strategy: 'no_prefix',
    experimental: {
      // Disable server redirect detection — incompatible with ssr: false
      nitroContextDetection: false,
    },
    detectBrowserLanguage: {
      useCookie: false,
    },
    locales: [
      { code: 'en', name: 'English', flag: 'GB', language: 'en-US', file: 'en.js' },
      { code: 'es', name: 'Español', flag: 'ES', language: 'es-ES', file: 'es.js' },
      { code: 'fr', name: 'Français', flag: 'FR', language: 'fr-FR', file: 'fr.js' },
    ],
    defaultLocale: 'en',
    langDir: 'locales',
  },
})
