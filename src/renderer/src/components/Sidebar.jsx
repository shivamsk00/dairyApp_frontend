import { useEffect, useState } from 'react'
import {
  Calculator,
  FileEdit,
  FileText,
  LayoutDashboard,
  Menu,
  Milk,
  Package,
  Settings,
  Users,
  X
} from 'lucide-react'
import { AppSidebar } from './ui'

const Sidebar = () => {
  const [isSecondWindowOpen, setIsSecondWindowOpen] = useState(false)
  const [isCustomerCollectionOpen, setIsCustomerCollectionOpen] = useState(false)
  const [isCashEntryOpen, setIsCashEntryOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [version, setVersion] = useState('')

  useEffect(() => {
    window.api?.getAppVersion?.().then(setVersion)
  }, [])

  useEffect(() => {
    window.api?.onSecondWindowClosed?.(() => {
      setIsSecondWindowOpen(false)
      setActiveItem(null)
    })
    window.api?.onCutomerWindowClosed?.(() => {
      setIsCustomerCollectionOpen(false)
      setActiveItem(null)
    })
    window.api?.onCashEntryWindowClosed?.(() => {
      setIsCashEntryOpen(false)
      setActiveItem(null)
    })
  }, [])

  // Items that open their own Electron window instead of navigating.
  const handleMilkCollectionClick = () => {
    if (isSecondWindowOpen) return
    window.api?.openSecondWindow?.()
    setIsSecondWindowOpen(true)
    setActiveItem('milk-collection')
  }

  const handleProductsSoldClick = () => {
    if (isCustomerCollectionOpen) return
    window.api?.openCusomerWindow?.()
    setIsCustomerCollectionOpen(true)
    setActiveItem('customer-collection')
  }

  const handleCashEntryClick = () => {
    if (isCashEntryOpen) return
    window.api?.openCashEntryWindow?.()
    setIsCashEntryOpen(true)
    setActiveItem('cashentry')
  }

  const sections = [
    {
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'milk-center',
          label: 'Milk Center',
          icon: Milk,
          children: [
            {
              id: 'milk-collection',
              label: 'Milk Collection',
              onClick: handleMilkCollectionClick,
              disabled: isSecondWindowOpen,
              active: activeItem === 'milk-collection'
            },
            { to: '/milkDispatch', label: 'Milk Dispatch' },
            { to: '/dailyMilkSale', label: 'Daily Milk Sale' },
            { to: '/alldairymaster', label: 'Head Dairy Master' },
            { to: '/ratechart', label: 'Rate Chart' },
            { to: '/snfchart', label: 'SNF Chart' }
          ]
        },
        {
          id: 'all-correction',
          label: 'All Correction',
          icon: FileEdit,
          children: [
            { to: '/milkCorrection', label: 'Milk' },
            { to: '/productCorrection', label: 'Product' },
            { to: '/cashCorrection', label: 'Cash' }
          ]
        },
        {
          id: 'accounts',
          label: 'Accounts',
          icon: Calculator,
          children: [
            { to: '/paymentregister', label: 'Payment Register' },
            {
              id: 'cashentry',
              label: 'Cash Entry',
              onClick: handleCashEntryClick,
              disabled: isCashEntryOpen,
              active: activeItem === 'cashentry'
            }
          ]
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: Users,
          children: [
            { to: '/customer', label: 'Customer' },
            { to: '/cmsubsidylist', label: 'CM Subsidy List' }
          ]
        },
        {
          id: 'products',
          label: 'Products',
          icon: Package,
          children: [
            { to: '/inventory', label: 'Inventory' },
            {
              id: 'customer-collection',
              label: 'Product Sell',
              onClick: handleProductsSoldClick,
              disabled: isCustomerCollectionOpen,
              active: activeItem === 'customer-collection'
            }
          ]
        },
        { to: '/reports', label: 'Reports', icon: FileText },
        { to: '/settings', label: 'Settings', icon: Settings }
      ]
    }
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen((open) => !open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AppSidebar
        sections={sections}
        collapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
        mobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        logo={
          <div>
            <h1 className="text-lg font-bold leading-tight text-white">सरस डेयरी</h1>
            <p className="text-[10.5px] text-white/60">Dairy Management</p>
          </div>
        }
        logoCollapsed={<Milk size={22} className="text-white" />}
        footer={
          <div className="space-y-1">
            {version && <p className="text-[11px] text-white/60">Version {version}</p>}
            <p className="text-[10.5px] text-white/40">© 2025 | Powered by Production House</p>
          </div>
        }
        footerCollapsed={
          version ? <p className="text-[11px] font-bold text-white/60">{version}</p> : null
        }
      />
    </>
  )
}

export default Sidebar
