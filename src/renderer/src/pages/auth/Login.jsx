import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Eye, EyeOff, IndianRupee, LogIn, Milk } from 'lucide-react'
import useAuthStore from '../../zustand/useAuthStore'
import CustomToast from '../../helper/costomeToast'
import { clearAllCustomersFromDB } from '../../helper/db'
// Sunrise over a wheat field (Unsplash photo, free to use under the Unsplash License).
// To change the background, replace this file or point the import at another image.
import logoImg from '../../assets/logo.png'
import loginBackground from '../../assets/login-nature-bg.jpg'
import {
  Button,
  Field,
  GlassCard,
  Input,
  Switch,
  useDocumentTitle
} from '../../components/ui'

const FEATURES = [
  {
    icon: Milk,
    title: 'Milk collection',
    text: 'Quick entry with automatic rate lookup and printed slips'
  },
  {
    icon: IndianRupee,
    title: 'Payments & wallets',
    text: 'Cash entry, payment register and customer statements'
  },
  {
    icon: BarChart3,
    title: 'Inventory & reports',
    text: 'Stock, product sales and reports in a few clicks'
  }
]

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
      className="ui-text-primary relative min-h-screen overflow-hidden bg-[#0d1b2a] bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      {/* The photo graded in the app's colours: deep navy into cyan, with a little amber warmth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, hsl(214 40% 7% / 0.9) 0%, hsl(200 65% 16% / 0.8) 48%, hsl(187 85% 34% / 0.6) 100%)'
        }}
      />
      <div className="pointer-events-none absolute -bottom-44 -left-40 size-[36rem] rounded-full bg-[radial-gradient(circle,hsl(38_92%_56%/0.26),transparent_65%)]" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Brand story (wide screens) */}
        <section className="hidden text-white lg:block">
          <div className="mb-10 flex items-center gap-3">
            <img src={logoImg} alt="Milvo Dairy Solution" className="size-16 shrink-0 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]" />
            <div>
              <p className="ui-font-display text-[24px] font-extrabold leading-tight">Milvo Dairy Solution</p>
              <p className="text-[12px] font-medium text-white/65">Dairy Management</p>
            </div>
          </div>

          <h2 className="ui-font-display text-[44px] font-extrabold leading-[1.08] tracking-tight">
            Streamline Your{' '}
            <span className="text-[color:var(--ui-accent-400)]">Dairy Operations</span>
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/75">
            Manage milk collection, payments and inventory with one simple, fast dairy management
            app.
          </p>

          <ul className="mt-9 space-y-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-[color:var(--ui-primary-300)] backdrop-blur">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold">{title}</span>
                  <span className="block text-[13px] text-white/65">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <GlassCard
          as="main"
          variant="frost"
          className="ui-animate-rise-in w-full max-w-[26rem] justify-self-center p-7 sm:p-10 lg:justify-self-end"
        >
          <div className="mb-7 flex flex-col items-center text-center">
            <img src={logoImg} alt="Milvo Dairy Solution" className="mb-4 size-24 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.3)] lg:hidden" />
            <h1 className="ui-font-display text-[26px] font-extrabold tracking-tight">
              Welcome back
            </h1>
            <p className="ui-text-secondary mt-1 text-[13.5px]">
              Sign in to your account to continue
            </p>
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
      </div>

      <p className="absolute bottom-4 left-0 right-0 z-10 px-4 text-center text-[10.5px] font-medium uppercase tracking-widest text-white/90 [text-shadow:0_1px_6px_rgb(0_0_0/0.35)]">
        &copy; {new Date().getFullYear()} All rights reserved
        {version ? ` · Version ${version}` : ''}
      </p>
    </div>
  )
}

export default Login
