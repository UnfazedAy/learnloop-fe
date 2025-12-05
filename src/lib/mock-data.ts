import type { Streak, Achievement, DailyQuote } from "@/types"

export const mockStreaks: Streak[] = [
  {
    id: "streak-1",
    goalId: "goal-1",
    currentStreak: 8,
    bestStreak: 12,
    lastCompletedDate: new Date("2025-01-15"),
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "streak-2",
    goalId: "goal-2",
    currentStreak: 8,
    bestStreak: 10,
    lastCompletedDate: new Date("2025-01-15"),
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "streak-3",
    goalId: "goal-3",
    currentStreak: 8,
    bestStreak: 8,
    lastCompletedDate: new Date("2025-01-15"),
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-15"),
  },
]

export const mockAchievements: Achievement[] = [
  {
    id: "ach-1",
    type: "streak",
    name: "Week Warrior",
    description: "Maintain a 7-day streak on any goal",
    earnedAt: new Date("2025-01-15"),
  },
  {
    id: "ach-2",
    type: "productivity",
    name: "Early Bird",
    description: "Complete a goal before 9 AM",
    earnedAt: new Date("2025-01-10"),
  },
  {
    id: "ach-3",
    type: "goal",
    name: "Goal Setter",
    description: "Create your first learning goal",
    earnedAt: new Date("2025-01-01"),
  },
]

export const mockQuotes: DailyQuote[] = [
  {
    id: "q1",
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation",
  },
  {
    id: "q2",
    quote: "Learning is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    category: "learning",
  },
  {
    id: "q3",
    quote: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
    author: "Brian Herbert",
    category: "growth",
  },
  {
    id: "q4",
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "persistence",
  },
  {
    id: "q5",
    quote: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: "inspiration",
  },
]

export function getTodayQuote(): DailyQuote {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  return mockQuotes[dayOfYear % mockQuotes.length]
}
