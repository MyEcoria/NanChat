import { defineConfig, splitVendorChunkPlugin } from "vite";
import path, { resolve } from "path";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import fixReactVirtualized from 'esbuild-plugin-react-virtualized'
import { VitePWA } from 'vite-plugin-pwa'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";


// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      plugins: [fixReactVirtualized],
      target: 'esnext',
    },
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd-mobile',
      'i18next',
      'react-i18next',
    ],
  },
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Use automatic JSX runtime
      jsxRuntime: 'automatic',
    }),
    // VitePWA({
    //   mode: 'development',
    //   strategies: 'injectManifest',
    //   injectManifest: {
    //     maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
    //   },
    //   // workbox: {
    //   //    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
    //   // },
    //   srcDir: 'public',
    //   filename: 'firebase-messaging-sw.js',
    //   devOptions: {
    //     enabled: false,
    //     type: 'module',
    //   },
    //    registerType: 'prompt'
    //    },
    //   ),
    // VitePWA({
    //   mode: 'development',
    //   strategies: 'injectManifest',
    //   srcDir: 'public',
    //   filename: 'firebase-messaging-sw.js',
    //   devOptions: {
    //     enabled: false,
    //     type: 'module',
    //   },
    //    registerType: 'prompt'
    //    },
    //   ),
    nodePolyfills({
      include: ['crypto', 'stream', 'vm', 'process'],
      globals: {
        Buffer: true
      }
    }),
    // splitVendorChunkPlugin()
  ],
  build: {
    minify: 'terser',
    cssMinify: 'lightningcss',
    cssCodeSplit: true,
    target: 'esnext',
    modulePreload: {
      polyfill: false,
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
        options: resolve(__dirname, "options.html"),
        service_worker: resolve(__dirname, "src/background.ts"),
        // service_worker_firebase: resolve(__dirname, "src/firebase-messaging-sw.js"),
        content_script: resolve(__dirname, "src/content-script.ts"),
      },
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        entryFileNames: "[name].js",
        dir: "dist",
        // Manual chunks for better code splitting
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Antd Mobile UI
            if (id.includes('antd-mobile') || id.includes('antd-mobile-icons')) {
              return 'vendor-ui';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            // Crypto & blockchain
            if (id.includes('nano') || id.includes('bip39') || id.includes('argon2') || id.includes('crypto')) {
              return 'vendor-crypto';
            }
            // Capacitor plugins
            if (id.includes('@capacitor')) {
              return 'vendor-capacitor';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Other vendors
            return 'vendor-misc';
          }
        },
        // Optimize chunk size
        experimentalMinChunkSize: 10000,
      },
      treeshake: {
        moduleSideEffects: 'no-external',
        preset: 'recommended',
        propertyReadSideEffects: false,
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Faster builds
    sourcemap: false, // No sourcemaps in production
  },
  // Performance optimizations
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    treeShaking: true,
  },
});
