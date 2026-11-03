import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), VitePWA({
    injectRegister: null,
    registerType: 'autoUpdate',
    manifest: {
      name: 'ပုတီးစိပ်',
      short_name: 'ပုတီးစိပ်',
      description: 'နေ့စဉ် ပုတီးစိပ် မှတ်တမ်း',
      lang: 'my',
      theme_color: '#f6f7f3',
      background_color: '#f6f7f3',
      display: 'standalone',
      start_url: './#/',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  })],
})
