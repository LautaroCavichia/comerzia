/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        accent: {
          orange: '#f97316',
          'orange-light': '#fb923c',
          'orange-dark': '#ea580c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'subtle-pattern': `
          radial-gradient(circle at 25px 25px, rgba(249, 115, 22, 0.03) 2%, transparent 2%), 
          radial-gradient(circle at 75px 75px, rgba(249, 115, 22, 0.02) 1%, transparent 1%),
          linear-gradient(135deg, rgba(249, 115, 22, 0.01) 0%, rgba(251, 146, 60, 0.01) 50%, transparent 100%)
        `,
        'card-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
        'header-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 237, 0.95) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.0125em' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.0125em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.05em' }],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}