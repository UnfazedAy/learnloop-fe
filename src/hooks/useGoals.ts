import { useCallback, useEffect, useState } from "react"
import type { Goal } from "@/types"
import {
  createGoalRequest,
  deleteGoalRequest,
  fetchGoalsRequest,
} from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export function useGoals() {
  const { getToken } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    const token = getToken()
    setError(null)

    if (!token) {
      setGoals([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setGoals(await fetchGoalsRequest(token))
    } catch (err) {
      setGoals([])
      setError("Failed to load goals")
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const addGoal = useCallback(async (
    goalData: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at" | "is_active">
  ) => {
    const token = getToken()
    setError(null)

    if (!token) {
      setError("You need to be logged in to add a goal")
      return null
    }

    try {
      const newGoal = await createGoalRequest(token, {
        title: goalData.title,
        description: goalData.description,
        goalType: goalData.goalType,
        targetValue: goalData.targetValue,
        targetUnit: goalData.targetUnit,
        frequency: goalData.frequency,
      })

      setGoals((prev) => [...prev, newGoal])
      return newGoal
    } catch (err) {
      setError("Failed to add goal")
      return null
    }
  }, [getToken])

  const deleteGoal = useCallback(async (id: string) => {
    const token = getToken()
    setError(null)

    if (!token) {
      setError("You need to be logged in to delete a goal")
      return
    }

    try {
      await deleteGoalRequest(token, id)
      setGoals((prev) => prev.filter((goal) => goal.id !== id))
    } catch (err) {
      setError("Failed to delete goal")
    }
  }, [getToken])

  useEffect(() => {
    let ignore = false

    const loadGoals = async () => {
      const token = getToken()

      if (!token) {
        if (!ignore) {
          setGoals([])
          setError(null)
          setLoading(false)
        }
        return
      }

      try {
        if (!ignore) {
          setLoading(true)
          setError(null)
        }

        const nextGoals = await fetchGoalsRequest(token)

        if (!ignore) {
          setGoals(nextGoals)
        }
      } catch (err) {
        if (!ignore) {
          setGoals([])
          setError("Failed to load goals")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadGoals()

    return () => {
      ignore = true
    }
  }, [getToken])

  return { goals, loading, error, addGoal, deleteGoal, refetchGoals: fetchGoals }
}
