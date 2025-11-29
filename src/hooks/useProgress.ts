import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/axios"

interface WeeklyDay {
  day: string
  value: number
  completed: boolean
}

export function useProgress() {
  const [loading, setLoading] = useState(false)
  const [weeklyCache, setWeeklyCache] = useState<Record<string, WeeklyDay[]>>({})
  const [completionCache, setCompletionCache] = useState<Record<string, number>>({})
  const { getToken } = useAuth()

  const token = getToken()

  // POST /progress/{goalId}
  const logProgress = useCallback(async (goalId: string, value: number, notes: string) => {
    try {
      setLoading(true)
      const res = await api.post(`/progress/${goalId}`, { value, notes }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data
    } finally {
      setLoading(false)
    }
  }, [])

  // GET /progress/stats?goalId=&period=week
  const getWeeklyStats = useCallback(
    async (goalId: string) => {
      if (weeklyCache[goalId]) return weeklyCache[goalId]

      const res = await api.get(`/progress/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { goalId, period: "week" },
      })

      const days = res.data?.data?.week || []
      setWeeklyCache(prev => ({ ...prev, [goalId]: days }))
      return days
    },
    [weeklyCache]
  )

  // GET /progress/stats?goalId=&period=month
  const getCompletionRate = useCallback(
    async (goalId: string) => {
      if (completionCache[goalId]) return completionCache[goalId]

      const res = await api.get(`/progress/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { goalId, period: "month" },
      })

      const rate = res.data?.data?.completionRate || 0
      setCompletionCache(prev => ({ ...prev, [goalId]: rate }))
      return rate
    },
    [completionCache]
  )

  return {
    logProgress,
    getWeeklyStats,
    getCompletionRate,
    loading,
  }
}
