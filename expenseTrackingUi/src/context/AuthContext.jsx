import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authEvents, authApi } from "../services/api"

export const AuthContext = createContext(null)

export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
}

export function formatCurrency(amount, currency = "INR") {
  const symbol = CURRENCY_SYMBOLS[currency] || currency || "₹"
  const val = Number(amount) || 0
  return `${symbol}${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("expense_token") || localStorage.getItem("token"))
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme")
    if (saved) return saved === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // Sync theme
  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [dark])

  const toggleTheme = () => setDark((prev) => !prev)

  const logout = useCallback(() => {
    localStorage.removeItem("expense_token")
    localStorage.removeItem("token")
    localStorage.removeItem("expense_user")
    setToken(null)
    setUser(null)
  }, [])

  // Auto logout on 401
  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
    }
    authEvents.addEventListener("unauthorized", handleUnauthorized)
    return () => {
      authEvents.removeEventListener("unauthorized", handleUnauthorized)
    }
  }, [logout])

  // Fetch logged in user profile on load
  const fetchMe = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await authApi.getMe()
      if (res && res.success && res.data) {
        setUser(res.data)
        localStorage.setItem("expense_user", JSON.stringify(res.data))
      }
    } catch (err) {
      // If unauthorized, handled by event
      console.warn("Could not fetch user profile:", err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchMe()
    }
  }, [token, fetchMe])

  const login = (newToken, userData) => {
    localStorage.setItem("expense_token", newToken)
    localStorage.setItem("token", newToken)
    localStorage.setItem("expense_user", JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }

  const value = {
    token,
    user,
    loading,
    dark,
    toggleTheme,
    login,
    logout,
    refreshUser: fetchMe,
    currency: user?.defaultCurrency || "INR",
    currencySymbol: CURRENCY_SYMBOLS[user?.defaultCurrency || "INR"] || "₹",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
