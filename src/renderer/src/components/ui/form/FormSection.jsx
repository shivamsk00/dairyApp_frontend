/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import SectionCard from '../dashboard/SectionCard'

const COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
}

/**
 * A titled card holding a responsive grid of fields.
 *
 * @param {React.ReactNode} title
 * @param {React.ReactNode} [subtitle]
 * @param {React.ComponentType} [icon]
 * @param {string} [tone='primary'] Icon tile tone.
 * @param {1|2|3|4} [cols=3] Columns from the lg breakpoint (fewer on smaller screens).
 *   Give a field `fieldClassName="col-span-full"` to make it span the whole row.
 */
const FormSection = ({ title, subtitle, icon, tone, cols = 3, className, children }) => (
  <SectionCard title={title} subtitle={subtitle} icon={icon} tone={tone} className={className}>
    <div className={`grid gap-4 ${COLUMNS[cols] ?? COLUMNS[3]}`}>{children}</div>
  </SectionCard>
)

export default FormSection
