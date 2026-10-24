/**
 * Auto-update state machine for the main process.
 *
 * Wraps electron-updater and publishes ONE structured status object to the renderer instead of
 * free-text messages:
 *
 *   { state, currentVersion, version, percent, transferred, total, bytesPerSecond, message }
 *
 *   state: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'up-to-date' | 'error'
 *
 * Nothing is ever downloaded on its own: a check that finds a newer version only reports 'available'.
 * The user presses Update; that starts the download and, once it has finished, the install.
 *
 * It also guards against overlapping checks / double downloads, and keeps background checks quiet
 * (a failed or empty background check never shows anything; only a user-started check does).
 */

const UP_TO_DATE_VISIBLE_MS = 6000

const BASE = {
  state: 'idle',
  version: null,
  percent: 0,
  transferred: 0,
  total: 0,
  bytesPerSecond: 0,
  message: ''
}

/** Turn a raw updater error into a sentence a person can act on. */
export function friendlyUpdateError(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? error ?? ''}`
  if (
    /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ERR_INTERNET_DISCONNECTED|ERR_NETWORK|net::ERR/i.test(
      text
    )
  ) {
    return 'Could not reach the update server. Check your internet connection and try again.'
  }
  if (/404|Cannot find|latest\.yml|No published versions/i.test(text)) {
    return 'No update information was found for this release.'
  }
  if (/sha512|checksum|signature/i.test(text)) {
    return 'The downloaded update failed verification. Please try again.'
  }
  return 'Something went wrong while updating. Please try again.'
}

/**
 * @param {object} deps
 * @param {import('electron-updater').AppUpdater} deps.autoUpdater
 * @param {() => string} deps.currentVersion
 * @param {(status: object) => void} deps.send Delivers a status to the renderer.
 * @param {{info: Function, error: Function}} [deps.log]
 */
export function createUpdateManager({ autoUpdater, currentVersion, send, log = console }) {
  let status = { ...BASE, currentVersion: currentVersion() }
  let busy = false // a check or a download is in flight
  let userStarted = false // the in-flight check was started by the user
  let installAfterDownload = false // the user pressed Update: install as soon as the download ends
  let idleTimer = null

  const publish = (state, extra = {}) => {
    clearTimeout(idleTimer)
    status = { ...BASE, currentVersion: currentVersion(), state, ...extra }
    send(status)
  }

  const fail = (error) => {
    if (!busy) return // already handled (the updater reports errors twice: rejection + event)
    busy = false
    installAfterDownload = false
    log.error('Update error:', error)
    const quiet = status.state === 'checking' && !userStarted
    if (quiet) {
      publish('idle')
    } else {
      publish('error', { version: status.version, message: friendlyUpdateError(error) })
    }
  }

  function download() {
    if (status.state === 'downloading' || status.state === 'downloaded') return
    installAfterDownload = true
    busy = true
    publish('downloading', { version: status.version })
    autoUpdater.downloadUpdate().catch(fail)
  }

  async function check({ manual = false } = {}) {
    // An update is already waiting for the user's decision (or is being installed): keep showing it.
    if (busy || status.state === 'downloaded' || status.state === 'available') return status
    busy = true
    userStarted = manual
    publish('checking')
    try {
      const result = await autoUpdater.checkForUpdates()
      if (!result) {
        // electron-updater does nothing in development / unpackaged builds.
        busy = false
        if (manual) {
          publish('error', { message: 'Updates can only be checked in the installed app.' })
        } else {
          publish('idle')
        }
      }
    } catch (error) {
      fail(error)
    }
    return status
  }

  function registerEvents() {
    autoUpdater.on('update-available', (info) => {
      // A download is already running (or finished): don't reset it or start a second one.
      if (status.state === 'downloading' || status.state === 'downloaded') return
      log.info('Update available:', info.version)
      busy = false
      publish('available', { version: info.version })
    })

    autoUpdater.on('update-not-available', () => {
      busy = false
      if (userStarted) {
        publish('up-to-date')
        idleTimer = setTimeout(() => publish('idle'), UP_TO_DATE_VISIBLE_MS)
        idleTimer.unref?.()
      } else {
        publish('idle')
      }
    })

    autoUpdater.on('download-progress', (progress) => {
      publish('downloading', {
        version: status.version,
        percent: Math.round(progress.percent),
        transferred: progress.transferred,
        total: progress.total,
        bytesPerSecond: progress.bytesPerSecond
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info.version)
      busy = false
      publish('downloaded', { version: info.version, percent: 100, autoInstall: installAfterDownload })
      if (installAfterDownload) {
        installAfterDownload = false
        // A short pause so the "Installing…" message is seen before the app closes.
        setTimeout(() => autoUpdater.quitAndInstall(false, true), 1500)
      }
    })

    autoUpdater.on('error', fail)
  }

  return {
    registerEvents,
    check,
    download,
    getStatus: () => status,
    install: () => autoUpdater.quitAndInstall(false, true),
    /** Hide a finished message (up-to-date / error). A downloaded update stays until installed. */
    dismiss: () => {
      if (status.state === 'up-to-date' || status.state === 'error') publish('idle')
    }
  }
}
