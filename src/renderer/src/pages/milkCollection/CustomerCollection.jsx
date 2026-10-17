import { useEffect, useRef, useState } from 'react'
import { Boxes, PackagePlus, Plus, Send, ShoppingCart, Trash2, User } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import SoldProductsPanel from '../productCorrection/SoldProductsPanel'
import {
  Badge,
  Button,
  IconButton,
  Input,
  Modal,
  SectionCard,
  SegmentedControl,
  SelectDropdown,
  todayISO,
  useDocumentTitle,
  WindowHeader
} from '../../components/ui'

const TRANSACTION_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'borrow', label: 'Borrow' }
]

let rowCounter = 0
const newRow = () => ({
  uid: ++rowCounter,
  category_id: '',
  product_id: '',
  product_price: '',
  qty: 0,
  total: '',
  allProducts: [],
  selectedProduct: null
})

const stockOf = (productList, id) => {
  const product = Array.isArray(productList) ? productList.find((p) => p.id == id) : null
  return product && Array.isArray(product.stocks) && product.stocks.length > 0
    ? product.stocks[0].quantity || 0
    : 0
}

const CustomerCollection = () => {
  useDocumentTitle('Product Sell')
  const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
  const fetchCategory = useHomeStore((state) => state.fetchCategory)
  const fetchProductByCategoryId = useHomeStore((state) => state.fetchProductByCategoryId)
  const productSaleSubmit = useHomeStore((state) => state.productSaleSubmit)
  const allProductGet = useHomeStore((state) => state.allProductGet)
  const addProductStock = useHomeStore((state) => state.addProductStock)

  // Local calendar day (toISOString() is UTC and gives yesterday before 05:30 IST)
  const today = todayISO()
  const [allProductCategory, setAllProductCategory] = useState([])
  const [allProductList, setAllProductList] = useState([])
  const [refreshToken, setRefreshToken] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Stock update dialog
  const [showStockModal, setShowStockModal] = useState(false)
  const [stockToUpdate, setStockToUpdate] = useState({ product_id: '', name: '', quantity: '' })
  const [stockError, setStockError] = useState('')
  const [stockSaving, setStockSaving] = useState(false)

  const [form, setForm] = useState({
    account_number: '',
    transaction_type: '',
    name: '',
    careof: '',
    date: today
  })
  const [products, setProducts] = useState([newRow()])
  const accountRef = useRef(null)

  const grandTotal = products.reduce((sum, prod) => sum + (parseFloat(prod.total) || 0), 0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const patchRow = (uid, patch) =>
    setProducts((prev) => prev.map((row) => (row.uid === uid ? { ...row, ...patch } : row)))

  const handleProductChange = async (uid, field, value) => {
    setErrors((prev) => ({ ...prev, rows: undefined }))
    const row = products.find((r) => r.uid === uid)
    if (!row) return

    if (field === 'category_id') {
      patchRow(uid, {
        category_id: value,
        product_id: '',
        product_price: '',
        qty: 0,
        total: '',
        allProducts: [],
        selectedProduct: null
      })
      if (value) {
        try {
          const res = await fetchProductByCategoryId(value)
          patchRow(uid, { allProducts: res.data })
        } catch (error) {
          console.log('Error fetching products:', error)
          CustomToast.error('Failed to fetch products')
        }
      }
    } else if (field === 'product_id') {
      const selected = row.allProducts.find((p) => p.id == value)
      const patch = {
        product_id: value,
        selectedProduct: selected
          ? { ...selected, available_stock: stockOf(allProductList, value) }
          : null
      }
      if (selected) {
        patch.product_price = selected.price
        patch.total = (row.qty || 0) * selected.price
      }
      patchRow(uid, patch)
    } else if (field === 'qty') {
      const qty = parseFloat(value) || 0
      if (qty < 0) return
      const price = parseFloat(row.product_price) || 0
      patchRow(uid, { qty, total: (qty * price).toFixed(2) })
    } else if (field === 'product_price') {
      const price = parseFloat(value) || 0
      if (price < 0) return
      const qty = parseFloat(row.qty) || 0
      patchRow(uid, { product_price: value, total: (qty * price).toFixed(2) })
    } else {
      patchRow(uid, { [field]: value })
    }
  }

  const addProductRow = () => setProducts((prev) => [...prev, newRow()])

  const removeProductRow = (uid) => {
    if (products.length > 1) setProducts((prev) => prev.filter((r) => r.uid !== uid))
    else CustomToast.warn('At least one product is required')
  }

  const fetchCustomerDetailByAccountNumber = async (accountNo) => {
    try {
      const res = await fetchCustomerDetailsByAccount(accountNo)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        setForm((prev) => ({ ...prev, name: res.data.name || '', careof: res.data.careof || '' }))
      } else {
        CustomToast.error(res.message)
        setForm((prev) => ({ ...prev, name: '', careof: '' }))
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (form.account_number.trim()) fetchCustomerDetailByAccountNumber(form.account_number)
    }
  }

  const fetchAllProductCategory = async () => {
    try {
      const res = await fetchCategory()
      setAllProductCategory(res.data.data)
    } catch (error) {
      console.log('ERROR IN FETCHING CATEGORY', error)
    }
  }

  const fetchAllProducts = async () => {
    try {
      const res = await allProductGet()
      if (res.status_code == 200) {
        setAllProductList(Array.isArray(res.data) ? res.data : res.data?.data || [])
      }
    } catch (error) {
      console.error('Error fetching all products:', error)
    }
  }

  useEffect(() => {
    fetchAllProductCategory()
    fetchAllProducts()
    accountRef.current?.focus()
  }, [])

  // Keep the stock shown next to the form in step with the latest product list
  useEffect(() => {
    if (allProductList.length > 0) {
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id && p.selectedProduct
            ? {
                ...p,
                selectedProduct: {
                  ...p.selectedProduct,
                  available_stock: stockOf(allProductList, p.product_id)
                }
              }
            : p
        )
      )
    }
  }, [allProductList])

  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    const found = {}
    if (!String(form.account_number).trim()) found.account_number = 'Enter the account number'
    if (!form.date) found.date = 'Select the date'
    if (!form.transaction_type) found.transaction_type = 'Select the transaction type'
    const rows = products.map((p) => ({
      category_id: p.category_id ? undefined : 'Select a category',
      product_id: p.product_id ? undefined : 'Select a product',
      qty: p.qty > 0 ? undefined : 'Enter the quantity'
    }))
    if (rows.some((r) => r.category_id || r.product_id || r.qty)) found.rows = rows
    setErrors(found)
    if (Object.keys(found).length) {
      setTimeout(() => document.querySelector('form [aria-invalid="true"]')?.focus(), 0)
      return
    }

    const customerCollectionData = {
      customer_account_number: form.account_number,
      date: form.date,
      transaction_type: form.transaction_type,
      products: products.map((p) => ({
        category_id: parseInt(p.category_id),
        product_id: parseInt(p.product_id),
        product_price: parseFloat(p.product_price),
        qty: parseFloat(p.qty),
        total: parseFloat(p.total)
      }))
    }

    setSubmitting(true)
    try {
      const res = await productSaleSubmit(customerCollectionData)
      if (res && res.status_code === 200) {
        CustomToast.success(res.message)
        setForm({ account_number: '', name: '', careof: '', date: today, transaction_type: '' })
        setProducts([newRow()])
        setErrors({})
        setRefreshToken((n) => n + 1)
        await fetchAllProducts() // instant stock refresh after a sale
        accountRef.current?.focus()
      } else {
        CustomToast.error(res?.message || 'Failed to submit sale')
      }
    } catch (error) {
      console.error('❌ Submit Error:', error)
      if (error.response) {
        CustomToast.error(error.response.data?.message || `Error: ${error.response.status}`)
      } else if (error.request) {
        CustomToast.error('Server not responding. Please check your connection.')
      } else {
        CustomToast.error('Failed to submit sale')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const openStockModal = (product) => {
    setStockToUpdate({ product_id: product.id, name: product.name, quantity: '' })
    setStockError('')
    setShowStockModal(true)
  }

  const handleUpdateStock = async (e) => {
    e.preventDefault()
    if (!(parseFloat(stockToUpdate.quantity) > 0)) {
      setStockError('Enter a valid quantity')
      return
    }
    setStockSaving(true)
    try {
      const res = await addProductStock({
        product_id: stockToUpdate.product_id,
        quantity: stockToUpdate.quantity,
        date: today,
        stock_type: 'IN'
      })
      if (res.status_code === 200) {
        CustomToast.success('Stock updated successfully')
        setShowStockModal(false)
        setStockToUpdate({ product_id: '', name: '', quantity: '' })
        await fetchAllProducts()
      } else {
        CustomToast.error(res.message || 'Failed to update stock')
      }
    } catch (error) {
      console.error('Stock Update Error:', error)
      CustomToast.error('Failed to update stock')
    } finally {
      setStockSaving(false)
    }
  }

  const selectedRows = products.filter((p) => p.selectedProduct)

  return (
    <div className="ui-text-primary flex min-h-screen w-full flex-col">
      <WindowHeader title="Product Sales" icon={ShoppingCart} />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <form onSubmit={handleSubmitProduct} noValidate className="space-y-5">
            <SectionCard
              title="Customer Details"
              subtitle="Press Enter in the account number to look the customer up"
              icon={User}
              tone="primary"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="Account Number"
                  required
                  name="account_number"
                  ref={accountRef}
                  value={form.account_number}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter account"
                  error={errors.account_number}
                  autoComplete="off"
                />
                <Input
                  label="Customer Name"
                  name="name"
                  value={form.name}
                  readOnly
                  placeholder="Auto-filled"
                />
                <Input
                  label="Care Of"
                  name="careof"
                  value={form.careof}
                  readOnly
                  placeholder="Auto-filled"
                />
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
                <div>
                  <p className="mb-1.5 text-[12.5px] font-semibold">
                    Transaction Type <span className="text-[color:var(--ui-danger-500)]">*</span>
                  </p>
                  <SegmentedControl
                    ariaLabel="Transaction type"
                    options={TRANSACTION_TYPES}
                    value={form.transaction_type}
                    onChange={(value) =>
                      handleChange({ target: { name: 'transaction_type', value } })
                    }
                  />
                  {errors.transaction_type && (
                    <p
                      role="alert"
                      className="mt-1.5 text-[11.5px] text-[color:var(--ui-danger-600)]"
                    >
                      {errors.transaction_type}
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Product Details"
              subtitle="One row per product in this sale"
              icon={PackagePlus}
              tone="accent"
              action={
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  icon={Plus}
                  onClick={addProductRow}
                >
                  Add More Product
                </Button>
              }
            >
              <div className="space-y-3">
                {products.map((prod, index) => {
                  const rowErrors = errors.rows?.[index] ?? {}
                  return (
                    <div
                      key={prod.uid}
                      className="ui-border-subtle grid grid-cols-2 items-start gap-3 rounded-lg border p-3 lg:grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr_auto]"
                    >
                      <SelectDropdown
                        label="Category"
                        required
                        name={`category_${prod.uid}`}
                        searchable
                        options={allProductCategory.map((c) => ({ value: c.id, label: c.name }))}
                        value={prod.category_id}
                        placeholder="Select category"
                        onChange={(value) => handleProductChange(prod.uid, 'category_id', value)}
                        error={rowErrors.category_id}
                        fieldClassName="col-span-2 lg:col-span-1"
                      />
                      <SelectDropdown
                        label="Product"
                        required
                        name={`product_${prod.uid}`}
                        searchable
                        options={prod.allProducts.map((p) => ({ value: p.id, label: p.name }))}
                        value={prod.product_id}
                        placeholder="Select product"
                        onChange={(value) => handleProductChange(prod.uid, 'product_id', value)}
                        error={rowErrors.product_id}
                        fieldClassName="col-span-2 lg:col-span-1"
                      />
                      <Input
                        label="Price"
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        value={prod.product_price}
                        onChange={(e) =>
                          handleProductChange(prod.uid, 'product_price', e.target.value)
                        }
                      />
                      <Input
                        label="Quantity"
                        required
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0"
                        value={prod.qty}
                        onChange={(e) => handleProductChange(prod.uid, 'qty', e.target.value)}
                        error={rowErrors.qty}
                      />
                      <Input
                        label="Total"
                        type="text"
                        value={prod.total}
                        readOnly
                        className="!font-bold !text-[color:var(--ui-success-600)]"
                      />
                      <div className="col-span-2 lg:col-span-1 lg:pt-6">
                        <IconButton
                          icon={Trash2}
                          label="Remove product"
                          iconSize={16}
                          className="w-full hover:!text-[color:var(--ui-danger-600)] lg:w-auto"
                          onClick={() => removeProductRow(prod.uid)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="ui-border-subtle mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div>
                  <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                    Grand total
                  </p>
                  <p className="ui-font-display text-[22px] font-extrabold text-[color:var(--ui-success-600)]">
                    ₹{grandTotal.toFixed(2)}
                  </p>
                </div>
                <Button type="submit" icon={Send} loading={submitting}>
                  Submit Sale Entry
                </Button>
              </div>
            </SectionCard>
          </form>

          <SectionCard
            title="Product Info & Stock"
            subtitle="For the products in this sale"
            icon={Boxes}
            tone="info"
            className="h-fit"
          >
            {selectedRows.length === 0 ? (
              <p className="ui-text-tertiary py-6 text-center text-[13px]">
                Select a product to view its current stock details
              </p>
            ) : (
              <div className="space-y-3">
                {selectedRows.map((p) => {
                  const stock = Number(p.selectedProduct.available_stock || 0)
                  const after = stock - (p.qty || 0)
                  return (
                    <div key={p.uid} className="ui-border-subtle rounded-lg border p-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="text-[13.5px] font-bold">{p.selectedProduct.name}</h4>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          icon={Plus}
                          onClick={() => openStockModal(p.selectedProduct)}
                          title="Quick Update Stock"
                        >
                          Stock
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="ui-text-tertiary">Available stock</span>
                        <Badge tone={stock <= 5 ? 'danger' : 'success'} dot={false}>
                          {p.selectedProduct.available_stock ?? '0'}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[12.5px]">
                        <span className="ui-text-tertiary">After sale</span>
                        <span
                          className={`font-bold ${after < 0 ? 'text-[color:var(--ui-danger-600)]' : ''}`}
                        >
                          {after.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <SoldProductsPanel
          title="Sales History"
          exportFileName="customer_collection_report.xlsx"
          showKpis={false}
          refreshToken={refreshToken}
          onChanged={fetchAllProducts}
        />
      </div>

      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        ariaLabel="Quick stock update"
        maxWidth="24rem"
        dismissible={!stockSaving}
        className="p-6"
      >
        <form onSubmit={handleUpdateStock} noValidate>
          <h2 className="ui-font-display text-[16px] font-bold">Quick Stock Update</h2>
          <p className="ui-text-tertiary mb-4 text-[12.5px]">{stockToUpdate.name}</p>
          <Input
            label="Quantity to Add (IN)"
            required
            type="number"
            step="any"
            min="0"
            placeholder="Enter quantity"
            value={stockToUpdate.quantity}
            onChange={(e) => {
              setStockToUpdate({ ...stockToUpdate, quantity: e.target.value })
              setStockError('')
            }}
            error={stockError}
            autoFocus
          />
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={stockSaving}
              onClick={() => setShowStockModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" icon={Plus} loading={stockSaving}>
              Add Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CustomerCollection
