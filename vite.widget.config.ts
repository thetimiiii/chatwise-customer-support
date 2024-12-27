import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'public/chat-widget.jsx'),
      name: 'LovableChatWidget',
      fileName: 'widget',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [], // Bundle everything
      output: {
        globals: {},
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
