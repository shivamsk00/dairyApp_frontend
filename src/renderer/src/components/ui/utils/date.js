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
