/* eslint-disable react/prop-types -- internal component; props are documented inline */
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertTriangle, Check, Download, Loader2, RefreshCw, X } from 'lucide-react'
import useUpdateStore from '../zustand/useUpdateStore'
import { Button, IconBadge, IconButton, SurfaceCard } from './ui'

const Spinner = (props) => <Loader2 {...props} className="animate-spin" />

const formatBytes = (bytes = 0) => {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

const ProgressBar = ({ percent }) => (
  <div className="ui-bg-sunken mt-3 h-2 overflow-hidden rounded-full">
    <div
      className={`ui-bg-brand h-full rounded-full transition-all duration-500 ${
        percent === null ? 'w-1/3 animate-pulse' : ''
      }`}
      style={percent === null ? undefined : { width: `${percent}%` }}
    />
  </div>
)

// Per-state copy and look.
const describe = (status) => {
  const version = status.version ? `v${status.version}` : 'the latest version'
  switch (status.state) {
    case 'checking':
      return {
        icon: Spinner,
        tone: 'info',
        title: 'Checking for updates',
        text: `You are on v${status.currentVersion}.`,
        progress: null
      }
    case 'up-to-date':
      return {
        icon: Check,
        tone: 'success',
        title: "You're up to date",
        text: `v${status.currentVersion} is the latest version.`,
        dismissible: true
      }
    case 'available':
      return {
        icon: Download,
        tone: 'info',
        title: 'Update available',
        text: `${version} is ready. Nothing is downloaded until you press Update.`,
        offer: true
      }
    case 'downloading': {
      const known = status.total > 0
      return {
        icon: Download,
        tone: 'primary',
        title: `Downloading ${version}`,
        text: known
          ? `${formatBytes(status.transferred)} of ${formatBytes(status.total)}${
              status.bytesPerSecond ? ` · ${formatBytes(status.bytesPerSecond)}/s` : ''
            }`
          : 'Starting the download…',
        progress: known ? status.percent : null,
        percent: known ? status.percent : null
      }
    }
    case 'downloaded':
      return {
        icon: Check,
        tone: 'success',
        title: 'Update ready to install',
        text: status.autoInstall
          ? `${version} has been downloaded. Installing now, the app will restart.`
          : `${version} has been downloaded. Restart the app to finish updating.`,
        ready: !status.autoInstall,
        progress: status.autoInstall ? null : undefined
      }
    case 'error':
      return {
        icon: AlertTriangle,
        tone: 'danger',
        title: status.version ? `Couldn't download ${version}` : "Couldn't check for updates",
        text: status.message,
        failed: true,
        dismissible: true
      }
    default:
      return null
  }
}

/** Floating update card shown on every page of the signed-in app. */
const UpdateNotifier = () => {
  const status = useUpdateStore((state) => state.status)
  const dismissed = useUpdateStore((state) => state.dismissed)
  const { init, checkNow, dismiss, restartAndInstall, showReadyCard, startUpdate } = useUpdateStore.getState()
  const { pathname } = useLocation()

  useEffect(() => {
    init()
  }, [init])

  const view = describe(status)
  if (!view) return null

  // On the dashboard the "Update available" notice is a banner at the top of the page instead.
  if (view.offer && (pathname === '/' || pathname === '/dashboard')) return null

  // "Later" on an available update shrinks it to a pill, so updating is still one click away.
  if (view.offer && dismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-[80]">
        <Button size="sm" icon={Download} className="!rounded-full shadow-lg" onClick={showReadyCard}>
          Update available · v{status.version}
        </Button>
      </div>
    )
  }

  // "Later" shrinks the ready card to a pill, so installing is still one click away.
  if (view.ready && dismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-[80]">
        <Button
          size="sm"
          icon={RefreshCw}
          className="!rounded-full shadow-lg"
          onClick={showReadyCard}
        >
          Update ready · v{status.version}
        </Button>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[80] w-[22rem] max-w-[calc(100vw-2rem)]"
    >
      <SurfaceCard className="ui-animate-rise-in ui-shadow-xl relative overflow-hidden p-4">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--ui-primary-400),var(--ui-primary-600)_55%,var(--ui-accent-500))]" />
        <div className="flex items-start gap-3">
          <IconBadge icon={view.icon} tone={view.tone} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="ui-font-display text-[13.5px] font-bold leading-snug">{view.title}</p>
              {view.percent != null && (
                <span className="ui-text-brand shrink-0 text-[12px] font-bold">
                  {view.percent}%
                </span>
              )}
            </div>
            <p className="ui-text-tertiary mt-0.5 text-[12px] leading-snug">{view.text}</p>
          </div>
          {(view.dismissible || view.ready || view.offer) && (
            <IconButton
              icon={X}
              label="Dismiss"
              iconSize={14}
              className="!size-7 shrink-0"
              onClick={dismiss}
            />
          )}
        </div>

        {view.progress !== undefined && <ProgressBar percent={view.progress} />}

        {view.offer && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" icon={Download} className="flex-1" onClick={startUpdate}>
              Update
            </Button>
            <Button size="sm" variant="secondary" onClick={dismiss}>
              Later
            </Button>
          </div>
        )}
        {view.ready && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" icon={RefreshCw} className="flex-1" onClick={restartAndInstall}>
              Restart &amp; install
            </Button>
            <Button size="sm" variant="secondary" onClick={dismiss}>
              Later
            </Button>
          </div>
        )}
        {view.failed && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" icon={RefreshCw} className="flex-1" onClick={checkNow}>
              Try again
            </Button>
            <Button size="sm" variant="secondary" onClick={dismiss}>
              Dismiss
            </Button>
          </div>
        )}
      </SurfaceCard>
    </div>
  )
}

export default UpdateNotifier
