import { useState, useCallback } from "react"
import { mockGoals } from "@/lib/mock-data"
import type { Goal } from "@/types/index"

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addGoal = useCallback((goal: Goal) => {
    try {
      const newGoal: Goal = { ...goal }
      setGoals((prev) => [...prev, newGoal])
      return newGoal
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add goal")
      return null
    }
  }, [])

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    try {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update goal")
    }
  }, [])

  const deleteGoal = useCallback((id: string) => {
    try {
      setGoals((prev) => prev.filter((g) => g.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete goal")
    }
  }, [])

  return { goals, loading, error, addGoal, updateGoal, deleteGoal }
}
