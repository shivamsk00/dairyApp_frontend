import { Breadcrumb, useDocumentTitle } from '../../components/ui'
import SoldProductsPanel from './SoldProductsPanel'

const ProductCorrection = () => {
  useDocumentTitle('Product Correction')

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Product Sales Correction"
        items={[{ label: 'Home', to: '/' }, { label: 'All Correction' }, { label: 'Product' }]}
      />
      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <SoldProductsPanel title="Sold Products" exportFileName="product_sales_report.xlsx" />
      </div>
    </div>
  )
}

export default ProductCorrection
