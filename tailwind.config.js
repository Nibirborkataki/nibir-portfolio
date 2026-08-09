/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f9f9f9',
        'surface-container': '#eeeeee',
        'surface-container-low': '#f3f3f3',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#e8e8e8',
        'surface-container-highest': '#e2e2e2',
        primary: '#000000',
        'primary-container': '#3b3b3b',
        'on-primary': '#e2e2e2',
        'on-surface': '#1b1b1b',
        'on-surface-variant': '#5a5a5a',
        outline: '#777777',
        'outline-variant': '#c6c6c6',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        editorial: ['Manrope', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.02em',
        widest: '0.15em',
      },
      keyframes: {
        moveLeftRight: {
          '0%, 100%': { transform: 'translateX(-40px)' },
          '50%': { transform: 'translateX(20px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        'move-bg': 'moveLeftRight 6s ease-in-out infinite',
        marquee: 'marquee 25s linear infinite',
      }
    },
  },
  plugins: [],
}
