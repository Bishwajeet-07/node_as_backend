import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authEvents, profileApi } from "../services/api"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme")
    if (saved) return saved === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // Sync dark theme to root element
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

  const toggleTheme = () => {
    setDark((prev) => !prev)
  }

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    setProfile(null)
  }, [])

  // Listen to 401 Unauthorized Response Interceptor Event for Auto-Logout
  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
    }
    authEvents.addEventListener("unauthorized", handleUnauthorized)
    return () => {
      authEvents.removeEventListener("unauthorized", handleUnauthorized)
    }
  }, [logout])

  // Fetch Profile when token exists
  const fetchProfile = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await profileApi.getProfile()
      if (res && res.data) {
        setProfile(res.data)
        const updatedUser = { ...user, ...res.data }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    } catch {
      // Profile fetch optional fallback
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchProfile()
    }
  }, [token, fetchProfile])

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }

  const updateProfileData = async (formData) => {
    if (!token) return
    const res = await profileApi.updateProfile(formData)
    if (res && res.data) {
      setProfile(res.data)
      const updatedUser = { ...user, ...res.data }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
    return res
  }

  const value = {
    token,
    user: profile || user,
    profile,
    loading,
    dark,
    toggleTheme,
    login,
    logout,
    fetchProfile,
    updateProfileData,
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
