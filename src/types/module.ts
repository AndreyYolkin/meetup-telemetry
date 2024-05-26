export interface ModuleOptions {
  sentry: {
    dsn: string
    environment?: string | boolean
    node?: {
      tracesSampleRate?: number
      profilesSampleRate?: number
    }
    client?: {
      tracesSampleRate?: number
      replay?: {
        enabled?: boolean
        replaysSessionSampleRate?: number
        replaysOnErrorSampleRate?: number
      }
    },
  },
  prometheus: {
    verbose?: boolean
  }
}
