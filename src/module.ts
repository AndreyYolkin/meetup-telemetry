import { addPlugin, addImportsDir, addServerPlugin, createResolver, defineNuxtModule, installModule } from '@nuxt/kit'
import { defu } from 'defu'

import type { ModuleOptions } from './types/module'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@meetup/telemetry',
    configKey: 'mTelemetry',
  },
  defaults: {
    sentry: {
      dsn: '',
      environment: import.meta.env.NODE_ENV || 'development',
      node: {
        tracesSampleRate: 0.2,
        profilesSampleRate: 0.2,
      },
      client: {
        tracesSampleRate: 0.2,
        replay: {
          enabled: true,
          replaysSessionSampleRate: 0.2,
          replaysOnErrorSampleRate: 1.0,
        },
      },
    },
    prometheus: {
      verbose: import.meta.env.NODE_ENV !== 'development',
    }
  },
  setup(options, nuxt) {

    // Прокидываем опции в runtimeConfig
    nuxt.options.runtimeConfig.public.telemetry = defu(
      nuxt.options.runtimeConfig.public.telemetry,
      options,
    )

    // Создаём resolver
    const resolver = createResolver(import.meta.url)

    // Прокидываем содержимое папки runtime по пути #telemetry
    const runtimeDir = resolver.resolve('./runtime')
    nuxt.options.alias['#telemetry'] = runtimeDir

    // Устанавливаем модуль prometheus.
    // TODO: добавить возможность конфигурировать через runtimeConfig
    installModule('@artmizu/nuxt-prometheus', { verbose: options.prometheus.verbose })

    // Добавляем плагин Sentry.client
    addPlugin(resolver.resolve(runtimeDir, './plugins/sentry.client'))

    // Добавляем плагин Sentry.server
    addServerPlugin(resolver.resolve(runtimeDir, './server/plugins/sentry'))

    // Создаём автоимпорт папки composables
    const composablesPath = resolver.resolve(runtimeDir, './composables')
    addImportsDir(composablesPath)


    if (nuxt.options._installedModules.some(m => m?.meta?.name === '@meetup/fake-auth')) {
      // Обратите внимание, так как мы не указали явно, что плагин для клиента
      // и не указали в имени `.client.ts`, плагин будет работать и на клиенте и на сервере
      // append: true добавляет плагин в конец списка плагинов, так мы будем уверены,
      // что $auth и $sentry уже установлены
      addPlugin(resolver.resolve(runtimeDir, './plugins/auth-integration'), { append: true })
    }
  },
})
