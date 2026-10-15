/** @type {import('tailwindcss').Config} */
// Brand palette taken from code-review-graph.com: deep navy neutrals + cyan primary, amber accent.
// Remapping the stock `blue`/`indigo`/`slate`/`gray` scales re-themes every existing page without
// touching their class names.
const primary = {
  50: 'hsl(187 90% 96%)',
  100: 'hsl(187 88% 90%)',
  200: 'hsl(187 86% 80%)',
  300: 'hsl(187 90% 69%)',
  400: 'hsl(187 85% 53%)',
  500: 'hsl(187 85% 45%)',
  600: 'hsl(187 85% 38%)',
  700: 'hsl(187 85% 31%)',
  800: 'hsl(187 80% 25%)',
  900: 'hsl(187 75% 20%)',
  950: 'hsl(187 80% 12%)',
}
const brandAlt = {
  50: 'hsl(192 90% 96%)',
  100: 'hsl(192 88% 90%)',
  200: 'hsl(192 86% 80%)',
  300: 'hsl(192 88% 68%)',
  400: 'hsl(192 80% 52%)',
  500: 'hsl(192 80% 43%)',
  600: 'hsl(192 82% 35%)',
  700: 'hsl(192 82% 29%)',
  800: 'hsl(192 78% 24%)',
  900: 'hsl(192 72% 19%)',
  950: 'hsl(192 78% 11%)',
}
const neutral = {
  50: 'hsl(210 30% 98%)',
  100: 'hsl(213 25% 95%)',
  200: 'hsl(213 20% 88%)',
  300: 'hsl(213 16% 78%)',
  400: 'hsl(214 14% 60%)',
  500: 'hsl(214 14% 46%)',
  600: 'hsl(214 18% 36%)',
  700: 'hsl(214 22% 26%)',
  800: 'hsl(213 24% 17%)',
  900: 'hsl(213 22% 11%)',
  950: 'hsl(214 32% 7%)',
}

module.exports = {
  content: ['./src/**/*.{html,js,jsx}'],
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        primary,
        blue: primary,
        indigo: brandAlt,
        slate: neutral,
        gray: neutral
      }
    }
  }
}
