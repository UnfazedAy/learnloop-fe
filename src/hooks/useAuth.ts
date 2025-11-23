import { useState, useEffect } from "react"
import { Gender } from "@/types/gender"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  gender: Gender
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

      const storedUser = localStorage.getItem("learnloop_user")

      if (!storedUser) {
        throw new Error("No account found. Please register first.")
      }

      const parsedUser: User = JSON.parse(storedUser)

      if (parsedUser.email !== email) {
        throw new Error("Invalid credentials")
      }

      // Successful login
      setUser(parsedUser)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const register = async (newUser: Omit<User, "id">) => {
    try {
      setError(null)
      setLoading(true)

      const createdUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...newUser,
      }

      localStorage.setItem("learnloop_user", JSON.stringify(createdUser))
      setUser(createdUser)

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
