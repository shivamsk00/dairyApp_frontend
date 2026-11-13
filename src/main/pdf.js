/**
 * Saves a report as a PDF. Runs in the main process with Electron's own page printing, so it needs no extra
 * library and works offline.
 *
 * The page's HTML is drawn in a hidden window that cannot run scripts or reach the network, printed to an
 * A4 landscape PDF, and the user picks where to save it.
 */
import { BrowserWindow, dialog, app } from 'electron'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const MAX_HTML_BYTES = 20 * 1024 * 1024
const FOOTER = `<div style="width:100%;font:9px Arial,sans-serif;color:#666;text-align:right;padding-right:12mm">
  Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`

/** A file name that is safe on Windows: no path parts or reserved characters, ends in .pdf. */
const safeName = (name) => {
  const base = Array.from(String(name || 'Report').replace(/\.pdf$/i, ''), (c) =>
    c.charCodeAt(0) < 32 || '\\/:*?"<>|'.includes(c) ? '_' : c
  )
    .join('')
    .trim()
    .slice(0, 120)
  return `${base || 'Report'}.pdf`
}

/**
 * @param {BrowserWindow | null} parent window the save dialog belongs to
 * @param {{ html: string, fileName?: string, landscape?: boolean }} request  (landscape defaults to true)
 * @returns {Promise<{ success: true, path: string } | { success: false, canceled?: boolean, message?: string }>}
 */
export async function exportPdf(parent, { html, fileName, landscape = true }) {
  if (typeof html !== 'string' || !html.trim()) return { success: false, message: 'Nothing to export.' }
  if (Buffer.byteLength(html) > MAX_HTML_BYTES) return { success: false, message: 'The report is too large to export.' }

  // The hidden page gets its own throw-away session (no 'persist:' prefix = memory only). The no-network rule
  // below must never be set on the default session: that one is shared with the whole app.
  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      partition: `pdf-export-${Date.now()}`,
      sandbox: true,
      javascript: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  try {
    // No network at all for the hidden page (the report is plain HTML and CSS)
    window.webContents.session.webRequest.onBeforeRequest((details, done) =>
      done({ cancel: !details.url.startsWith('data:') })
    )
    await window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
    const pdf = await window.webContents.printToPDF({
      pageSize: 'A4',
      landscape: landscape !== false,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: FOOTER,
      margins: { top: 0.4, bottom: 0.55, left: 0.4, right: 0.4 } // inches
    })

    const target = await dialog.showSaveDialog(parent && !parent.isDestroyed() ? parent : undefined, {
      title: 'Save report as PDF',
      defaultPath: join(app.getPath('documents'), safeName(fileName)),
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    })
    if (target.canceled || !target.filePath) return { success: false, canceled: true }
    const path = /\.pdf$/i.test(target.filePath) ? target.filePath : `${target.filePath}.pdf`
    await writeFile(path, pdf)
    return { success: true, path }
  } catch (error) {
    return { success: false, message: error?.message || 'Could not create the PDF.' }
  } finally {
    if (!window.isDestroyed()) window.destroy()
  }
}
