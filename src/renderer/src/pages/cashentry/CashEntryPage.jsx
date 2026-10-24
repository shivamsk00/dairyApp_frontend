import { useState } from 'react'
import { BarChart3, Banknote, FileText, ListChecks, RefreshCw } from 'lucide-react'
import BulkHisaabComponent from './BulkHisaabComponent'
import ManualEntries from './ManualEntries'
import CashEntriesPanel from '../cashCorrection/CashEntriesPanel'
import CustomToast from '../../helper/costomeToast'
import { Button, SegmentedControl, useDocumentTitle, WindowHeader } from '../../components/ui'

// The old single-entry form had its tab commented out, so it was unreachable and is not carried over.
const TABS = [
  { value: 'bulk', label: 'Bulk Hisaab Kitaab', icon: BarChart3 },
  { value: 'manual', label: 'Manual Voucher Entry', icon: FileText },
  { value: 'history', label: 'All Cash Entries', icon: ListChecks }
]

const CashEntryPage = () => {
  useDocumentTitle('Cash Entry')
  const [viewMode, setViewMode] = useState('bulk')
  const [refreshToken, setRefreshToken] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshToken((n) => n + 1)
  }

  const handleLoadingChange = (loading) => {
    if (!loading && refreshing) {
      setRefreshing(false)
      CustomToast.success('Page refreshed successfully')
    }
  }

  return (
    <div className="ui-text-primary flex min-h-screen w-full flex-col">
      <WindowHeader title="Cash Entry Management" icon={Banknote}>
        {viewMode === 'history' && (
          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        )}
      </WindowHeader>

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <SegmentedControl
          ariaLabel="Cash entry section"
          options={TABS}
          value={viewMode}
          onChange={setViewMode}
        />

        {viewMode === 'bulk' && <BulkHisaabComponent />}
        {viewMode === 'manual' && <ManualEntries />}
        {viewMode === 'history' && (
          <CashEntriesPanel
            showWallet
            refreshToken={refreshToken}
            onLoadingChange={handleLoadingChange}
          />
        )}
      </div>
    </div>
  )
}

export default CashEntryPage
