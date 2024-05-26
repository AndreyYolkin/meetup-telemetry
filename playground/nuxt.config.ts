export default defineNuxtConfig({
  modules: ['../src/module'],
  mTelemetry: {
    sentry: {
      dsn: 'https://public@sentry.example.com/1',
    },
    prometheus: {
      verbose: true,
    }
  },
  devtools: { enabled: true },
})
