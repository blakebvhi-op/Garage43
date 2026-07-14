/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#181B1F',
        steel: '#23272C',
        steel2: '#2E343B',
        edge: '#3A424B',
        chalk: '#EAE7DE',
        muted: '#8B939C',
        dim: '#5B636C',
        hazard: '#F0531C',
        lift: '#3E97BF',
        meet: '#C9A227',
        good: '#5FA463',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        cond: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
