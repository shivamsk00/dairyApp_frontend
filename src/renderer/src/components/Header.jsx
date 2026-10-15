import { FolderPlus, KeyRound, Package, PackagePlus, RefreshCw, UserPlus } from 'lucide-react'
import useAuthStore from '../zustand/useAuthStore'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { clearAllCustomersFromDB } from '../helper/db'
import { AppHeader } from './ui'

const QUICK_ACTIONS = [
  { label: 'Add Customer', icon: UserPlus, to: '/addCustomer' },
  { label: 'Add Product', icon: Package, to: '/AddProductPage' },
  { label: 'Add Stock', icon: PackagePlus, to: '/addStock' },
  { label: 'Add Category', icon: FolderPlus, to: '/addcategory' }
]

const Header = () => {
  const logout = useAuthStore((state) => state.logout)
  const loading = useAuthStore((state) => state.loading)
  const user = useAuthStore((state) => state.user)
  const nav = useNavigate()

  const handleLogout = async () => {
    if (loading) return
    // Clear IndexedDB data first to ensure security and fresh state for next user
    await clearAllCustomersFromDB()

    const res = await logout()
    if (res?.status_code == 200) {
      toast(res.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        type: 'success'
      })
      window.api.logoutCloseAll()
    }
  }

  const handleLoginAgain = async () => {
    await clearAllCustomersFromDB()
    localStorage.clear()
    toast.success('Cleared previous data', {
      position: 'top-right',
      autoClose: 3000,
      theme: 'dark'
    })
    nav('login')
  }

  const email = user?.email || ''

  return (
    <AppHeader
      quickActions={QUICK_ACTIONS}
      showFullscreen
      user={{ name: email.split('@')[0] || 'User', email }}
      userMenu={[
        { label: 'Change Password', icon: KeyRound, tone: 'info', to: '/changePassword' },
        { label: 'Login Again', icon: RefreshCw, tone: 'warning', onClick: handleLoginAgain }
      ]}
      onSignOut={handleLogout}
    >
      {/* Keeps clear of the sidebar's floating menu button on small screens */}
      <span className="w-10 shrink-0 lg:hidden" aria-hidden="true" />
    </AppHeader>
  )
}

export default Header
