/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import ActionLink from '../primitives/ActionLink'
import '../ui.css'

/**
 * Page footer: copyright on the left, links on the right.
 *
 * @param {React.ReactNode} copyright e.g. <>© 2025 · Powered by <strong>Production House</strong></>
 * @param {Array<{label: string, to?: string, href?: string, onClick?: () => void}>} [links]
 */
const AppFooter = ({ copyright, links = [] }) => (
  <footer className="ui-bg-raised ui-border-subtle ui-text-tertiary flex flex-col items-center justify-between gap-2 border-t px-4 py-4 text-[12px] sm:flex-row lg:px-6">
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
