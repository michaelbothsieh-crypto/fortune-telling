import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 重要：這裡必須填寫您的 GitHub Repository 名稱，前後都要有斜線
  base: '/fortune-telling/',
});