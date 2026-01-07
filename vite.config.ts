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
    'process.env': process.env
  }
});