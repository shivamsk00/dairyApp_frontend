import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Building2, Save } from 'lucide-react'
import { toast } from 'react-toastify'
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

const FIELDS = [
  { label: 'Head Dairy Name', name: 'dairy_name' },
  { label: 'Mobile', name: 'mobile' },
  { label: 'Contact Person', name: 'contact_person' },
  { label: 'Address', name: 'address' }
]

const validateField = (name, value) => {
  const text = String(value ?? '').trim()
  if (name === 'dairy_name') return text ? '' : 'Enter the dairy name'
  if (name === 'mobile')
    return !text || /^\d{10}$/.test(text) ? '' : 'Enter a valid 10-digit mobile number'
  return ''
}

const EditHeadDairy = () => {
  useDocumentTitle('Edit Head Dairy Master')
  const location = useLocation()
  const navigate = useNavigate()
  const updateHeadDairyMaster = useHomeStore((state) => state.updateHeadDairyMaster)
  const loading = useHomeStore((state) => state.loading)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const headDairy = location.state

  const [headDairyData, setHeadDairyData] = useState({
    dairy_name: '',
    mobile: '',
    contact_person: '',
    address: ''
  })

  useEffect(() => {
    if (!headDairy) {
      toast.error('No Head Dairy data provided.')
      navigate('/alldairymaster')
    } else {
      setHeadDairyData({
        dairy_name: headDairy.dairy_name || '',
        mobile: headDairy.mobile || '',
        contact_person: headDairy.contact_person || '',
        address: headDairy.address || ''
      })
    }
  }, [headDairy])

  const handleChange = (e) => {
    const { name, value } = e.target
    setHeadDairyData((prev) => ({ ...prev, [name]: value }))
    if (errors[name] !== undefined)
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    for (const { name } of FIELDS) {
      const message = validateField(name, headDairyData[name])
      if (message) found[name] = message
    }
    setErrors(Object.fromEntries(FIELDS.map(({ name }) => [name, found[name] ?? ''])))
    if (Object.keys(found).length) {
      document.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus()
      return
    }

    setSaving(true)
    try {
      const res = await updateHeadDairyMaster(headDairy.id, headDairyData)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        navigate('/alldairymaster')
      } else {
        CustomToast.error(res.message)
      }
    } catch {
      toast.error('Error updating Dairy Master')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="Edit Head Dairy Master"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Head Dairy Master', to: '/alldairymaster' },
          { label: 'Edit' }
        ]}
        onBack={() => navigate(-1)}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full space-y-5 p-3 sm:p-4 lg:p-6"
      >
        <FormSection
          title={headDairy?.dairy_name || 'Head Dairy'}
          subtitle="Update the dairy's details"
          icon={Building2}
          tone="info"
          cols={2}
        >
          {FIELDS.map(({ label, name }) => (
            <Input
              key={name}
              label={label}
              type="text"
              name={name}
              value={headDairyData[name]}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors[name] || undefined}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ))}
        </FormSection>

        <FormActions>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" icon={Save} loading={saving || loading}>
            Update Dairy Master
          </Button>
        </FormActions>
      </form>
    </div>
  )
}

export default EditHeadDairy
