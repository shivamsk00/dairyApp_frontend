import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import CustomToast from '../../helper/costomeToast'
import CashEntriesPanel from './CashEntriesPanel'
import { Breadcrumb, Button, useDocumentTitle } from '../../components/ui'

const CashCorrection = () => {
  useDocumentTitle('Cash Correction')
  const [refreshToken, setRefreshToken] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshToken((n) => n + 1)
  }

  const handleLoadingChange = (loading) => {
    if (!loading && refreshing) {
      setRefreshing(false)
      CustomToast.success('Refreshed successfully')
    }
  }

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Cash Entry Correction"
        items={[{ label: 'Home', to: '/' }, { label: 'All Correction' }, { label: 'Cash' }]}
        actions={
          <Button variant="secondary" icon={RefreshCw} loading={refreshing} onClick={handleRefresh}>
            Refresh
          </Button>
        }
      />
      <div className="p-3 sm:p-4 lg:p-6">
        <CashEntriesPanel refreshToken={refreshToken} onLoadingChange={handleLoadingChange} />
      </div>
    </div>
  )
}

export default CashCorrection
