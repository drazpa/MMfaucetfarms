/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '.95',
            transform: 'scale(1.02)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(236, 72, 153, 0.3)',
        'glow-md': '0 0 20px rgba(236, 72, 153, 0.3)',
        'glow-lg': '0 0 30px rgba(236, 72, 153, 0.3)',
        'glow-xl': '0 0 40px rgba(236, 72, 153, 0.3)',
      },
    },
  },
  plugins: [],
};