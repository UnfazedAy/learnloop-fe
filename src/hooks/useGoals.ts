import { useCallback, useEffect, useState } from "react"
import type { Goal } from "@/types/index"
import { api } from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"

export function useGoals() {
  const { getToken } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = getToken()

  // FETCH GOALS FROM API
  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/goals", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const formatted = res.data.data.map((g: any) => ({
        id: g.id,
        user_id: g.user_id,
        title: g.title,
        description: g.description,
        goalType: g.goal_type,
        targetValue: g.target_value,
        targetUnit: g.target_unit,
        frequency: g.frequency,
        is_active: g.is_active,
        created_at: g.created_at,
        updated_at: g.updated_at,
      }))

      setGoals(formatted)
    } catch (err) {
      setError("Failed to load goals")
    } finally {
      setLoading(false)
    }
  }, [])

  // ADD GOAL TO API
  const addGoal = useCallback(async (goalData: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at" | "is_active">) => {
    try {
      const res = await api.post("/goals", {
        title: goalData.title,
        description: goalData.description,
        goalType: goalData.goalType,
        targetValue: goalData.targetValue,
        targetUnit: goalData.targetUnit,
        frequency: goalData.frequency,
      },{
        headers: { Authorization: `Bearer ${token}` },
      })

      const goal = res.data.data

      const newGoal: Goal = {
        id: goal.id,
        user_id: goal.user_id,
        title: goal.title,
        description: goal.description,
        goalType: goal.goal_type,
        targetValue: goal.target_value,
        targetUnit: goal.target_unit,
        frequency: goal.frequency,
        is_active: goal.is_active,
        created_at: goal.created_at,
        updated_at: goal.updated_at,
      }

      setGoals((prev) => [...prev, newGoal])
      return newGoal
    } catch (err) {
      setError("Failed to add goal")
      return null
    }
  }, [])

  // DELETE GOAL FROM API
  const deleteGoal = useCallback(async (id: string) => {
    try {
      await api.delete(`/goals/${id}`,{
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      setGoals((prev) => prev.filter((g) => g.id !== id))
    } catch (err) {
      setError("Failed to delete goal")
    }
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return { goals, loading, error, addGoal, deleteGoal }
}
