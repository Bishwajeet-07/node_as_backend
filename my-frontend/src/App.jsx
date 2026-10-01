import { useAuth } from "./context/AuthContext"
import Auth from "./components/Auth"
import Todos from "./components/Todos"

export default function App() {
  const { token, user, dark, toggleTheme, login, logout, updateProfileData } = useAuth()

  return (
    <div className={`h-screen w-screen overflow-hidden ${dark ? "dark" : ""}`}>
      {!token ? (
        <Auth onLogin={login} dark={dark} toggleTheme={toggleTheme} />
      ) : (
        <Todos
          token={token}
          user={user}
          onLogout={logout}
          dark={dark}
          toggleTheme={toggleTheme}
          onUpdateProfile={updateProfileData}
        />
      )}
    </div>
  )
}
