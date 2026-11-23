/**
 * Offline text reading (OCR) for the app. Runs in the main process so it works with no internet:
 * the English data file ships in resources/ocr (5 MB).
 *
 * Kept light on purpose:
 *  - the engine is loaded only when a scan starts (dynamic import) and is shut down when it ends,
 *    so it costs no memory or start-up time the rest of the time;
 *  - one scan at a time;
 *  - it only reads digits and dots, which is all a price list needs.
 *
 * Inside Electron the OCR library insists on loading its language file from a web address, so the data
 * file is handed over by a tiny server that listens on 127.0.0.1 only (never the network) and lives just
 * for the length of one scan.
 */
import { createServer } from 'http'
import { createReadStream, existsSync } from 'fs'
import { join } from 'path'

const SAFE_FILE = /^[a-z_]+\.traineddata$/

/** Serve the files of `dir` on a random loopback port. Resolves { url, close }. */
function serveLanguageData(dir) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const name = decodeURIComponent((req.url || '').split('?')[0]).replace(/^\//, '')
      const file = join(dir, name)
      if (!SAFE_FILE.test(name) || !existsSync(file)) {
        res.writeHead(404).end()
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/octet-stream' })
      createReadStream(file).pipe(res)
    })
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise((done) => server.close(() => done()))
      })
    })
  })
}

export function createOcrService({ app, isDev, log = console, send }) {
  let busy = false

  const dataDir = () =>
    isDev ? join(app.getAppPath(), 'resources', 'ocr') : join(process.resourcesPath, 'resources', 'ocr')

  /** @param {Uint8Array[]} chunks PNG images, one per block of table lines. @returns {Promise<string[]>} text per chunk */
  async function recognize(chunks) {
    if (busy) throw new Error('A scan is already running.')
    busy = true
    let worker = null
    let languageServer = null
    try {
      languageServer = await serveLanguageData(dataDir())
      const { createWorker } = await import('tesseract.js')
      worker = await createWorker('eng', 1, {
        langPath: languageServer.url,
        gzip: false,
        cacheMethod: 'none'
      })
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789. ',
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: '6'
      })
      const texts = []
      for (let i = 0; i < chunks.length; i++) {
        const { data } = await worker.recognize(Buffer.from(chunks[i]))
        texts.push(data.text)
        send({ done: i + 1, total: chunks.length })
      }
      return texts
    } catch (error) {
      log.error('OCR failed:', error)
      throw error
    } finally {
      busy = false
      if (worker) await worker.terminate().catch(() => {})
      if (languageServer) await languageServer.close()
    }
  }

  return { recognize, isBusy: () => busy }
}
