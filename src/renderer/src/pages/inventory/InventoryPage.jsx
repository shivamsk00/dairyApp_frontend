import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, Layers, Package, Plus } from 'lucide-react'
import CategoryTable from './CategoryTable'
import StockTable from './StockTable'
import ProductTable from './ProductTable'
import { Breadcrumb, Button, SegmentedControl, useDocumentTitle } from '../../components/ui'

const TABS = [
  { value: 'Categories', label: 'Categories', icon: Layers },
  { value: 'Stocks', label: 'Stocks', icon: Boxes },
  { value: 'Products', label: 'Products', icon: Package }
]

const readTab = () => {
  try {
    const saved = localStorage.getItem('seletedTableBtn')
    return TABS.some((t) => t.value === saved) ? saved : 'Categories'
  } catch {
    return 'Categories'
  }
}

const InventoryPage = () => {
  useDocumentTitle('Inventory')
  const nav = useNavigate()
  const [inventoryType, setInventoryType] = useState(readTab)

  const remberSelectedTable = (type) => {
    try {
      localStorage.setItem('seletedTableBtn', type)
    } catch {
      /* remembering the tab is optional */
    }
    setInventoryType(type)
  }

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Inventory"
        items={[{ label: 'Home', to: '/' }, { label: 'Products' }, { label: 'Inventory' }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" icon={Plus} onClick={() => nav('/addcategory')}>
              Add Category
            </Button>
            <Button size="sm" variant="success" icon={Plus} onClick={() => nav('/addStock')}>
              Add Stock
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={Plus}
              onClick={() => nav('/AddProductPage')}
            >
              Add Product
            </Button>
          </div>
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <SegmentedControl
          ariaLabel="Inventory section"
          options={TABS}
          value={inventoryType}
          onChange={remberSelectedTable}
        />
        {inventoryType === 'Categories' ? (
          <CategoryTable />
        ) : inventoryType === 'Stocks' ? (
          <StockTable />
        ) : (
          <ProductTable />
        )}
      </div>
    </div>
  )
}

export default InventoryPage
