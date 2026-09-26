/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'system-ui', '-apple-system', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf9',
          100: '#cbfbee',
          200: '#99f6dc',
          300: '#5ee9c5',
          400: '#2cd3ab',
          500: '#10b98f',
          600: '#079473',
          700: '#09765d',
          800: '#0c5d4b',
          900: '#0e4d3f',
          950: '#042d25',
        },
        navy: {
          800: '#0c1b33',
          850: '#081426',
          900: '#050d1a',
          950: '#02070f',
        },
        danger: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
        },
        safe: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'glass-hover': '0 16px 48px -8px rgba(0, 0, 0, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)',
        'elevated': '0 20px 40px -15px rgba(5, 33, 26, 0.12), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'elevated-lg': '0 30px 60px -20px rgba(5, 33, 26, 0.18), 0 2px 6px rgba(0, 0, 0, 0.05)',
        'glow-emerald': '0 0 40px -5px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 40px -5px rgba(244, 63, 94, 0.45)',
        'inner-light': 'inset 0 1.5px 0 0 rgba(255, 255, 255, 0.7)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'fade-in': 'fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-up': 'scale-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scan-laser': 'scan-laser 2.5s ease-in-out infinite',
        'equalizer-1': 'equalizer 0.8s ease-in-out infinite alternate',
        'equalizer-2': 'equalizer 1.1s ease-in-out 0.2s infinite alternate',
        'equalizer-3': 'equalizer 0.9s ease-in-out 0.4s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '70%': { transform: 'scale(1.25)', opacity: '0' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-up': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scan-laser': {
          '0%, 100%': { top: '5%', opacity: '0.9' },
          '50%': { top: '90%', opacity: '0.9' },
        },
        'equalizer': {
          '0%': { height: '6px' },
          '100%': { height: '28px' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      },
    },
  },
  plugins: [],
};
