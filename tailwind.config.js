/** @type {import('tailwindcss').Config} */
const c = t => `rgb(var(--${t}) / <alpha-value>)`

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: c('ink'),
        steel: c('steel'),
        steel2: c('steel2'),
        edge: c('edge'),
        chalk: c('chalk'),
        muted: c('muted'),
        dim: c('dim'),
        hazard: c('hazard'),
        lift: c('lift'),
        party: c('party'),
        meet: c('meet'),
        good: c('good'),
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
