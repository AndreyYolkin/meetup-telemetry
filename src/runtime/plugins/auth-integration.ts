import { defineNuxtPlugin, useNuxtApp } from '#app'
import { useUserPreferences } from '#telemetry/composables/userAgreement'
import type { NuxtApp } from '#app'
import { setUser } from '@sentry/vue'

export default defineNuxtPlugin({
  setup() {
    const nuxtApp = useNuxtApp()
    // TODO: расширить типизацию NuxtApp по-человечески
    const { $auth } = nuxtApp as NuxtApp & { $auth: { user: { id: string, username: string, email: string } } }
    const { agreement } = useUserPreferences()
    if (agreement.value && $auth?.user) {
      const { id, username, email } = $auth.user
      // Можно также использовать nuxtApp.$sentry.setUser, но это справедливо только для sentry
      setUser({ id, username, email })
    }
  },
})