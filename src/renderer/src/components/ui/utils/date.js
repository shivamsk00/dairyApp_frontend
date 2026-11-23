/**
 * Local calendar date helpers.
 *
 * Date#toISOString() is UTC, so `new Date().toISOString().split('T')[0]` returns *yesterday* between
 * midnight and 5:30 AM in India — exactly when morning milk is collected. Use these instead.
 */

/** YYYY-MM-DD for a Date, in the user's local time zone. */
export const toLocalISO = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** Today's local date as YYYY-MM-DD (the value an <input type="date"> expects). */
export const todayISO = () => toLocalISO(new Date())

/**
 * Normalise a date coming from the API (YYYY-MM-DD, an ISO timestamp, DD-MM-YYYY or DD/MM/YYYY) to the
 * YYYY-MM-DD an <input type="date"> needs. Returns '' when it cannot be read.
 */
export const toInputDate = (value) => {
  if (!value) return ''
  const text = String(value).trim()
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const dmy = text.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`
  return ''
}
