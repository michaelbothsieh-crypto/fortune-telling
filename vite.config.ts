import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg'],
      manifest: {
        name: '天機算命 - AI 八字大師',
        short_name: '天機算命',
        description: 'AI 驅動的專業八字論命系統',
        theme_color: '#1c1917',
        background_color: '#1c1917',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  // 重要：這裡必須填寫您的 GitHub Repository 名稱，前後都要有斜線
  base: '/fortune-telling/',
});