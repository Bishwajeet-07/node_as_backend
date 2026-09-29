import { useState, useEffect } from "react"

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme")
    if (saved) return saved === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

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

  const handleLogin = (newToken, userData) => {
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  return {
    token,
    user,
    dark,
    toggleTheme,
    handleLogin,
    handleLogout,
  }
}

