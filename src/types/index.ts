export enum Gender {
  Male = "male",
  Female = "female",
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  goalType: "time" | "completion" | "custom"
  targetValue: number
  targetUnit: string
  frequency: "daily" | "weekly" | "monthly"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProgressEntry {
  id: string
  goalId: string
  date: Date
  value: number
  notes?: string
  createdAt: Date
}

export interface Streak {
  id: string
  goalId: string
  currentStreak: number
  bestStreak: number
  lastCompletedDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Achievement {
  id: string
  type: string
  name: string
  description?: string
  earnedAt: Date
}

export interface UserProfile {
  id: string
  firstName: string
  lastName?: string
  email: string
  timezone: string
  notificationPreferences: {
    email: boolean
    push: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface DailyQuote {
  id: string
  quote: string
  author: string
  category?: string
}
