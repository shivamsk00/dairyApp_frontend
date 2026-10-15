/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import ActionLink from '../primitives/ActionLink'
import cx from '../utils/cx'
import '../ui.css'

/**
 * Page footer: copyright on the left, links on the right.
 *
 * @param {React.ReactNode} copyright e.g. <>© 2025 · Powered by <strong>Production House</strong></>
 * @param {Array<{label: string, to?: string, href?: string, onClick?: () => void}>} [links]
 * @param {boolean} [bare] No background or border: plain text on whatever is behind it.
 * @param {boolean} [compact] Slim single-row bar (about 28px tall) for app shells.
 */
const AppFooter = ({ copyright, links = [], compact = false, bare = false }) => (
  <footer
    className={cx(
      'ui-text-tertiary flex items-center justify-between',
      bare ? 'bg-transparent' : 'ui-bg-raised ui-border-subtle border-t',
      compact
        ? 'gap-2 px-3 py-1.5 text-[11px] leading-none'
        : 'flex-col gap-2 px-4 py-4 text-[12px] sm:flex-row lg:px-6'
    )}
  >
    <p>{copyright}</p>
    {links.length > 0 && (
      <div className="flex items-center gap-4">
        {links.map((link) => (
          <ActionLink
            key={link.label}
            to={link.to}
            href={link.href}
            onClick={link.onClick}
            activeClassName=""
            className="hover:underline"
          >
            {link.label}
          </ActionLink>
        ))}
      </div>
    )}
  </footer>
)

export default AppFooter
