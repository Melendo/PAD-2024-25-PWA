import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: "/PAD-2024-25-PWA/",
  plugins: [
    react(),
    VitePWA({
      name: "Book Search PWA",
      short_name: "BookSearch",
      description: "PWA para buscar y categorizar libros.",
      theme_color: "#FFFFFF",
      icons: [
        {
          src: "/icon-192x192.png",
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  ),
  ],
})
