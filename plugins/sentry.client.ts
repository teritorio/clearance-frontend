import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const { public: { sentry } } = useRuntimeConfig()

  if (!sentry.dsn) {
    return
  }

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: sentry.dsn,
    environment: sentry.environment,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.05,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
  })
})
