import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Layers, Plus } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Breadcrumb,
  Button,
  FormActions,
  FormSection,
  Input,
  useDocumentTitle
} from '../../components/ui'

const AddCategoriesPage = () => {
  useDocumentTitle('Add Category')
  const [categoryName, setCategoryName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const addCategory = useHomeStore((state) => state.addCategory)
  const nav = useNavigate()

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      setError('Category name is required')
      document.querySelector('[name="category_name"]')?.focus()
      return
    }

    setSubmitting(true)
    try {
      const res = await addCategory({ name: categoryName })
      if (res?.status_code === 200) {
        CustomToast.success(res.message)
        setCategoryName('')
        setError('')
        nav(-1)
      } else {
        CustomToast.error(res?.message || 'Failed to add the category')
      }
    } catch (err) {
      console.error('ERROR IN CATEGORY CREATE', err)
      CustomToast.error('Failed to add the category')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Add Category"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Add Category' }
        ]}
        actions={
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => nav(-1)}>
            Back
          </Button>
        }
      />
      <form
        onSubmit={handleAddCategory}
        noValidate
        className="w-full space-y-5 p-3 sm:p-4 lg:p-6"
      >
        <FormSection
          title="New Category"
          subtitle="Group your products"
          icon={Layers}
          tone="primary"
        >
          <Input
            label="Category Name"
            required
            type="text"
            name="category_name"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value)
              setError('')
            }}
            error={error}
            autoFocus
          />
        </FormSection>
        <FormActions>
          <Button variant="secondary" onClick={() => nav(-1)}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus} loading={submitting}>
            Add Category
          </Button>
        </FormActions>
      </form>
    </div>
  )
}

export default AddCategoriesPage
