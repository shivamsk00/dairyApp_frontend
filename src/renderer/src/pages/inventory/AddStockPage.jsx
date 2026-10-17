import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, Plus } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Breadcrumb,
  Button,
  FormActions,
  FormSection,
  Input,
  SelectDropdown,
  todayISO,
  useDocumentTitle
} from '../../components/ui'

const STOCK_TYPES = [
  { value: 'IN', label: 'IN' },
  { value: 'OUT', label: 'OUT' }
]
const empty = () => ({ product_id: '', stock_type: '', quantity: '', date: todayISO() })

const validate = (v) => {
  const e = {}
  if (!v.product_id) e.product_id = 'Select a product'
  if (!(parseFloat(v.quantity) > 0)) e.quantity = 'Enter a quantity greater than 0'
  if (!v.stock_type) e.stock_type = 'Select IN or OUT'
  if (!v.date) e.date = 'Select the entry date'
  return e
}

const AddStockPage = () => {
  useDocumentTitle('Add Product Stock')
  const nav = useNavigate()
  const fetchAllProducts = useHomeStore((state) => state.fetchAllProducts)
  const addProductStock = useHomeStore((state) => state.addProductStock)

  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const getAllProductData = async () => {
      try {
        const res = await fetchAllProducts()
        if (res && res.status_code == 200) setProducts(res.data?.data || [])
        else CustomToast.error(res?.message || 'Failed to fetch products')
      } catch (error) {
        console.log('ERROR IN FETCH PRODUCTS IN ADD STOCK PAGE', error)
      }
    }
    getAllProductData()
  }, [])

  const set = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(formData)
    setErrors(found)
    if (Object.keys(found).length) {
      setTimeout(() => document.querySelector('form [aria-invalid="true"]')?.focus(), 0)
      return
    }

    setSubmitting(true)
    try {
      const res = await addProductStock({
        product_id: formData.product_id,
        stock_type: formData.stock_type,
        quantity: formData.quantity,
        date: formData.date
      })
      if (res?.status_code == 200) {
        CustomToast.success(res.message)
        setFormData(empty())
        nav(-1)
      } else {
        CustomToast.error(res?.message || 'Failed to add the stock')
      }
    } catch (error) {
      console.log('ERROR IN SAVE STOCK ', error)
      CustomToast.error('Failed to add the stock')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Add Product Stock"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Add Stock' }
        ]}
        onBack={() => nav(-1)}
      />
      <form onSubmit={handleSubmit} noValidate className="w-full space-y-5 p-3 sm:p-4 lg:p-6">
        <FormSection
          title="Stock Entry"
          subtitle="Record stock coming in or going out"
          icon={Boxes}
          tone="primary"
          cols={4}
        >
          <SelectDropdown
            label="Product Name"
            required
            name="product_id"
            searchable
            options={products.map((p) => ({ value: p.id, label: p.name }))}
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
          <Button variant="secondary" onClick={() => nav(-1)}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus} loading={submitting}>
            Add Stock
          </Button>
        </FormActions>
      </form>
    </div>
  )
}

export default AddStockPage
