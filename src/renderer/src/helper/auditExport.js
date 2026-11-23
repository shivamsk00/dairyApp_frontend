import api from '../zustand/axiosConfig'

// Exports are built in the browser, so the server cannot see them. Tell it, so the export shows up
// in the audit log. Fire-and-forget: a failure here must never get in the way of the download.
const logExport = (report, format = 'xlsx', rows) => {
  const body = { report, format: String(format).toLowerCase() }
  if (Number.isInteger(rows) && rows >= 0) body.rows = rows
  api.post('/audit-logs/exports', body).catch(() => {})
}

export default logExport
