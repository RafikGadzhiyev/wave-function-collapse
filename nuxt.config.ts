// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig(
  {
    modules: [
      '@nuxtjs/tailwindcss',
      '@nuxt/icon'
    ],
    compatibilityDate: '2024-04-03',
    devtools: {
      enabled: import.meta.env.DEV
    },
    imports: {
      autoImport: false,
    },
    devServer: {
      port: 3000,
    }
    // components: {
    //   dirs: [],
    // }
  }
)
