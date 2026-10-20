import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

// In dev, /api is proxied to the Node.js backend.
export default defineConfig({
  plugins: [react(), tailwind()],
  // Bind the frontend to the same IPv4 host used by APP_URL and Google OAuth.
  server: { host: '127.0.0.1', proxy: { '/api': 'http://127.0.0.1:8000' } },
});
