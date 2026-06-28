/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'space-black': '#050A14',
        'space-deep': '#080F1E',
        'space-mid': '#0D1829',
        'space-border': '#1A2845',
        'isro-orange': '#FF6B00',
        'isro-amber': '#FFB300',
        'solar-cyan': '#00D4FF',
        'solar-red': '#FF4560',
        'success-green': '#00E676',
        'caution-yellow': '#FFC107',
        'text-primary': '#E8F4FD',
        'text-secondary': '#7BA7C7',
        'text-muted': '#3D6080',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'flare-alert': 'flareAlert 2s ease-in-out infinite',
        ticker: 'ticker 30s linear infinite',
        flow: 'flow 2s linear infinite',
        'live-pulse': 'livePulse 2s ease-in-out infinite',
      },
      keyframes: {
        flareAlert: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 107, 0, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 107, 0, 0.8), 0 0 60px rgba(255, 107, 0, 0.4)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        flow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        livePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.4' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
