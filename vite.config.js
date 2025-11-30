import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@content': path.resolve(process.cwd(), 'content'),
      '@config': path.resolve(process.cwd(), 'blog.config.js'),
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    fs: {
      allow: ['..']
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  }
});
