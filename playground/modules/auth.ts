import { defineNuxtModule, addPluginTemplate } from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "@meetup/fake-auth",
    configKey: "auth",
  },
  setup(options, nuxt) {
    // создаём фейковый плагин auth
    addPluginTemplate({
      filename: 'auth.mjs',
      getContents: () => `
      export default defineNuxtPlugin({
        setup() {
          const nuxtApp = useNuxtApp()
          nuxtApp.provide('auth', {
            isAuthenticated: () => true,
            user: {
              id: 1,
              username: 'a',
              email: 'a@a.com',
            }
          })
        }
      })
      `,
    },)
  }
})