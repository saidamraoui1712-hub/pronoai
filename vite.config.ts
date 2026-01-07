
import { defineConfig } from 'vite';
import process from 'node:process';

export default defineConfig({
  build: {
    target: 'esnext',
  },
  server: {
    port: 3000,
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.FOOTBALL_API_KEY': JSON.stringify(process.env.FOOTBALL_API_KEY)
  }
});
