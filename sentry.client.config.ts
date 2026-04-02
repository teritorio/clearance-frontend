import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: import.meta.env.NUXT_PUBLIC_SENTRY_DSN,
  environment: import.meta.env.NUXT_PUBLIC_SENTRY_ENVIRONMENT,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.05,

  // Capture Replay for 5% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
})
