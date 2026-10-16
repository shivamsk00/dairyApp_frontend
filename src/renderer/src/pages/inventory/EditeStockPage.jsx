import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Boxes, Save } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Breadcrumb,
  Button,
  FormActions,
  FormSection,
  Input,
  PageLoader,
  SelectDropdown,
  useDocumentTitle
} from '../../components/ui'

const STOCK_TYPES = [
  { value: 'IN', label: 'IN' },
  { value: 'OUT', label: 'OUT' }
]

const validate = (v) => {
  const e = {}
  if (!v.product_id) e.product_id = 'Select a product'
  if (!(parseFloat(v.quantity) > 0)) e.quantity = 'Enter a quantity greater than 0'
  if (!v.stock_type) e.stock_type = 'Select IN or OUT'
  if (!v.date) e.date = 'Select the entry date'
  return e
}

const EditeStockPage = () => {
  useDocumentTitle('Edit Product Stock')
  const navigate = useNavigate()
  const { state } = useLocation()
  const stockId = state?.stockId
  const fetchAllProducts = useHomeStore((s) => s.fetchAllProducts)
  const getEditProductStockData = useHomeStore((s) => s.getEditProductStockData)
  const updateProductStock = useHomeStore((s) => s.updateProductStock)

  const [productData, setProductData] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    product_id: '',
    stock_type: '',
    quantity: '',
    date: ''
  })

  useEffect(() => {
    if (!stockId) {
      navigate('/inventory', { replace: true })
      return
    }
    const load = async () => {
      try {
        const [prodRes, res] = await Promise.all([
          fetchAllProducts(),
          getEditProductStockData(stockId)
        ])
        if (prodRes?.status_code == 200) setProductData(prodRes.data.data)
        else CustomToast.error(prodRes?.message || 'Failed to load products.')
        if (res.status_code == 200 && res.data.length > 0) {
          const stock = res.data[0]
          setFormData({
            product_id: stock.product_id || '',
            stock_type: stock.stock_type || '',
            quantity: stock.quantity || '',
            date: stock.date?.split('T')[0] || ''
          })
        } else {
          CustomToast.error('No stock data found.')
        }
      } catch (error) {
        console.error('Error fetching stock data', error)
        CustomToast.error('Failed to load product stock.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const set = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    const found = validate(formData)
    setErrors(found)
    if (Object.keys(found).length) {
      setTimeout(() => document.querySelector('form [aria-invalid="true"]')?.focus(), 0)
      return
    }

    setSubmitting(true)
    try {
      const res = await updateProductStock(stockId, formData)
      if (res?.status_code === 200) {
        CustomToast.success(res.message)
        navigate(-1)
      } else {
        CustomToast.error(res?.message || 'Update failed.')
      }
    } catch (error) {
      console.error('Error updating product stock', error)
      CustomToast.error('Error occurred during update.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Edit Product Stock"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Edit Stock' }
        ]}
        actions={
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />
      {loading ? (
        <PageLoader variant="inline" label="Loading stock data" />
      ) : (
        <form
          onSubmit={handleUpdateSubmit}
          noValidate
          className="w-full space-y-5 p-3 sm:p-4 lg:p-6"
        >
          <FormSection
            title="Stock Entry"
            subtitle="Update the stock record"
            icon={Boxes}
            tone="primary"
            cols={4}
          >
            <SelectDropdown
              label="Product Name"
              required
              name="product_id"
              searchable
              options={productData.map((p) => ({ value: p.id, label: p.name }))}
              value={formData.product_id}
              placeholder="Select Product"
              onChange={(value) => set('product_id', value)}
              error={errors.product_id}
            />
            <Input
              label="Stock Quantity"
              required
              type="number"
              step="any"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
            />
            <SelectDropdown
              label="Stock IN/OUT"
              required
              name="stock_type"
              options={STOCK_TYPES}
              value={formData.stock_type}
              placeholder="Select type"
              onChange={(value) => set('stock_type', value)}
              error={errors.stock_type}
            />
            <Input
              label="Entry Date"
              required
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
            />
          </FormSection>
          <FormActions>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} loading={submitting}>
              Update Stock
            </Button>
          </FormActions>
        </form>
      )}
    </div>
  )
}

export default EditeStockPage
