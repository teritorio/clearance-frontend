import process from 'node:process'

const defaultMapStyleUrl = 'https://vecto.teritorio.xyz/styles/teritorio-basic/style.json?key=teritorio_clearance-1-ahNoohaepohy9iexoo3qua'

if (!process.env.NUXT_PUBLIC_MAP_STYLE_URL) {
  console.warn(`WARNING: NUXT_PUBLIC_MAP_STYLE_URL is not set. Falling back to ${defaultMapStyleUrl}`)
}

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

  css: ['@teritorio/openstreetmap-logical-history-component/style.css'],

  runtimeConfig: {
    public: {
      api: process.env.NUXT_PUBLIC_API,
      mapStyleUrl: process.env.NUXT_PUBLIC_MAP_STYLE_URL || defaultMapStyleUrl,
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

  vite: {
    server: {
      allowedHosts: ['clearance-dev.teritorio.xyz'],
    },
    resolve: {
      dedupe: ['vue'],
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'underscore',
        '@turf/bbox',
        '@turf/boolean-equal',
        'maplibre-gl',
        'dayjs/locale/en-gb',
        'dayjs/locale/es',
        'dayjs/locale/fr',
        'dayjs/plugin/localizedFormat',
        'dayjs/plugin/relativeTime',
      ],
    },
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
