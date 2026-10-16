/* eslint-disable react/prop-types -- props are documented by usage in ProductCorrection */
import { useEffect, useRef, useState } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Button,
  IconBadge,
  IconButton,
  Input,
  Modal,
  SelectDropdown,
  todayISO,
  toInputDate
} from '../../components/ui'

const TRANSACTION_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'borrow', label: 'Borrow' }
]

const EditCustomerCollectionModal = ({ isOpen, onClose, productData, onUpdate }) => {
  const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
  const fetchCategory = useHomeStore((state) => state.fetchCategory)
  const fetchProductByCategoryId = useHomeStore((state) => state.fetchProductByCategoryId)
  const updateProductSale = useHomeStore((state) => state.updateProductSale)
  const loading = useHomeStore((state) => state.loading)

  // Local calendar day (toISOString() is UTC and gives yesterday before 05:30 IST)
  const today = todayISO()
  const [form, setForm] = useState({
    customer_account_number: '',
    name: '',
    careof: '',
    date: today,
    category_id: '',
    product_id: '',
    product_price: '',
    qty: '',
    total: '',
    transaction_type: ''
  })
  const [allProductCategory, setAllProductCategory] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [errors, setErrors] = useState({})
  const [accountError, setAccountError] = useState('')
  const [saving, setSaving] = useState(false)
  // Only the latest product request may fill the list (category can change quickly)
  const productRequest = useRef(0)

  const loadProducts = async (categoryId) => {
    const request = ++productRequest.current
    if (!categoryId) {
      setAllProducts([])
      return
    }
    try {
      const res = await fetchProductByCategoryId(categoryId)
      if (request === productRequest.current) setAllProducts(res.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      CustomToast.error('Failed to fetch products')
    }
  }

  // Initialize form with productData
  useEffect(() => {
    if (productData) {
      setErrors({})
      setAccountError('')
      setForm({
        customer_account_number: productData.customer_account_number || '',
        name: productData.customer?.name || '',
        careof: productData.customer?.careof || '',
        date: toInputDate(productData.date) || today,
        category_id: productData.category_id || '',
        product_id: productData.product_id || '',
        product_price: productData.product_price || '',
        qty: productData.qty || '',
        total: productData.total || '',
        transaction_type: productData.transaction_type || ''
      })
      loadProducts(productData.category_id)
    }
  }, [productData])

  // Fetch all product categories
  useEffect(() => {
    const fetchAllProductCategory = async () => {
      try {
        const res = await fetchCategory()
        setAllProductCategory(res.data.data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        CustomToast.error('Failed to fetch categories')
      }
    }
    fetchAllProductCategory()
  }, [fetchCategory])

  const handleChange = (e) => {
    const { name, value } = e.target
    setErrors((prev) => ({ ...prev, [name]: undefined }))

    setForm((prev) => {
      const updated = { ...prev, [name]: value }

      if (name === 'category_id') {
        updated.product_id = ''
        updated.product_price = ''
        updated.qty = ''
        updated.total = ''
      }

      if (name === 'product_id') {
        const selected = allProducts.find((p) => p.id == value)
        if (selected) {
          updated.product_price = selected.price || ''
          updated.total = (parseFloat(selected.price || 0) * parseFloat(updated.qty || 0)).toFixed(
            2
          )
        }
      }

      if (name === 'product_price' || name === 'qty') {
        const price = parseFloat(name === 'product_price' ? value : updated.product_price) || 0
        const qty = parseFloat(name === 'qty' ? value : updated.qty) || 0
        updated.total = (qty * price).toFixed(2)
      }

      return updated
    })

    if (name === 'category_id') loadProducts(value)
  }

  const pick = (name) => (value) => handleChange({ target: { name, value } })

  // Debounced lookup when the account number is changed
  useEffect(() => {
    const account = form.customer_account_number
    if (!account || account === productData?.customer_account_number) {
      setAccountError('')
      return undefined
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetchCustomerDetailsByAccount(account)
        if (res.status_code === 200) {
          setAccountError('')
          setForm((prev) => ({ ...prev, name: res.data.name || '', careof: res.data.careof || '' }))
        } else {
          setAccountError(res.message || 'Customer not found')
          setForm((prev) => ({ ...prev, name: '', careof: '' }))
        }
      } catch (error) {
        console.error('Error fetching customer details:', error)
        setAccountError('Failed to fetch customer details')
        setForm((prev) => ({ ...prev, name: '', careof: '' }))
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [form.customer_account_number])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!form.date) found.date = 'Select the date'
    if (!String(form.customer_account_number).trim())
      found.customer_account_number = 'Enter the account number'
    else if (accountError) found.customer_account_number = accountError
    if (!form.category_id) found.category_id = 'Select a category'
    if (!form.product_id) found.product_id = 'Select a product'
    if (!(parseFloat(form.product_price) >= 0) || form.product_price === '')
      found.product_price = 'Enter the price'
    if (!(parseFloat(form.qty) > 0)) found.qty = 'Enter the quantity'
    if (!form.transaction_type) found.transaction_type = 'Select the transaction type'
    setErrors(found)
    if (Object.keys(found).length) return

    try {
      setSaving(true)
      const res = await updateProductSale(productData.id, {
        customer_account_number: form.customer_account_number,
        name: form.name,
        careof: form.careof,
        date: form.date,
        category_id: form.category_id,
        product_id: form.product_id,
        product_price: form.product_price,
        qty: form.qty,
        total: form.total,
        transaction_type: form.transaction_type
      })
      if (res.status_code === 200) {
        CustomToast.success(res.message)
        if (onUpdate) await onUpdate()
        onClose()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Error updating product sale:', error)
      CustomToast.error('Something went wrong while updating!')
    } finally {
      setSaving(false)
    }
  }

  const busy = loading || saving

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Edit product sale"
      maxWidth="52rem"
      dismissible={!saving}
      className="flex max-h-[90vh] flex-col overflow-hidden"
    >
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="ui-border-subtle flex items-center gap-3 border-b px-6 py-4">
          <IconBadge icon={Pencil} tone="primary" />
          <div className="min-w-0 flex-1">
            <h2 className="ui-font-display text-[16px] font-bold">Edit Product Sale</h2>
            <p className="ui-text-tertiary truncate text-[12px]">
              {productData?.customer?.name} · A/C {productData?.customer_account_number}
            </p>
          </div>
          <IconButton icon={X} label="Close" disabled={saving} onClick={onClose} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Date"
              required
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              max={today}
              error={errors.date}
            />
            <Input
              label="Account No"
              required
              type="text"
              name="customer_account_number"
              value={form.customer_account_number}
              onChange={handleChange}
              error={errors.customer_account_number || accountError}
            />
            <Input label="Name" type="text" name="name" value={form.name} readOnly disabled />
            <Input
              label="Care of"
              type="text"
              name="careof"
              value={form.careof}
              readOnly
              disabled
            />
            <SelectDropdown
              label="Category"
              required
              name="category_id"
              searchable
              options={allProductCategory.map((c) => ({ value: c.id, label: c.name }))}
              value={form.category_id}
              placeholder="Select category"
              onChange={pick('category_id')}
              error={errors.category_id}
            />
            <SelectDropdown
              label="Product"
              required
              name="product_id"
              searchable
              options={allProducts.map((p) => ({ value: p.id, label: p.name }))}
              value={form.product_id}
              placeholder="Select product"
              onChange={pick('product_id')}
              error={errors.product_id}
            />
            <Input
              label="Price"
              required
              type="number"
              step="any"
              name="product_price"
              value={form.product_price}
              onChange={handleChange}
              error={errors.product_price}
            />
            <Input
              label="Quantity"
              required
              type="number"
              step="any"
              name="qty"
              value={form.qty}
              onChange={handleChange}
              error={errors.qty}
            />
            <Input
              label="Total Price"
              type="number"
              name="total"
              value={form.total}
              readOnly
              className="!font-bold !text-[color:var(--ui-success-600)]"
            />
            <SelectDropdown
              label="Transaction Type"
              required
              name="transaction_type"
              options={TRANSACTION_TYPES}
              value={form.transaction_type}
              placeholder="Select transaction type"
              onChange={pick('transaction_type')}
              error={errors.transaction_type}
            />
          </div>
        </div>

        <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="secondary" disabled={saving} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Save} loading={busy} disabled={busy}>
            {busy ? 'Please wait...' : 'Update'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditCustomerCollectionModal
