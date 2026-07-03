/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#ffffff',
        ink: '#10192e',
        'indigo-deep': '#1c2b4a',
        'indigo-mid': '#2f4a7a',
        accent: '#e3a93a',
        surface: '#f6f7f9',
        border: 'rgba(16, 25, 46, 0.12)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      width: {
        sidebar: '224px',
      },
      margin: {
        sidebar: '224px',
      }
    },
  },
  plugins: [],
}
