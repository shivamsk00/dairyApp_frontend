import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plus } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Breadcrumb,
  Button,
  FormActions,
  FormSection,
  Input,
  SelectDropdown,
  useDocumentTitle
} from '../../components/ui'

const UNIT_TYPES = ['Ltr', 'KG', 'gm', 'ml'].map((u) => ({ value: u, label: u }))
const EMPTY = { category: '', name: '', unitValue: '', unitType: '', price: '' }

const validate = (v) => {
  const e = {}
  if (!v.category) e.category = 'Select a category'
  if (!v.name.trim()) e.name = 'Enter the product name'
  if (!(parseFloat(v.unitValue) > 0)) e.unitValue = 'Enter the unit quantity'
  if (!v.unitType) e.unitType = 'Select a unit'
  if (v.price === '' || !(parseFloat(v.price) >= 0)) e.price = 'Enter the price'
  return e
}

const AddProductPage = () => {
  useDocumentTitle('Add Product')
  const nav = useNavigate()
  const fetchAllCategories = useHomeStore((state) => state.fetchAllCategories)
  const addProduct = useHomeStore((state) => state.addProduct)

  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const getAllCategory = async () => {
      try {
        const res = await fetchAllCategories()
        if (res?.status_code == 200) setCategories(res.data.data)
        else CustomToast.error(res?.message || 'Failed to load categories')
      } catch (error) {
        console.log('ERROR IN FETCH CATEGORY IN ADD PRODUCT PAGE', error)
      }
    }
    getAllCategory()
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

    const productData = {
      category_id: formData.category,
      name: formData.name,
      unit: `${formData.unitValue} ${formData.unitType}`,
      price: formData.price
    }

    setSubmitting(true)
    try {
      const res = await addProduct(productData)
      if (res?.status_code == 200) {
        CustomToast.success(res.message)
        setFormData(EMPTY)
        nav(-1)
      } else {
        CustomToast.error(res?.message || 'Failed to add the product')
      }
    } catch (error) {
      console.log('ERROR IN SAVE PRODUCT ', error)
      CustomToast.error('Failed to add the product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Add Product"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Add Product' }
        ]}
        onBack={() => nav(-1)}
      />
      <form onSubmit={handleSubmit} noValidate className="w-full space-y-5 p-3 sm:p-4 lg:p-6">
        <FormSection
          title="Product Details"
          subtitle="What you sell and how it is priced"
          icon={Package}
          tone="primary"
          cols={3}
        >
          <SelectDropdown
            label="Category"
            required
            name="category"
            searchable
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={formData.category}
            placeholder="Select Category"
            onChange={(value) => set('category', value)}
            error={errors.category}
          />
          <Input
            label="Product Name"
            required
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Input
            label="Unit Quantity"
            required
            type="number"
            step="any"
            name="unitValue"
            placeholder="e.g., 1, 500"
            value={formData.unitValue}
            onChange={handleChange}
            error={errors.unitValue}
          />
          <SelectDropdown
            label="Unit Type"
            required
            name="unitType"
            options={UNIT_TYPES}
            value={formData.unitType}
            placeholder="Select Unit"
            onChange={(value) => set('unitType', value)}
            error={errors.unitType}
          />
          <Input
            label="Product Price"
            required
            type="number"
            step="any"
            name="price"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
          />
        </FormSection>
        <FormActions>
          <Button variant="secondary" onClick={() => nav(-1)}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus} loading={submitting}>
            Add Product
          </Button>
        </FormActions>
      </form>
    </div>
  )
}

export default AddProductPage
