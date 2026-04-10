import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  fetchProgressEntriesRequest,
  fetchProgressStatsRequest,
  logProgressRequest,
  type GoalBreakdownItem,
  type ProgressEntry,
} from "@/lib/api"

type UseProgressOptions = {
  goalId?: string
  period?: string
  recentLimit?: number
  recentDateRange?: string
  includeRecentEntries?: boolean
}

type GoalSummary = {
  goalId: string
  goalTitle: string
  averageValue: number
  completionRate: number
  currentPeriodProgress: number
  currentProgressPercentage: number
  remainingToTarget: number
  targetValue: number
  targetUnit: string
  frequency: string
}

export function useProgress(options: UseProgressOptions = {}) {
  const {
    goalId,
    period = "month",
    recentLimit = 10,
    recentDateRange = "month",
    includeRecentEntries = false,
  } = options

  const { getToken } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingRecentEntries, setLoadingRecentEntries] = useState(includeRecentEntries)
  const [completionRate, setCompletionRate] = useState(0)
  const [totalDaysTracked, setTotalDaysTracked] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)
  const [goalSummaries, setGoalSummaries] = useState<GoalSummary[]>([])
  const [recentEntries, setRecentEntries] = useState<ProgressEntry[]>([])

  const refreshStats = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setCompletionRate(0)
      setTotalDaysTracked(0)
      setTotalEntries(0)
      setGoalSummaries([])
      setLoadingStats(false)
      return
    }

    try {
      setLoadingStats(true)
      const data = await fetchProgressStatsRequest(token, { goalId, period })

      setCompletionRate(data.completionRate)
      setTotalDaysTracked(data.totalDaysTracked)
      setTotalEntries(data.totalEntries)
      setGoalSummaries(
        Object.values(data.goalBreakdown).map((item: GoalBreakdownItem) => ({
          goalId: item.goalId,
          goalTitle: item.goalTitle,
          averageValue: item.averageValue,
          completionRate: item.completionRate,
          currentPeriodProgress: item.currentPeriodProgress,
          currentProgressPercentage: item.currentProgressPercentage,
          remainingToTarget: item.remainingToTarget,
          targetValue: item.targetValue,
          targetUnit: item.targetUnit,
          frequency: item.frequency,
        }))
      )
    } catch (err) {
      console.error("Failed to fetch progress stats:", err)
      setError("Failed to load progress stats")
      setGoalSummaries([])
    } finally {
      setLoadingStats(false)
    }
  }, [getToken, goalId, period])

  const refreshRecentEntries = useCallback(async () => {
    if (!includeRecentEntries) {
      setRecentEntries([])
      setLoadingRecentEntries(false)
      return
    }

    const token = getToken()

    if (!token) {
      setRecentEntries([])
      setLoadingRecentEntries(false)
      return
    }

    try {
      setLoadingRecentEntries(true)
      const entries = await fetchProgressEntriesRequest(token, {
        goalId,
        limit: recentLimit,
        dateRange: recentDateRange,
      })
      setRecentEntries(entries)
    } catch (err) {
      console.error("Failed to fetch recent progress:", err)
      setError("Failed to load recent progress")
      setRecentEntries([])
    } finally {
      setLoadingRecentEntries(false)
    }
  }, [getToken, goalId, includeRecentEntries, recentDateRange, recentLimit])

  const refresh = useCallback(async () => {
    setError(null)
    await Promise.all([refreshStats(), refreshRecentEntries()])
  }, [refreshRecentEntries, refreshStats])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  useEffect(() => {
    refreshRecentEntries()
  }, [refreshRecentEntries])

  const logProgress = useCallback(async (nextGoalId: string, value: number, notes: string) => {
    const token = getToken()
    setError(null)

    if (!token) {
      const message = "You need to be logged in to log progress"
      setError(message)
      return null
    }

    try {
      setLoading(true)
      const result = await logProgressRequest(token, nextGoalId, { value, notes })
      await Promise.all([refreshStats(), refreshRecentEntries()])
      return result
    } catch (err) {
      console.error("Failed to log progress:", err)
      setError("Failed to log progress")
      return null
    } finally {
      setLoading(false)
    }
  }, [getToken, refreshRecentEntries, refreshStats])

  return {
    logProgress,
    loading,
    loadingStats,
    loadingRecentEntries,
    error,
    completionRate,
    totalDaysTracked,
    totalEntries,
    goalSummaries,
    recentEntries,
    refresh,
  }
}
