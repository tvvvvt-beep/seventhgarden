/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0F',
          surface: '#12131C',
          card: '#1A1C2A',
          border: '#282C40',
        },
        neon: {
          pink: '#FF007F',
          purple: '#9D4EDD',
          cyan: '#00F5FF',
          yellow: '#FFEE32',
          magenta: '#E0115F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.4)',
        'neon-purple': '0 0 15px rgba(157, 78, 221, 0.4)',
        'neon-cyan': '0 0 15px rgba(0, 245, 255, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite alternate',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 10px rgba(255, 0, 127, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(255, 0, 127, 0.7), 0 0 35px rgba(157, 78, 221, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
