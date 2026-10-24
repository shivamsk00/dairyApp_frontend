/* eslint-disable react/prop-types -- PasswordField and Rule are internal to this page */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import useAuthStore from '../../zustand/useAuthStore'
import CustomToast from '../../helper/costomeToast'
import {
  Breadcrumb,
  Button,
  Field,
  Input,
  SectionCard,
  useDocumentTitle
} from '../../components/ui'

// Advisory rules: they guide the user but only "required" blocks the form (the server decides the rest).
const RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  {
    id: 'case',
    label: 'Upper and lower case letters',
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v)
  },
  { id: 'number', label: 'A number', test: (v) => /\d/.test(v) },
  { id: 'symbol', label: 'A symbol, e.g. ! @ # $', test: (v) => /[^A-Za-z0-9]/.test(v) }
]

const STRENGTH = [
  { label: 'Too short', tone: 'var(--ui-danger-500)' },
  { label: 'Weak', tone: 'var(--ui-danger-500)' },
  { label: 'Fair', tone: 'var(--ui-warning-500)' },
  { label: 'Good', tone: 'var(--ui-success-500)' },
  { label: 'Strong', tone: 'var(--ui-success-600)' }
]

const PasswordField = ({ id, label, name, value, onChange, error, autoComplete, placeholder }) => {
  const [visible, setVisible] = useState(false)
  return (
    <Field id={id} label={label} required error={error}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-message` : undefined}
          className="ui-input pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          className="ui-text-tertiary absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md hover:text-[color:var(--ui-text-primary)]"
        >
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
    </Field>
  )
}

const Rule = ({ met, children }) => (
  <li className="flex items-center gap-2.5 text-[13px]">
    <span
      className={`grid size-5 shrink-0 place-items-center rounded-full transition-colors ${met ? 'bg-[color:var(--ui-success-500)] text-white' : 'ui-bg-sunken ui-text-tertiary'}`}
      aria-hidden="true"
    >
      <Check size={12} strokeWidth={3} />
    </span>
    <span className={met ? 'font-semibold' : 'ui-text-secondary'}>{children}</span>
    <span className="sr-only">{met ? '(done)' : '(not yet)'}</span>
  </li>
)

const ChangePassword = () => {
  useDocumentTitle('Change Password')
  const nav = useNavigate()
  const passChange = useAuthStore((state) => state.changePassword)
  const loading = useAuthStore((state) => state.loading)
  const user = useAuthStore((state) => state.user)

  const [formData, setFormData] = useState({
    email: user?.email || '',
    old_password: '',
    new_password: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.old_password.trim()) newErrors.old_password = 'Old password is required'
    if (!formData.new_password.trim()) newErrors.new_password = 'New password is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`)?.focus()
      return
    }

    const res = await passChange(formData)
    if (res?.status_code === 200) {
      CustomToast.success(res.message)
      setFormData({ email: '', old_password: '', new_password: '' })
      nav('/')
    } else {
      // 400 (wrong old password…) and anything else, including a request that never reached the server
      CustomToast.error(res?.message || 'Could not change the password')
    }
  }

  const met = RULES.map((rule) => rule.test(formData.new_password))
  const score = formData.new_password ? met.filter(Boolean).length : 0
  const strength = STRENGTH[score]

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Change Password"
        items={[{ label: 'Home', to: '/' }, { label: 'Account' }, { label: 'Change Password' }]}
        onBack={() => nav(-1)}
      />

      <div className="grid grid-cols-1 gap-5 p-3 sm:p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:p-6">
        <form onSubmit={handleSubmit} noValidate>
          <SectionCard
            title="Update your password"
            subtitle="Enter your current password, then choose a new one"
            icon={KeyRound}
            tone="primary"
          >
            <div className="space-y-4">
              <Input
                label="Email"
                required
                type="email"
                name="email"
                autoComplete="username"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <PasswordField
                id="old_password"
                label="Old Password"
                name="old_password"
                autoComplete="current-password"
                value={formData.old_password}
                onChange={handleChange}
                error={errors.old_password}
              />
              <PasswordField
                id="new_password"
                label="New Password"
                name="new_password"
                autoComplete="new-password"
                value={formData.new_password}
                onChange={handleChange}
                error={errors.new_password}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => nav(-1)}>
                Cancel
              </Button>
              <Button type="submit" icon={LockKeyhole} loading={loading}>
                Change Password
              </Button>
            </div>
          </SectionCard>
        </form>

        <SectionCard
          title="A strong password"
          subtitle="Recommended, checked as you type"
          icon={ShieldCheck}
          tone="success"
          className="h-fit"
        >
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="ui-text-tertiary font-semibold uppercase tracking-wide">
                Strength
              </span>
              <span
                className="font-bold"
                style={{ color: formData.new_password ? strength.tone : undefined }}
              >
                {formData.new_password ? strength.label : '—'}
              </span>
            </div>
            <div
              className="ui-bg-sunken flex h-1.5 gap-1 overflow-hidden rounded-full"
              role="presentation"
            >
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className="h-full flex-1 rounded-full transition-colors"
                  style={{ background: score >= step ? strength.tone : 'transparent' }}
                />
              ))}
            </div>
          </div>
          <ul className="space-y-3">
            {RULES.map((rule, i) => (
              <Rule key={rule.id} met={met[i]}>
                {rule.label}
              </Rule>
            ))}
          </ul>
          <p className="ui-text-tertiary mt-4 text-[12px]">
            Don&apos;t reuse a password from another account, and never share it with anyone.
          </p>
        </SectionCard>
      </div>
    </div>
  )
}

export default ChangePassword
