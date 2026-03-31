import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  alias: {
    '#shared': fileURLToPath(new URL('./shared', import.meta.url))
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? ''
    }
  },
  app: {
    head: {
      title: 'Qualitec',
      titleTemplate: '%s · Qualitec',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
      ],
      meta: [
        { name: 'description', content: 'Gestão de tarefas em equipe — Qualitec' }
      ]
    }
  }
})