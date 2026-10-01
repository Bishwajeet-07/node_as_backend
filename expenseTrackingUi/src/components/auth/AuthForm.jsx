import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { authApi } from "../../services/api"
import { LogIn, UserPlus, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"

export default function AuthForm() {
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    defaultCurrency: "INR",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setLoading(true)

    try {
      if (isLogin) {
        const res = await authApi.login({
          email: form.email.trim(),
          password: form.password,
        })
        if (res && res.token) {
          login(res.token, res.data)
        }
      } else {
        const res = await authApi.register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          defaultCurrency: form.defaultCurrency,
        })
        if (res && res.token) {
          login(res.token, res.data)
        } else {
          setIsLogin(true)
          setSuccessMsg(res.message || "Registration successful! You can now sign in.")
        }
      }
    } catch (err) {
      setError(err.message || "Could not complete authentication. Please verify your details.")
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (toLogin) => {
    if (isLogin === toLogin) return
    setIsLogin(toLogin)
    setError("")
    setSuccessMsg("")
  }

  return (
    <div className="w-full">
      {/* Segmented Control Tabs */}
      <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => switchTab(true)}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
            isLogin
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/60 dark:border-slate-600"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => switchTab(false)}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
            !isLogin
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/60 dark:border-slate-600"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Account</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span className="leading-relaxed">{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Viswa Mohan"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="viswa@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="w-full pl-3.5 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {!isLogin && (
            <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Minimum 6 characters
            </span>
          )}
        </div>

        {!isLogin && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Default Currency
            </label>
            <select
              value={form.defaultCurrency}
              onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isLogin ? "Signing in..." : "Creating account..."}
            </span>
          ) : (
            <>
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
