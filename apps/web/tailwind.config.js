/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'retro': {
          'bg': 'rgb(var(--retro-bg) / <alpha-value>)',
          'surface': 'rgb(var(--retro-surface) / <alpha-value>)',
          'card': 'rgb(var(--retro-card) / <alpha-value>)',
          'border': 'rgb(var(--retro-border) / <alpha-value>)',
          'green': 'rgb(var(--retro-green) / <alpha-value>)',
          'green-dim': 'rgb(var(--retro-green-dim) / <alpha-value>)',
          'cyan': 'rgb(var(--retro-cyan) / <alpha-value>)',
          'red': 'rgb(var(--retro-red) / <alpha-value>)',
          'gold': 'rgb(var(--retro-gold) / <alpha-value>)',
          'purple': 'rgb(var(--retro-purple) / <alpha-value>)',
          'pink': 'rgb(var(--retro-pink) / <alpha-value>)',
          'text': 'rgb(var(--retro-text) / <alpha-value>)',
          'muted': 'rgb(var(--retro-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'mono': ['"JetBrains Mono"', 'monospace'],
        'body': ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0, 255, 136, 0.3)',
        'pixel-lg': '6px 6px 0px 0px rgba(0, 255, 136, 0.2)',
        'pixel-gold': '4px 4px 0px 0px rgba(255, 215, 0, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.15)',
        'glow-cyan': '0 0 20px rgba(78, 205, 196, 0.15)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanlines': 'scanlines 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanlines: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
      },
    },
  },
  plugins: [],
};
