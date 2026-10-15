import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, TriangleAlert, Plus } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Breadcrumb,
  Button,
  FormActions,
  FormSection,
  Input,
  SuccessModal,
  useDocumentTitle
} from '../../components/ui'

const EMPTY = { dairy_name: '', contact_person: '', mobile: '', address: '' }

const validateField = (name, value) => {
  const text = String(value ?? '').trim()
  if (name === 'dairy_name')
    return !text
      ? 'Enter the dairy name'
      : text.length < 2
        ? 'Name must be at least 2 characters'
        : ''
  if (name === 'mobile')
    return !text
      ? 'Enter a mobile number'
      : /^\d{10}$/.test(text)
        ? ''
        : 'Enter a valid 10-digit mobile number'
  return ''
}
const validateAll = (values) =>
  Object.keys(EMPTY).reduce((found, name) => {
    const message = validateField(name, values[name])
    return message ? { ...found, [name]: message } : found
  }, {})

const AddHeadDairy = () => {
  useDocumentTitle('Add Head Dairy Master')
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const navigate = useNavigate()

  const addHeadDairy = useHomeStore((state) => state.addHeadDairy)

  const [form, setForm] = useState(EMPTY)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const found = validateAll(form)
    setErrors(found)
    setTouched({ dairy_name: true, mobile: true, contact_person: true, address: true })
    const invalid = Object.keys(found)
    if (invalid.length) {
      setError(
        `Please fix the ${invalid.length} highlighted ${invalid.length === 1 ? 'field' : 'fields'} and try again.`
      )
      document.querySelector(`[name="${invalid[0]}"]`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      const res = await addHeadDairy(form)

      if (res.status_code == 200) {
        setShowSuccessModal(true)
        setForm(EMPTY)
        CustomToast.success(res.message)
        navigate('/alldairymaster')
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Error adding head dairy:', error)
      setError('An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="Add Head Dairy Master"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Head Dairy Master', to: '/alldairymaster' },
          { label: 'Add' }
        ]}
        actions={
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto max-w-4xl space-y-5 p-3 sm:p-4 lg:p-6"
      >
        {error && (
          <div
            role="alert"
            className="ui-tint-danger flex items-center gap-2 rounded-lg px-4 py-3 text-[13px] font-medium"
          >
            <TriangleAlert size={16} aria-hidden="true" />
            {error}
          </div>
        )}

        <FormSection
          title="Dairy Details"
          subtitle="The dairy you dispatch milk to"
          icon={Building2}
          tone="info"
          cols={2}
        >
          <Input
            label="Dairy Name"
            required
            type="text"
            name="dairy_name"
            value={form.dairy_name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.dairy_name}
          />
          <Input
            label="Mobile"
            required
            maxLength={10}
            type="text"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.mobile}
          />
          <Input
            label="Contact Person"
            type="text"
            name="contact_person"
            value={form.contact_person}
            onChange={handleChange}
          />
          <Input
            label="Address"
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </FormSection>

        <FormActions>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus} loading={submitting}>
            Add Head Dairy Master
          </Button>
        </FormActions>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => navigate('/alldairymaster')}
        title="Dairy Master Added Successfully"
        buttonLabel="Go to Dairy Master List"
      />
    </div>
  )
}

export default AddHeadDairy
