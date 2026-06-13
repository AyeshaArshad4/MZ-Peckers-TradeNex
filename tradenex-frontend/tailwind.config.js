/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#D8E3D6',  // Pale Sage (hover)
          100: '#D8E3D6',  // Pale Sage
          400: '#A8B58A',  // Soft Olive
          500: '#8FAF8B',  // Muted Sage Green
          600: '#8FAF8B',  // Muted Sage Green (primary accent)
          700: '#7A9876',  // slightly darker sage
          900: '#5E7A5A',  // deep sage
        },
        // Earthy neutral scale (replaces slate)
        stone: {
          50:  '#F7F5EF',  // Soft Ivory
          100: '#E8E4D1',  // Warm Sand
          200: '#CFCAB8',  // Warm Beige Gray (borders)
          300: '#D8D6C8',  // Light Stone Gray (sidebar)
          400: '#66707A',  // Slate Gray (secondary text)
          500: '#66707A',
          600: '#4E5760',
          700: '#3F454D',  // Charcoal Gray (primary text)
          800: '#3F454D',
          900: '#2C3138',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'slide-down': 'slideDown 0.3s ease forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                    to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
