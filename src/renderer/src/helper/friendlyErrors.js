import { toast } from 'react-toastify'

/**
 * Friendly error toasts.
 *
 * Many screens do `res.status_code` on a response that is null because the request failed, and then show
 * the JavaScript error ("Cannot read properties of null…") in a toast. This module
 *   1. remembers the last API failure (axios interceptor -> rememberApiError) as a plain-language message,
 *   2. wraps `toast.error` so a technical message is replaced by that message (the backend's own message
 *      when it sent one), and
 *   3. stays silent while the "Session expired" popup is explaining what happened.
 */
const RECENT_MS = 20000
const TECHNICAL =
  /sqlstate|connection refused|select \* from|cannot read propert|cannot destructure|is not a function|is not iterable|is not defined|undefined is not|null is not|of undefined|of null|unexpected token|failed to fetch|network ?error|request failed with status|timeout of \d+ms/i

let last = null // { status, message, sessionLost, at }

const fromResponse = (error) => {
  const status = error?.response?.status
  const data = error?.response?.data
  const backend =
    typeof data?.message === 'string'
      ? data.message
      : typeof data?.error === 'string'
        ? data.error
        : ''

  if (!error?.response)
    return "Can't reach the server. Check your internet connection and try again."
  if (status === 401) return 'Your session has expired. Please log in again.'
  if (status === 403) return backend || 'You do not have permission to do this.'
  if (status === 404) return backend || 'The requested item was not found.'
  if (status >= 500) return 'The server had a problem. Please try again in a moment.'
  return backend || 'Something went wrong. Please try again.'
}

/** Called by the axios response interceptor for every failed request. */
export const rememberApiError = (error) => {
  const status = error?.response?.status ?? 0
  last = {
    status,
    message: fromResponse(error),
    // A 401 on a request that carried a token means the session ended (a 401 from the login form does not).
    sessionLost: status === 401 && Boolean(error?.config?.headers?.Authorization),
    at: Date.now()
  }
}

export const clearApiError = () => {
  last = null
}

const recent = () => (last && Date.now() - last.at < RECENT_MS ? last : null)

const asText = (content) => {
  if (typeof content === 'string') return content
  if (content && typeof content.message === 'string') return content.message
  return null
}

/** What to show instead of `content`: a string, or null for "show nothing". Exported for tests. */
export const friendlyContent = (content, sessionPopupOpen = false) => {
  // The popup already tells the user to log in again; error toasts underneath it are just noise.
  if (sessionPopupOpen || recent()?.sessionLost) return null

  const text = asText(content)
  if (text === null) return content // JSX or something else: leave it alone
  if (!TECHNICAL.test(text)) return text

  return recent()?.message || 'Something went wrong. Please try again.'
}

let installed = false

/** Wrap toast.error once, at startup. `isSessionPopupOpen` comes from helper/sessionExpired. */
export const installFriendlyToasts = (isSessionPopupOpen) => {
  if (installed) return
  installed = true
  const original = toast.error.bind(toast)
  toast.error = (content, options) => {
    const next = friendlyContent(content, isSessionPopupOpen())
    return next === null ? null : original(next, options)
  }
}
