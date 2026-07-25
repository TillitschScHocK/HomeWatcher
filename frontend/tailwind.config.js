/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E30613',
          'red-dark': '#C0050F',
          'red-light': '#FF1F2B',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F9FA',
          border: '#E5E7EB',
          'border-light': '#F3F4F6',
        },
        ink: {
          DEFAULT: '#111827',
          secondary: '#1F2937',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
      },
      borderRadius: {
        card: '14px',
        modal: '18px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0,0,0,0.05), 0 1px 4px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 32px -4px rgba(0,0,0,0.10), 0 2px 8px -2px rgba(0,0,0,0.06)',
        modal: '0 24px 60px -8px rgba(0,0,0,0.18)',
        'red-glow': '0 0 0 3px rgba(227,6,19,0.18)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease both',
        'scale-in': 'scaleIn 0.25s ease both',
        'slide-down': 'slideDown 0.3s ease both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.6', transform: 'scale(1.35)' },
        },
      },
    },
  },
  plugins: [],
};
