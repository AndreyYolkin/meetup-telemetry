import { defineNuxtPlugin, useRouter, useRuntimeConfig, useNuxtApp } from '#app'
import { init, browserTracingIntegration, captureException, setUser, withScope, captureMessage } from '@sentry/vue'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const router = useRouter()
  const { public: { telemetry: { sentry } } } = useRuntimeConfig()

  if (!sentry.dsn) {
    return
  }

  nuxtApp.hook('app:mounted', async () => {
    if (!sentry.client.replay.enabled) {
      return
    }
    try {
      const { addIntegration, replayIntegration } = await import('@sentry/vue')
      const replay = replayIntegration({
        beforeErrorSampling: event => {
          if (event.tags?.['no-sentry-replay']) {
            return false
          }
          return true
        },
      })
      addIntegration(replay)
    } catch {
      console.warn('Sentry replay not loaded')
    }
  })

  init({
    app: nuxtApp.vueApp,
    dsn: sentry.dsn,
    environment: sentry.environment,
    integrations: [
      browserTracingIntegration({
        router,
      }),
    ],

    // Configure this whole part as you need it!
    tracesSampleRate: sentry.client.tracesSampleRate, // Change in prod

    replaysSessionSampleRate: sentry.client.replay.replaysSessionSampleRate, // Change in prod
    replaysOnErrorSampleRate: sentry.client.replay.replaysOnErrorSampleRate, // Change in prod if necessary
  })

  nuxtApp.provide('sentry', {
    captureException,
    captureMessage,
    withScope,
    setUser
  })
})
