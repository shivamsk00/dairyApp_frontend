import { useNavigate } from 'react-router-dom'
import { LogIn, ShieldAlert } from 'lucide-react'
import useAuthStore from '../zustand/useAuthStore'
import { dismissSessionExpired, useSessionExpired } from '../helper/sessionExpired'
import { Button, IconBadge, Modal } from './ui'

/** Popup shown when the server rejects the login token (401). The only way forward is to log in again. */
const SessionExpiredModal = () => {
  const open = useSessionExpired()
  const nav = useNavigate()

  const goToLogin = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch {
      /* storage unavailable: the store reset below still logs the user out for this session */
    }
    useAuthStore.setState({ user: {}, token: '' })
    dismissSessionExpired()
    nav('/login', { replace: true })
  }

  return (
    <Modal
      isOpen={open}
      onClose={goToLogin}
      ariaLabel="Session expired"
      maxWidth="26rem"
      dismissible={false}
      className="flex flex-col items-center p-7 text-center"
    >
      <IconBadge
        icon={ShieldAlert}
        tone="warning"
        variant="tint"
        size="xl"
        shape="circle"
        className="mb-4"
      />
      <h2 className="ui-font-display text-[18px] font-extrabold">Session expired</h2>
      <p className="ui-text-secondary mt-2 text-[13.5px]">
        You have been signed out, or your login is no longer valid. Please log in again to continue.
      </p>
      <Button icon={LogIn} fullWidth className="mt-6" onClick={goToLogin} autoFocus>
        Log in
      </Button>
    </Modal>
  )
}

export default SessionExpiredModal
