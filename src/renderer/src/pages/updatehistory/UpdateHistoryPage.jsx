import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownToLine,
  CircleCheck,
  History,
  Loader2,
  PauseCircle,
  RefreshCw,
  Rocket,
  Undo2
} from 'lucide-react'
import {
  Badge,
  Breadcrumb,
  Button,
  ConfirmActionModal,
  DataTable,
  KpiCard,
  SurfaceCard,
  useDocumentTitle
} from '../../components/ui'

// The list shows the latest published updates, newest first.
const MAX_VERSIONS_SHOWN = 10

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-'
const formatSize = (bytes) => (bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : '-')
const shorten = (text, max = 110) => {
  const clean = (text || '').replace(/[#*`>_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max)}…` : clean || 'No release notes'
}

/**
 * Version control: every version published on GitHub, with a button to install any of them. Moving
 * back to an older version is a "roll back" and keeps the app on that version until updates are resumed.
 */
const UpdateHistoryPage = () => {
  useDocumentTitle('Version Control')

  const [versions, setVersions] = useState([])
  const [currentVersion, setCurrentVersion] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [stale, setStale] = useState(false)
  const [pin, setPin] = useState(null)
  const [target, setTarget] = useState(null) // version waiting for confirmation
  const [install, setInstall] = useState({ state: 'idle' })
  const [checking, setChecking] = useState(false)
  const [checkMessage, setCheckMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const api = window.api
    const [result, pinned] = await Promise.all([api?.listVersions?.(), api?.getVersionPin?.()])
    if (result?.success) {
      setVersions(result.versions)
      setStale(!!result.stale)
    } else {
      setVersions([])
      setLoadError(result?.message || 'Could not load versions.')
    }
    setCurrentVersion(result?.currentVersion || (await api?.getAppVersion?.()) || '')
    setPin(pinned || null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    return window.api?.onVersionInstallStatus?.(setInstall)
  }, [load])

  const busy = install.state === 'downloading' || install.state === 'launching'

  const confirmInstall = async () => {
    const version = target.version
    setTarget(null)
    setInstall({ state: 'downloading', version, percent: 0 })
    const result = await window.api.installVersion(version)
    if (!result?.success) setInstall({ state: 'error', version, message: result?.message })
  }

  const resumeUpdates = async () => {
    await window.api.clearVersionPin()
    setPin(null)
  }

  const checkForUpdates = async () => {
    setChecking(true)
    setCheckMessage('')
    const res = await window.api?.checkForUpdate?.()
    const state = res?.status?.state
    setCheckMessage(
      state === 'up-to-date'
        ? 'You are on the latest version.'
        : state === 'error'
          ? res.status.message
          : 'Looking for a newer version…'
    )
    setChecking(false)
  }

  const latest = useMemo(() => versions.find((v) => v.isLatest), [versions])
  // The 10 latest updates, newest first. The version in use is always listed, even if it is older than that.
  const visible = useMemo(() => {
    const latestTen = versions.slice(0, MAX_VERSIONS_SHOWN)
    const current = versions.find((v) => v.relation === 'current')
    return current && !latestTen.includes(current) ? [...latestTen, current] : latestTen
  }, [versions])
  const isRollback = target && target.relation === 'older'

  const columns = [
    {
      key: 'version',
      header: 'Version',
      render: (v) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold">v{v.version}</span>
          {v.isCurrent && <Badge tone="success">Installed</Badge>}
          {v.isLatest && <Badge tone="primary" dot={false}>Latest</Badge>}
          {v.prerelease && <Badge tone="warning" dot={false}>Pre-release</Badge>}
        </div>
      )
    },
    { key: 'publishedAt', header: 'Released', render: (v) => formatDate(v.publishedAt) },
    { key: 'size', header: 'Size', render: (v) => formatSize(v.size) },
    {
      key: 'notes',
      header: "What's new",
      render: (v) => (
        <span className="ui-text-secondary text-[12.5px]" title={v.notes}>
          {shorten(v.notes)}
        </span>
      )
    },
    {
      key: 'action',
      header: '',
      className: 'text-right',
      render: (v) =>
        v.isCurrent ? (
          <span className="ui-text-tertiary text-[12px]">In use</span>
        ) : (
          <Button
            size="sm"
            variant={v.relation === 'older' ? 'secondary' : 'primary'}
            icon={v.relation === 'older' ? Undo2 : ArrowDownToLine}
            disabled={busy}
            onClick={() => setTarget(v)}
          >
            {v.relation === 'older' ? 'Roll back' : 'Update'}
          </Button>
        )
    }
  ]

  return (
    <div className="w-full">
      <Breadcrumb
        title="Version Control"
        items={[{ label: 'Home', to: '/' }, { label: 'Version Control' }]}
        actions={
          <>
            <Button size="sm" variant="secondary" icon={RefreshCw} onClick={load} disabled={loading || busy}>
              Refresh
            </Button>
            <Button size="sm" icon={Rocket} onClick={checkForUpdates} loading={checking} disabled={busy}>
              Check for updates
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <KpiCard label="Installed version" value={currentVersion ? `v${currentVersion}` : '-'} icon={CircleCheck} tone="success" />
          <KpiCard label="Latest version" value={latest ? `v${latest.version}` : '-'} icon={Rocket} tone="primary" />
          <KpiCard label="Published versions" value={versions.length} icon={History} tone="info" />
          <KpiCard
            label="Automatic updates"
            value={pin ? 'Paused' : 'On'}
            icon={PauseCircle}
            tone={pin ? 'warning' : 'success'}
          />
        </div>

        {checkMessage && <p className="ui-text-secondary text-[13px]">{checkMessage}</p>}

        {pin && (
          <SurfaceCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[14px] font-bold">Automatic updates are paused on v{pin.version}</p>
              <p className="ui-text-secondary text-[12.5px]">
                You rolled back to this version, so the app will not update itself until you resume.
              </p>
            </div>
            <Button variant="secondary" onClick={resumeUpdates} disabled={busy}>
              Resume automatic updates
            </Button>
          </SurfaceCard>
        )}

        {install.state !== 'idle' && (
          <SurfaceCard className="p-4">
            {install.state === 'error' ? (
              <p className="text-[13px] text-[color:var(--ui-danger-600)]">{install.message}</p>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  {install.state === 'launching'
                    ? `Opening the v${install.version} installer… the app will close.`
                    : `Downloading v${install.version}… ${install.percent ?? 0}%`}
                </div>
                <div className="ui-bg-sunken h-2 overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-[color:var(--ui-primary-600)] transition-all"
                    style={{ width: `${install.percent ?? 0}%` }}
                  />
                </div>
              </>
            )}
          </SurfaceCard>
        )}

        <SurfaceCard className="overflow-hidden">
          <div className="ui-border-subtle border-b p-4">
            <h2 className="ui-font-display text-[15px] font-bold">Latest updates</h2>
            <p className="ui-text-tertiary text-[12px]">
              The last {MAX_VERSIONS_SHOWN} updates, newest first. You can move to any of them at any time.
              {stale && ' (Offline: showing the last loaded list.)'}
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-12">
              <Loader2 size={20} className="ui-text-brand animate-spin" aria-hidden="true" />
              <span className="ui-text-secondary text-[13px]">Loading versions…</span>
            </div>
          ) : loadError ? (
            <p className="ui-text-secondary p-8 text-center text-[13px]">{loadError}</p>
          ) : (
            <DataTable
              className="px-2"
              minWidth="760px"
              striped
              columns={columns}
              rows={visible}
              rowKey={(v) => v.tag}
              emptyMessage="No published versions found"
            />
          )}
        </SurfaceCard>
      </div>

      <ConfirmActionModal
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={confirmInstall}
        title={isRollback ? `Roll back to v${target?.version}?` : `Update to v${target?.version}?`}
        tone={isRollback ? 'warning' : 'primary'}
        confirmLabel={isRollback ? 'Roll back' : 'Update'}
        message={
          <>
            The installer for <strong>v{target?.version}</strong> will be downloaded and opened, and this app
            will close. Your saved data is kept.
            {isRollback &&
              ' Automatic updates will stay paused on that version until you resume them on this page.'}
          </>
        }
      />
    </div>
  )
}

export default UpdateHistoryPage
