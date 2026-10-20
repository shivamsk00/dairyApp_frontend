import { Download, Loader2, Rocket } from 'lucide-react'
import useUpdateStore from '../zustand/useUpdateStore'
import { Button, IconBadge, SurfaceCard } from './ui'

/**
 * Dashboard banner for a new version. Nothing is downloaded until the user presses Update; then the
 * download runs here with its progress and the app installs and restarts by itself when it finishes.
 */
const UpdateAvailableBanner = () => {
  const status = useUpdateStore((state) => state.status)
  const startUpdate = useUpdateStore((state) => state.startUpdate)

  const version = status.version ? `v${status.version}` : 'a new version'
  const downloading = status.state === 'downloading'
  const installing = status.state === 'downloaded' && status.autoInstall

  if (status.state !== 'available' && !downloading && !installing) return null

  return (
    <SurfaceCard className="relative overflow-hidden p-4">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--ui-primary-400),var(--ui-primary-600)_55%,var(--ui-accent-500))]" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <IconBadge icon={downloading || installing ? Loader2 : Rocket} tone={downloading || installing ? 'primary' : 'info'} />
          <div>
            <p className="ui-font-display text-[14.5px] font-bold">
              {installing
                ? `Installing ${version}…`
                : downloading
                  ? `Downloading ${version}… ${status.percent ?? 0}%`
                  : 'Update available'}
            </p>
            <p className="ui-text-tertiary text-[12.5px]">
              {installing
                ? 'The app will restart in a moment.'
                : downloading
                  ? 'Please keep the app open. It installs and restarts when the download finishes.'
                  : `${version} is ready. You are on v${status.currentVersion}. Press Update when you are ready; it downloads, installs and restarts the app.`}
            </p>
          </div>
        </div>
        {status.state === 'available' && (
          <Button icon={Download} onClick={startUpdate}>
            Update to {version}
          </Button>
        )}
      </div>
      {downloading && (
        <div className="ui-bg-sunken mt-3 h-2 overflow-hidden rounded-full">
          <div
            className="ui-bg-brand h-full rounded-full transition-all duration-500"
            style={{ width: `${status.percent ?? 0}%` }}
          />
        </div>
      )}
    </SurfaceCard>
  )
}

export default UpdateAvailableBanner
