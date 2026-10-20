/**
 * Version control for the installed app: lists every version published on GitHub Releases and installs
 * any of them, newer or older ("roll back").
 *
 * Installing a chosen version = download that release's Setup .exe, then open it (Windows asks for
 * permission and runs the installer over the current one) and quit this app. Saved data lives outside
 * the install folder, so it is kept.
 *
 * Rolling back also "pins" the app on that version, so the background auto-updater does not move it
 * straight back to the newest release. The pin clears itself when the user resumes updates, installs
 * the newest version, or the running version no longer matches the pin.
 */
import { createWriteStream, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'

// DairyApp-Setup-1.3.2.exe  ->  1.3.2   (the .blockmap and latest.yml files do not match)
const SETUP_ASSET = /-Setup-(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)\.exe$/i

/** Compare "1.10.0" style versions. Returns >0 when a is newer than b. */
export function compareVersions(a, b) {
  const num = (v) => String(v).split('-')[0].split('.').map((n) => parseInt(n, 10) || 0)
  const [x, y] = [num(a), num(b)]
  for (let i = 0; i < 3; i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0)
  }
  return 0
}

/** Reduce GitHub's release list to the installable versions, newest first. */
export function toVersionList(releases, currentVersion) {
  const items = []
  for (const release of Array.isArray(releases) ? releases : []) {
    if (release.draft) continue
    const asset = (release.assets || []).find((a) => SETUP_ASSET.test(a.name))
    if (!asset) continue
    const version = asset.name.match(SETUP_ASSET)[1]
    items.push({
      version,
      tag: release.tag_name,
      name: release.name || release.tag_name,
      publishedAt: release.published_at || release.created_at,
      notes: (release.body || '').trim(),
      prerelease: !!release.prerelease,
      size: asset.size,
      assetName: asset.name,
      downloadUrl: asset.browser_download_url,
      pageUrl: release.html_url
    })
  }
  items.sort((a, b) => compareVersions(b.version, a.version))
  const latest = items.find((i) => !i.prerelease)?.version ?? items[0]?.version ?? null
  return items.map((item) => ({
    ...item,
    isCurrent: item.version === currentVersion,
    isLatest: item.version === latest,
    relation: compareVersions(item.version, currentVersion) > 0 ? 'newer' : item.version === currentVersion ? 'current' : 'older'
  }))
}

export function createVersionManager({ app, shell, repo, send, log = console, fetchFn = fetch }) {
  const pinFile = () => join(app.getPath('userData'), 'version-control.json')
  let busy = false
  let cache = null // last successful list, used if GitHub cannot be reached

  const publish = (status) => send({ version: null, percent: 0, transferred: 0, total: 0, message: '', ...status })

  // ---- pin ----
  function getPin() {
    try {
      return JSON.parse(readFileSync(pinFile(), 'utf8'))
    } catch {
      return null
    }
  }
  function setPin(version) {
    writeFileSync(pinFile(), JSON.stringify({ version, pinnedAt: new Date().toISOString() }))
  }
  function clearPin() {
    try {
      rmSync(pinFile(), { force: true })
    } catch {
      /* nothing to clear */
    }
  }
  /** A pin only makes sense while the pinned version is the one that is running. */
  function reconcilePin(currentVersion) {
    const pin = getPin()
    if (pin && pin.version !== currentVersion) clearPin()
  }

  // ---- list ----
  async function list() {
    try {
      const res = await fetchFn(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'dairyapp-version-control' }
      })
      if (!res.ok) throw new Error(`GitHub answered ${res.status}`)
      cache = await res.json()
      return { success: true, versions: toVersionList(cache, app.getVersion()), currentVersion: app.getVersion() }
    } catch (error) {
      log.error('Version list failed:', error)
      if (cache) {
        return {
          success: true,
          stale: true,
          versions: toVersionList(cache, app.getVersion()),
          currentVersion: app.getVersion()
        }
      }
      return {
        success: false,
        message: 'Could not load versions. Check your internet connection and try again.',
        versions: [],
        currentVersion: app.getVersion()
      }
    }
  }

  // ---- install ----
  async function install(version) {
    if (busy) return { success: false, message: 'Another version change is already running.' }
    busy = true
    let target = null
    try {
      const { success, versions } = await list()
      if (!success) throw new Error('offline')
      target = versions.find((v) => v.version === version)
      if (!target) return { success: false, message: `Version ${version} was not found.` }
      if (target.isCurrent) return { success: false, message: `Version ${version} is already installed.` }

      const dir = join(app.getPath('temp'), 'dairyapp-versions')
      mkdirSync(dir, { recursive: true })
      const file = join(dir, target.assetName)
      rmSync(file, { force: true })

      publish({ state: 'downloading', version, total: target.size })
      const res = await fetchFn(target.downloadUrl, { headers: { 'User-Agent': 'dairyapp-version-control' } })
      if (!res.ok || !res.body) throw new Error(`Download failed (${res.status})`)

      const out = createWriteStream(file)
      const reader = res.body.getReader()
      let received = 0
      let lastSent = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        received += value.length
        if (!out.write(Buffer.from(value))) await new Promise((r) => out.once('drain', r))
        const now = Date.now()
        if (now - lastSent > 150) {
          lastSent = now
          publish({
            state: 'downloading',
            version,
            transferred: received,
            total: target.size,
            percent: Math.round((received / target.size) * 100)
          })
        }
      }
      await new Promise((resolve, reject) => out.end((e) => (e ? reject(e) : resolve())))

      // A cut-off download would give a broken installer: refuse to run it.
      if (statSync(file).size !== target.size) throw new Error('The downloaded file is incomplete')

      // Moving to the newest release resumes normal updates; any other version stays pinned.
      if (target.isLatest) clearPin()
      else setPin(version)

      publish({ state: 'launching', version, percent: 100, total: target.size, transferred: target.size })
      const openError = await shell.openPath(file)
      if (openError) throw new Error(openError)
      setTimeout(() => app.quit(), 1500)
      return { success: true }
    } catch (error) {
      log.error('Version install failed:', error)
      const message = /offline|fetch failed|ENOTFOUND|ECONN|network/i.test(String(error?.message ?? error))
        ? 'Could not download this version. Check your internet connection and try again.'
        : `Could not install version ${version}: ${error?.message ?? error}`
      publish({ state: 'error', version, message })
      return { success: false, message }
    } finally {
      busy = false
    }
  }

  return { list, install, getPin, clearPin, reconcilePin, isBusy: () => busy }
}
