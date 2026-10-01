import AuthLayout from "./auth/AuthLayout"
import AuthForm from "./auth/AuthForm"
import { useAuth } from "../context/AuthContext"

export default function Auth() {
  const { dark, toggleTheme } = useAuth()

  return (
    <AuthLayout dark={dark} toggleTheme={toggleTheme}>
      <AuthForm />
    </AuthLayout>
  )
}

