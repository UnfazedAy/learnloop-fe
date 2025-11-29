import type { Goal, ProgressEntry, Streak, Achievement, DailyQuote } from "@/types"

export const mockGoals: Goal[] = [
  {
    id: "goal-1",
    title: "Learn React Advanced Patterns",
    description: "Master advanced React concepts like hooks, context, and performance optimization",
    goalType: "time",
    targetValue: 2,
    targetUnit: "hours",
    frequency: "daily",
    isActive: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "goal-2",
    title: "Complete TypeScript Course",
    description: "Complete the Udemy TypeScript course - 30 modules",
    goalType: "completion",
    targetValue: 2,
    targetUnit: "modules",
    frequency: "daily",
    isActive: true,
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "goal-3",
    title: "Read Technical Blogs",
    description: "Read at least 2 technical blog posts daily",
    goalType: "custom",
    targetValue: 2,
    targetUnit: "posts",
    frequency: "daily",
    isActive: true,
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "goal-4",
    title: "Write Code Snippets",
    description: "Write and share code snippets on GitHub",
    goalType: "completion",
    targetValue: 1,
    targetUnit: "snippet",
    frequency: "daily",
    isActive: false,
    createdAt: new Date("2024-12-20"),
    updatedAt: new Date("2025-01-15"),
  },
]

export const mockProgressEntries: ProgressEntry[] = [
  // Week 1
  {
    id: "p1",
    goalId: "goal-1",
    date: new Date("2025-01-08"),
    value: 2,
    notes: "Completed hooks deep dive",
    createdAt: new Date("2025-01-08"),
  },
  {
    id: "p2",
    goalId: "goal-2",
    date: new Date("2025-01-08"),
    value: 2,
    notes: "Completed modules 1-2",
    createdAt: new Date("2025-01-08"),
  },
  { id: "p3", goalId: "goal-3", date: new Date("2025-01-08"), value: 2, notes: "", createdAt: new Date("2025-01-08") },
  // Week 2
  { id: "p4", goalId: "goal-1", date: new Date("2025-01-09"), value: 2, notes: "", createdAt: new Date("2025-01-09") },
  {
    id: "p5",
    goalId: "goal-2",
    date: new Date("2025-01-09"),
    value: 1,
    notes: "Completed module 3",
    createdAt: new Date("2025-01-09"),
  },
  {
    id: "p6",
    goalId: "goal-3",
    date: new Date("2025-01-09"),
    value: 3,
    notes: "Read extra article",
    createdAt: new Date("2025-01-09"),
  },
  { id: "p7", goalId: "goal-1", date: new Date("2025-01-10"), value: 2, notes: "", createdAt: new Date("2025-01-10") },
  { id: "p8", goalId: "goal-2", date: new Date("2025-01-10"), value: 2, notes: "", createdAt: new Date("2025-01-10") },
  { id: "p9", goalId: "goal-3", date: new Date("2025-01-10"), value: 2, notes: "", createdAt: new Date("2025-01-10") },
  {
    id: "p10",
    goalId: "goal-1",
    date: new Date("2025-01-11"),
    value: 1.5,
    notes: "Short session",
    createdAt: new Date("2025-01-11"),
  },
  { id: "p11", goalId: "goal-2", date: new Date("2025-01-11"), value: 2, notes: "", createdAt: new Date("2025-01-11") },
  { id: "p12", goalId: "goal-3", date: new Date("2025-01-11"), value: 2, notes: "", createdAt: new Date("2025-01-11") },
  { id: "p13", goalId: "goal-1", date: new Date("2025-01-12"), value: 2, notes: "", createdAt: new Date("2025-01-12") },
  { id: "p14", goalId: "goal-2", date: new Date("2025-01-12"), value: 2, notes: "", createdAt: new Date("2025-01-12") },
  { id: "p15", goalId: "goal-3", date: new Date("2025-01-12"), value: 2, notes: "", createdAt: new Date("2025-01-12") },
  { id: "p16", goalId: "goal-1", date: new Date("2025-01-13"), value: 2, notes: "", createdAt: new Date("2025-01-13") },
  { id: "p17", goalId: "goal-2", date: new Date("2025-01-13"), value: 2, notes: "", createdAt: new Date("2025-01-13") },
  {
    id: "p18",
    goalId: "goal-3",
    date: new Date("2025-01-13"),
    value: 1,
    notes: "Busy day",
    createdAt: new Date("2025-01-13"),
  },
  // Current week
  { id: "p19", goalId: "goal-1", date: new Date("2025-01-14"), value: 2, notes: "", createdAt: new Date("2025-01-14") },
  { id: "p20", goalId: "goal-2", date: new Date("2025-01-14"), value: 2, notes: "", createdAt: new Date("2025-01-14") },
  { id: "p21", goalId: "goal-3", date: new Date("2025-01-14"), value: 2, notes: "", createdAt: new Date("2025-01-14") },
  { id: "p22", goalId: "goal-1", date: new Date("2025-01-15"), value: 2, notes: "", createdAt: new Date("2025-01-15") },
  { id: "p23", goalId: "goal-2", date: new Date("2025-01-15"), value: 2, notes: "", createdAt: new Date("2025-01-15") },
  { id: "p24", goalId: "goal-3", date: new Date("2025-01-15"), value: 2, notes: "", createdAt: new Date("2025-01-15") },
]

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

export function getProgressByWeek(goalId: string) {
  const today = new Date()
  const weekData = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]

    const dayProgress = mockProgressEntries.filter((p) => {
      const pDate = new Date(p.date)
      return p.goalId === goalId && pDate.toDateString() === date.toDateString()
    })

    weekData.push({
      day: dayName,
      date: date.toLocaleDateString(),
      completed: dayProgress.length > 0,
      value: dayProgress.reduce((sum, p) => sum + p.value, 0),
    })
  }

  return weekData
}
