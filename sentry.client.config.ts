import * as Sentry from '@sentry/nuxt'

const runtimeConfig = useRuntimeConfig()

if (!runtimeConfig.public.sentryDsn) {
  console.info('Sentry DSN not configured, skipping initialization')
}
else {
  Sentry.init({
    dsn: runtimeConfig.public.sentryDsn,
    environment: runtimeConfig.public.sentryEnvironment,
    allowUrls: [/clearance(?:-dev)?\.teritorio\.xyz/],
    tracesSampleRate: 0.05,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    })],
    enableLogs: true,
    beforeSend(event) {
      if (event.exception?.values?.some((e) => e.value?.includes(' 404'))) {
        return null
      }
      return event
    },
  })
}
