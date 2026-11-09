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
        'shimmer': 'shimmer 6s infinite linear',
        'glowDrift': 'glowDrift 10s ease-in-out infinite',
        'glowDrift2': 'glowDrift2 12s ease-in-out infinite',
        'scanMove': 'scanMove 0.8s linear infinite',
        'riseIn': 'riseIn 0.7s ease-out both',
        'titlePulse': 'titlePulse 3s ease-in-out infinite alternate',
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
          '100%': { backgroundPosition: '200% 0' }
        },
        glowDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(40px, 30px) scale(1.15)' },
        },
        glowDrift2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-45px, -25px) scale(1.2)' },
        },
        scanMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 4px' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        titlePulse: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(236,72,153,0.35))' },
          '100%': { filter: 'drop-shadow(0 0 22px rgba(236,72,153,0.65)) drop-shadow(0 0 14px rgba(34,211,238,0.35))' },
        }
      }
    },
  },
  plugins: [],
}
