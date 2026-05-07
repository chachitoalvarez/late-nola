import { createContext, useContext, useState, type ReactNode } from 'react'

type AuthStep = 'email' | 'loading' | 'register' | 'sent'

interface AuthContextValue {
  isAuthenticated: boolean
  authEmail: string
  setAuthEmail: (v: string) => void
  authStep: AuthStep
  setAuthStep: (v: AuthStep) => void
  isLoginFlow: boolean
  setIsLoginFlow: (v: boolean) => void
  userName: string
  setUserName: (v: string) => void
  password: string
  setPassword: (v: string) => void
  loginError: string
  handleEmailSubmit: (e: React.FormEvent) => void
  handleRegisterSubmit: (e: React.FormEvent) => void
  handleLogout: () => void
}

const AUTH_STORAGE_KEY = 'tm_users'

interface StoredUser {
  email: string
  userName: string
  password: string
}

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '[]') as StoredUser[]
  } catch {
    return []
  }
}

function saveUser(user: StoredUser) {
  const users = getStoredUsers()
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([...users, user]))
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authStep, setAuthStep] = useState<AuthStep>('email')
  const [isLoginFlow, setIsLoginFlow] = useState(true)
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // TODO: replace with Supabase auth
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail.trim() || password.length < 6) return
    setAuthStep('loading')
    setLoginError('')

    setTimeout(() => {
      const users = getStoredUsers()
      const match = users.find(u => u.email === authEmail.trim())
      if (match) {
        if (match.password !== password) {
          setLoginError('Contraseña incorrecta.')
          setAuthStep('email')
          setPassword('')
        } else {
          setUserName(match.userName)
          setIsAuthenticated(true)
          setAuthStep('email')
          setPassword('')
        }
      } else {
        setIsLoginFlow(false)
        setAuthEmail('')
        setUserName('')
        setPassword('')
        setAuthStep('register')
      }
    }, 800)
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || password.length < 6 || !authEmail.trim()) return
    setAuthStep('loading')

    setTimeout(() => {
      saveUser({ email: authEmail.trim(), userName: userName.trim(), password })
      setIsAuthenticated(true)
      setAuthStep('email')
      setPassword('')
    }, 800)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAuthEmail('')
    setPassword('')
    setAuthStep('email')
    setIsLoginFlow(true)
    setLoginError('')
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated, authEmail, setAuthEmail, authStep, setAuthStep,
      isLoginFlow, setIsLoginFlow, userName, setUserName, password, setPassword,
      loginError, handleEmailSubmit, handleRegisterSubmit, handleLogout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
