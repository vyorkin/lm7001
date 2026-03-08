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
          primary: 'rgb(var(--bg-primary) / <alpha-value>)',
          panel:   'rgb(var(--bg-panel)   / <alpha-value>)',
          raised:  'rgb(var(--bg-raised)  / <alpha-value>)',
          input:   'rgb(var(--bg-input)   / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          dim:     'rgb(var(--accent) / 0.6)',
          border:  'rgb(var(--accent) / 0.2)',
          glow:    'rgb(var(--accent) / 0.12)',
        },
        blue: {
          DEFAULT: 'rgb(var(--blue-color) / <alpha-value>)',
          glow:    'rgb(var(--blue-color) / 0.15)',
        },
        warn:   'rgb(var(--warn-color)   / <alpha-value>)',
        danger: 'rgb(var(--danger-color) / <alpha-value>)',
        muted:  'rgb(var(--muted)        / <alpha-value>)',
        text: {
          primary:   'rgb(var(--text-primary)   / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          dim:       'rgb(var(--text-dim)       / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
