import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Milk } from 'lucide-react'
import useAuthStore from '../../zustand/useAuthStore'
import CustomToast from '../../helper/costomeToast'
import { clearAllCustomersFromDB } from '../../helper/db'
// Sunrise over a wheat field (Unsplash photo, free to use under the Unsplash License).
// To change the background, replace this file or point the import at another image.
import loginBackground from '../../assets/login-nature-bg.jpg'
import {
  Button,
  Field,
  GlassCard,
  IconBadge,
  Input,
  Switch,
  useDocumentTitle
} from '../../components/ui'

const validateField = (name, value) => {
  const text = String(value ?? '').trim()
  if (name === 'email') {
    if (!text) return 'Email is required'
    return /^\S+@\S+\.\S+$/.test(text) ? '' : 'Enter a valid email address'
  }
  if (name === 'password') return text ? '' : 'Password is required'
  return ''
}

const Login = () => {
  useDocumentTitle('Login')
  const nav = useNavigate()
  const loginToStore = useAuthStore((state) => state.login)
  const loading = useAuthStore((state) => state.loading)
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, setLoginState] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [version, setVersion] = useState('')

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail')
    if (savedEmail) {
      setLoginState((prev) => ({ ...prev, email: savedEmail, rememberMe: true }))
    }
  }, [])

  useEffect(() => {
    window.api?.getAppVersion?.().then(setVersion)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setLoginState((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    else setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const found = {}
    ;['email', 'password'].forEach((name) => {
      const message = validateField(name, loginState[name])
      if (message) found[name] = message
    })
    setTouched({ email: true, password: true })
    setErrors({ email: found.email || '', password: found.password || '' })
    if (Object.keys(found).length > 0) {
      document.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus()
      return
    }

    if (loginState.rememberMe) {
      localStorage.setItem('rememberEmail', loginState.email)
    } else {
      localStorage.removeItem('rememberEmail')
    }

    const res = await loginToStore({ email: loginState.email, password: loginState.password })
    if (res?.status_code == 200) {
      // Safety clear to ensure fresh sync for the new admin
      await clearAllCustomersFromDB()
      CustomToast.success(res.message)
      nav('/')
    } else {
      CustomToast.error(res?.message || 'Login failed')
    }
  }

  return (
    <div
      className="ui-text-primary relative flex min-h-screen items-center justify-center overflow-hidden bg-[#27506a] bg-cover bg-center p-4 sm:p-6"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      {/* Slight shade so the glass card and the footer text stay readable on any photo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />

      <GlassCard
        as="main"
        variant="frost"
        className="ui-animate-rise-in relative z-10 w-full max-w-[26rem] p-7 sm:p-10"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <IconBadge
            icon={Milk}
            tone="primary"
            size="xl"
            className="mb-4 shadow-[0_10px_34px_-6px_rgb(34_211_238/0.7)] ring-1 ring-white/50"
          />
          <h1 className="ui-font-display text-[26px] font-extrabold tracking-tight">
            Welcome back
          </h1>
          <p className="ui-text-secondary mt-1 text-[13.5px]">Sign in to Apni Dairy to continue</p>
        </div>

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <Input
            label="Email Address"
            required
            id="email"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={loginState.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
          />

          <Field id="password" label="Password" required error={errors.password}>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={loginState.password}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'password-message' : undefined}
                className="ui-input pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="ui-text-tertiary absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md hover:text-[color:var(--ui-text-primary)]"
              >
                {showPassword ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
              </button>
            </div>
          </Field>

          <div className="pt-1">
            <Switch
              label="Remember this device"
              checked={loginState.rememberMe}
              onChange={(checked) => setLoginState((prev) => ({ ...prev, rememberMe: checked }))}
            />
          </div>

          <Button type="submit" icon={LogIn} loading={loading} fullWidth className="!mt-6 !py-3">
            Sign In
          </Button>
        </form>

        <p className="ui-text-tertiary mt-7 text-center text-[11.5px]">
          Powered by <span className="ui-text-secondary font-semibold">Production House</span>
        </p>
      </GlassCard>

      <p className="absolute bottom-4 left-0 right-0 z-10 px-4 text-center text-[10.5px] font-medium uppercase tracking-widest text-white/90 [text-shadow:0_1px_6px_rgb(0_0_0/0.35)]">
        &copy; {new Date().getFullYear()} All rights reserved
        {version ? ` · Version ${version}` : ''}
      </p>
    </div>
  )
}

export default Login
