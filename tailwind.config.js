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
        zen: {
          orange: {
            50: '#fff8f1',
            100: '#feecdc',
            200: '#fcd9bd',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
          },
          teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          sage: {
            50: '#f8faf9',
            100: '#f1f5f3',
            200: '#e1ebe5',
            300: '#c9d9d0',
            400: '#a8c0b0',
            500: '#7a9b85',
            600: '#5a7c64',
            700: '#4a6551',
            800: '#3d5342',
            900: '#334538',
          },
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
        'japanese-pattern': `
          radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.08) 2px, transparent 2px),
          radial-gradient(circle at 80% 80%, rgba(251, 146, 60, 0.06) 1px, transparent 1px),
          radial-gradient(ellipse 40px 20px at 40% 60%, rgba(254, 215, 170, 0.1), transparent),
          radial-gradient(ellipse 30px 15px at 70% 30%, rgba(255, 237, 213, 0.08), transparent),
          radial-gradient(ellipse 25px 12px at 25% 80%, rgba(249, 115, 22, 0.05), transparent),
          linear-gradient(135deg, rgba(255, 251, 235, 0.4) 0%, rgba(254, 243, 199, 0.3) 50%, rgba(255, 251, 235, 0.4) 100%)
        `,
        'hero-gradient': `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.9) 0%, 
            rgba(255, 247, 237, 0.95) 25%,
            rgba(254, 243, 199, 0.9) 50%,
            rgba(255, 247, 237, 0.95) 75%,
            rgba(255, 255, 255, 0.9) 100%
          )
        `,
        'card-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
        'header-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 237, 0.95) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'fade-in-up': 'fadeInUp 1s ease-out',
        'fade-in-delayed': 'fadeIn 1.2s ease-in-out 0.5s both',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'scale-in-delayed': 'scaleIn 0.8s ease-out 0.3s both',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'gradient-move': 'gradientMove 3s ease-in-out infinite',
        'stagger-1': 'fadeInUp 0.8s ease-out 0.1s both',
        'stagger-2': 'fadeInUp 0.8s ease-out 0.2s both',
        'stagger-3': 'fadeInUp 0.8s ease-out 0.3s both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(249, 115, 22, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientMove: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            backgroundSize: '200% 200%'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            backgroundSize: '200% 200%'
          },
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