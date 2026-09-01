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
      }
    },
  },
  plugins: [],
}
