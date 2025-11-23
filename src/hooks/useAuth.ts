import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  firstName: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("learnloop_user")

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("learnloop_user")
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, _password: string) => {
    try {
      setError(null)
      setLoading(true)

      // TODO: Replace with real backend call later
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        firstName: email.split("@")[0],
      }

      localStorage.setItem("learnloop_user", JSON.stringify(mockUser))
      setUser(mockUser)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, _password: string, firstName: string) => {
    try {
      setError(null)
      setLoading(true)

      // TODO: Replace with real backend call later
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        firstName,
      }

      localStorage.setItem("learnloop_user", JSON.stringify(mockUser))
      setUser(mockUser)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("learnloop_user")
    setUser(null)
  }

  return { user, loading, error, login, register, logout }
}
