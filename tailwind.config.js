const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  //darkMode: ['class', '[data-theme="dark"]'],
  content: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans]
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      colors: {
        primaryBackground: '#e7e6e3',
        secondaryBackground: '#FAFAFA',
        textColor: '#4A4A4A', // Charcoal Gray
        buttonBackground: '#B0C4DE', // Misty Blue
        buttonHover: '#91A4BC', // Darker Misty Blue
        borderColor: '#4A4A4A', // Charcoal Gray for border
        navBackground: '#d3d2cf'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
