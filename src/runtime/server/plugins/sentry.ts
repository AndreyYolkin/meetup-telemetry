import * as Sentry from '@sentry/node'
import {
  nodeProfilingIntegration,
} from '@sentry/profiling-node'
import { H3Error } from 'h3'
import { useRuntimeConfig, defineNitroPlugin } from '#imports'

export default defineNitroPlugin(nitroApp => {
  const runtimeConfig = useRuntimeConfig()

  const { public: { telemetry: { sentry } } } = runtimeConfig

  if (!sentry.dsn) {
    console.warn('Sentry DSN not set, skipping Sentry initialization')
    return
  }

  Sentry.init({
    dsn: sentry.dsn,
    environment: sentry.environment,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: sentry.node.tracesSampleRate,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: sentry.node.profilesSampleRate,
  })

  nitroApp.hooks.hook('error', error => {
    // Do not handle 404s and 422s
    if (error instanceof H3Error) {
      if (error.statusCode === 404 || error.statusCode === 422) {
        return
      }
    }

    Sentry.captureException(error)
  })

  nitroApp.hooks.hook('request', event => {
    event.context.$sentry = Sentry
  })

  nitroApp.hooks.hookOnce('close', async () => {
    await Sentry.close(2000)
  })
})
