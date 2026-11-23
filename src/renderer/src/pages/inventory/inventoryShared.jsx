/* eslint-disable react/prop-types -- StatusToggle is a small internal helper */
import { Badge } from '../../components/ui'

/** Active / Inactive pill. Pass `onClick` to make it a button that opens the status-change dialog. */
export const StatusToggle = ({ status, onClick }) => {
  const badge = (
    <Badge tone={status == 1 ? 'success' : 'danger'} dot={false}>
      {status == 1 ? 'Active' : 'Inactive'}
    </Badge>
  )
  if (!onClick) return badge
  return (
    <button type="button" onClick={onClick} title="Change status" className="rounded-full">
      {badge}
    </button>
  )
}
