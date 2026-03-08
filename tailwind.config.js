/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        display: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#060a0e',
          panel: '#0c1218',
          raised: '#111820',
          input: '#0a1016',
        },
        accent: {
          DEFAULT: '#00ffcc',
          dim: 'rgba(0,255,204,0.6)',
          border: 'rgba(0,255,204,0.2)',
          glow: 'rgba(0,255,204,0.12)',
        },
        blue: {
          DEFAULT: '#0088ff',
          glow: 'rgba(0,136,255,0.15)',
        },
        warn: '#ffaa00',
        danger: '#ff4466',
        muted: '#3a5560',
        text: {
          primary: '#d8ecec',
          secondary: '#6a9090',
          dim: '#3a5560',
        },
      },
    },
  },
  plugins: [],
}
