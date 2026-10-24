import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import CategoryTable from '../inventory/CategoryTable'
import { Breadcrumb, Button, useDocumentTitle } from '../../components/ui'

// Standalone categories page: the same list, status toggle and edit dialog as the Categories tab in Inventory.
const CategoriesPage = () => {
  useDocumentTitle('Categories')
  const nav = useNavigate()

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Categories"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Categories' }
        ]}
        actions={
          <Button size="sm" icon={Plus} onClick={() => nav('/addcategory')}>
            Add Category
          </Button>
        }
      />
      <div className="p-3 sm:p-4 lg:p-6">
        <CategoryTable />
      </div>
    </div>
  )
}

export default CategoriesPage
