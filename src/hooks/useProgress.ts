// src/hooks/useProgress.ts
import { useCallback } from "react"
import { mockProgressEntries, mockStreaks, getProgressByWeek } from "@/lib/mock-data"

export function useProgress() {
  // Stable data
  const progressEntries = mockProgressEntries
  const streaks = mockStreaks

  // Stable function — get streak for a goal
  const getStreakForGoal = useCallback(
    (goalId: string) => {
      return streaks.find((s) => s.goalId === goalId) || { currentStreak: 0 }
    },
    [streaks]
  )

  // Stable function — get weekly progress for chart
  const getWeeklyProgress = useCallback(
    (goalId: string) => {
      return getProgressByWeek(goalId)
    },
    []
  )

  // Stable function — calculate completion % for the last 7 days
  const getCompletionRate = useCallback((goalId: string): number => {
    const weekData = getProgressByWeek(goalId)
    if (weekData.length === 0) return 0

    const completedDays = weekData.filter((d) => d.completed).length
    return Math.round((completedDays / weekData.length) * 100)
  }, [])

  return {
    getStreakForGoal,
    getWeeklyProgress,
    getCompletionRate,
  }
}