import { useState, useMemo } from "react"
import { mockProgressEntries, mockStreaks, getProgressByWeek } from "@/lib/mock-data"

export function useProgress() {
  const [progressEntries] = useState(mockProgressEntries)
  const [streaks] = useState(mockStreaks)

  const getProgressForGoal = useMemo(() => {
    return (goalId: string) => {
      return progressEntries.filter((p) => p.goalId === goalId)
    }
  }, [progressEntries])

  const getStreakForGoal = useMemo(() => {
    return (goalId: string) => {
      return streaks.find((s) => s.goalId === goalId)
    }
  }, [streaks])

  const getWeeklyStats = useMemo(() => {
    return (goalId: string) => {
      return getProgressByWeek(goalId)
    }
  }, [])

  const getCompletionRate = useMemo(() => {
    return (goalId: string) => {
      const dayProgress = getProgressByWeek(goalId)
      const completed = dayProgress.filter((d) => d.completed).length
      return Math.round((completed / dayProgress.length) * 100)
    }
  }, [getProgressByWeek])

  return { progressEntries, streaks, getProgressForGoal, getStreakForGoal, getWeeklyStats, getCompletionRate }
}
