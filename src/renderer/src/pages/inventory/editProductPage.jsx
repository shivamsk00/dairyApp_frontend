import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Save } from 'lucide-react'
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

const validate = (v) => {
  const e = {}
  if (!v.category) e.category = 'Select a category'
  if (!String(v.name).trim()) e.name = 'Enter the product name'
  if (!String(v.unit).trim()) e.unit = 'Enter the unit, e.g. 1 Ltr'
  if (v.price === '' || !(parseFloat(v.price) >= 0)) e.price = 'Enter the price'
  return e
}

const EditProductPage = () => {
  useDocumentTitle('Edit Product')
  const nav = useNavigate()
  const { state } = useLocation()
  const productId = state?.productId
  const fetchAllCategories = useHomeStore((s) => s.fetchAllCategories)
  const editProductDetailsFetch = useHomeStore((s) => s.editProductDetailsFetch)
  const updateProduct = useHomeStore((s) => s.updateProduct)

  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({ category: '', name: '', unit: '', price: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!productId) {
      nav('/inventory', { replace: true })
      return
    }
    const load = async () => {
      try {
        const [catRes, res] = await Promise.all([
          fetchAllCategories(),
          editProductDetailsFetch(productId)
        ])
        if (catRes?.status_code == 200) setCategories(catRes.data.data)
        else CustomToast.error(catRes?.message || 'Failed to load categories')
        setFormData({
          category: res.data.category_id,
          name: res.data.name,
          unit: res.data.unit, // like '1 Ltr'
          price: res.data.price
        })
      } catch (error) {
        console.error('ERROR FETCHING PRODUCT', error)
        CustomToast.error('Failed to load the product')
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
      const res = await updateProduct(productId, {
        category_id: formData.category,
        name: formData.name,
        unit: formData.unit,
        price: formData.price
      })
      if (res?.status_code == 200) {
        CustomToast.success(res.message)
        nav(-1)
      } else {
        CustomToast.error(res?.message || 'Failed to update the product')
      }
    } catch (error) {
      console.log('ERROR IN UPDATE PRODUCT', error)
      CustomToast.error('Failed to update the product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Edit Product"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Edit Product' }
        ]}
        actions={
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => nav(-1)}>
            Back
          </Button>
        }
      />
      {loading ? (
        <PageLoader variant="inline" label="Loading product" />
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full space-y-5 p-3 sm:p-4 lg:p-6"
        >
          <FormSection
            title="Product Details"
            subtitle="Update the product"
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
              label="Product Unit"
              required
              type="text"
              name="unit"
              hint="e.g. 1 Ltr, 500 gm"
              value={formData.unit}
              onChange={handleChange}
              error={errors.unit}
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
            <Button type="submit" icon={Save} loading={submitting}>
              Update Product
            </Button>
          </FormActions>
        </form>
      )}
    </div>
  )
}

export default EditProductPage
