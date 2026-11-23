module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Must stay after tailwindcss: it rewrites the font sizes Tailwind generates.
    './postcss-font-scale.js': {}
  }
}
