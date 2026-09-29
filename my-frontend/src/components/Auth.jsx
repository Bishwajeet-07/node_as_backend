import AuthLayout from "./auth/AuthLayout"
import AuthForm from "./auth/AuthForm"

export default function Auth({ onLogin, dark, toggleTheme }) {
  return (
    <AuthLayout dark={dark} toggleTheme={toggleTheme}>
      <AuthForm onLogin={onLogin} />
    </AuthLayout>
  )
}
