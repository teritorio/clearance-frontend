import * as Sentry from '@sentry/nuxt'

const runtimeConfig = useRuntimeConfig()

if (!runtimeConfig.public.sentryDsn) {
  console.info('Sentry DSN not configured, skipping initialization')
}
else {
  Sentry.init({
    dsn: runtimeConfig.public.sentryDsn,
    environment: runtimeConfig.public.sentryEnvironment,
    tracesSampleRate: 0.05,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    })],
    enableLogs: true,
  })
}
