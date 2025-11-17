import formsPlugin from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Add custom theme extensions here if needed
    },
  },
  plugins: [formsPlugin],
  // Optimize for production
  corePlugins: {
    // Disable unused core plugins for smaller bundle
    preflight: true,
  },
  // Future flags for better performance
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Experimental features
  experimental: {
    optimizeUniversalDefaults: true,
  },
};
