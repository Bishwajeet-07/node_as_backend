import { useAuth } from "./hooks/useAuth"
import Auth from "./components/Auth"
import Todos from "./components/Todos"

export default function App() {
  const { token, user, dark, toggleTheme, handleLogin, handleLogout } = useAuth()

  return (
    <div className={`h-screen w-screen overflow-hidden ${dark ? "dark" : ""}`}>
      {!token ? (
        <Auth onLogin={handleLogin} dark={dark} toggleTheme={toggleTheme} />
      ) : (
        <Todos
          token={token}
          user={user}
          onLogout={handleLogout}
          dark={dark}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  )
}

