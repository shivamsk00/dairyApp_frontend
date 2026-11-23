/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { Fragment } from 'react'
import { ArrowLeft } from 'lucide-react'
import ActionLink from '../primitives/ActionLink'
import IconButton from '../primitives/IconButton'
import '../ui.css'

/**
 * Page title bar with a breadcrumb trail on the right.
 *
 * @param {string} title Page name shown on the left.
 * @param {Array<{label: string, to?: string, href?: string}>} [items] Trail from root to the current
 *   page; the last item is rendered as plain text. Example:
 *   [{ label: 'Dashboard', to: '/' }, { label: 'Customers' }]
 * @param {() => void} [onBack] Shows a back arrow before the title and calls this when clicked.
 * @param {React.ReactNode} [actions] Optional buttons rendered next to the title.
 */
const Breadcrumb = ({ title, items = [], onBack, actions }) => (
  <div className="ui-bg-sunken ui-border-subtle border-b px-4 py-3 lg:px-6">
    <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        {onBack && <IconButton icon={ArrowLeft} label="Back" onClick={onBack} />}
        <h2 className="ui-font-display text-[13px] font-bold uppercase tracking-wide">{title}</h2>
        {actions}
      </div>
      {items.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] font-medium">
          {items.map((item, index) => {
            const last = index === items.length - 1
            return (
              <Fragment key={`${item.label}-${index}`}>
                {last || (!item.to && !item.href) ? (
                  <span className="ui-text-tertiary" aria-current={last ? 'page' : undefined}>
                    {item.label}
                  </span>
                ) : (
                  <ActionLink
                    to={item.to}
                    end
                    href={item.href}
                    activeClassName=""
                    className="ui-text-brand"
                  >
                    {item.label}
                  </ActionLink>
                )}
                {!last && <span className="ui-text-tertiary">/</span>}
              </Fragment>
            )
          })}
        </nav>
      )}
    </div>
  </div>
)

export default Breadcrumb
