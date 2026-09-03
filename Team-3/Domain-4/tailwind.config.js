/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3-inspired neutral surface palette with calm violet accent
        surface: {
          DEFAULT: '#131316',
          container: '#1c1c20',
          elevated: '#242429',
          high: '#2c2d33',
        },
        primary: {
          DEFAULT: '#9d7bf6',
          hover: '#8b63f4',
          container: '#312154',
          onContainer: '#e9ddff',
        },
        outline: {
          DEFAULT: '#36373d',
          variant: '#2a2b30',
        },
        content: {
          DEFAULT: '#e3e3e7',
          muted: '#9697a0',
          subtle: '#6d6e77',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        textGradient: {
          '0%, 100%': { backgroundSize: '200% 200%', backgroundPosition: 'left center' },
          '50%': { backgroundSize: '200% 200%', backgroundPosition: 'right center' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out forwards',
        pageEnter: 'pageEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideUp: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 4s linear infinite',
        textGradient: 'textGradient 6s ease infinite',
      }
    },
  },
  plugins: [],
}
