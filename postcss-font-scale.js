/**
 * Makes every font size in the app follow the user's font-size setting (Settings -> Appearance).
 *
 * After Tailwind has generated the CSS, each `font-size` / `line-height` written in px or rem (Tailwind
 * classes such as `text-sm` or `text-[13px]`, and the hand-written kit CSS) is wrapped like this:
 *
 *   font-size: 13px   ->   font-size: calc(13px * var(--ui-font-scale, 1))
 *
 * `--ui-font-scale` is 1 unless the user changed it, so the default look is untouched. The variable is set
 * from helper/fontScale.js, and the sidebar overrides it (see `.ui-sidebar-scope` in ui.css).
 */
const SIZE = /^(-?\d*\.?\d+)(px|rem)$/

const plugin = () => ({
  postcssPlugin: 'postcss-font-scale',
  OnceExit(root) {
    root.walkDecls(/^(font-size|line-height)$/, (decl) => {
      const value = decl.value.trim()
      if (value.includes('--ui-font-scale')) return
      const match = value.match(SIZE)
      if (!match) return
      decl.value = `calc(${match[1]}${match[2]} * var(--ui-font-scale, 1))`
    })
  }
})
plugin.postcss = true

module.exports = plugin
