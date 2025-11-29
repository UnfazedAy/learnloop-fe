// src/pages/DashboardPage.tsx
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect, useMemo } from "react"
import { Navbar } from "@/components/Navbar"
import { StatCard } from "@/components/StatCard"
import { GoalCard } from "@/components/GoalCard"
import { QuoteCard } from "@/components/QuoteCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Plus, Flame, TrendingUp, CheckCircle2, Award } from "lucide-react"
import { Link } from "react-router-dom"
import { useGoals } from "@/hooks/useGoals"
import { useProgress } from "@/hooks/useProgress"
import { getTodayQuote, mockAchievements } from "@/lib/mock-data"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { goals } = useGoals()
  const { getStreakForGoal, getWeeklyProgress, getCompletionRate } = useProgress()

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  // Safe: pick first active goal for chart, fallback to any goal
  const chartGoalId = goals.find((g) => g.is_active)?.id || goals[0]?.id || ""
  const weeklyProgress = useMemo(
    () => (chartGoalId ? getWeeklyProgress(chartGoalId) : []),
    [chartGoalId, getWeeklyProgress]
  )

  const dailyQuote = getTodayQuote()

  const totalStreak = useMemo(() => {
    return goals.reduce((sum, g) => {
      return sum + (getStreakForGoal(g.id)?.currentStreak || 0)
    }, 0)
  }, [goals, getStreakForGoal])

  const avgProgress = useMemo(() => {
    if (goals.length === 0) return 0
    const total = goals.reduce((sum, g) => sum + getCompletionRate(g.id), 0)
    return Math.round(total / goals.length)
  }, [goals, getCompletionRate])

  const activeGoalsCount = goals.filter((g) => g.is_active).length

  return (
    <>
      <Navbar
        user={user || undefined}
        onLogout={() => {
          logout()
          navigate("/")
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {user?.first_name}!
                </p>
              </div>
              <Link to="/goals">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Goal
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Current Streak"
              value={`${totalStreak} days`}
              subtitle="Keep it going!"
              icon={Flame}
              iconBgColor="bg-orange-500/10"
              iconColor="text-orange-500"
            />
            <StatCard
              title="Weekly Average"
              value={`${avgProgress}%`}
              subtitle="Great progress this week"
              icon={TrendingUp}
              iconBgColor="bg-accent/10"
              iconColor="text-accent"
            />
            <StatCard
              title="Active Goals"
              value={activeGoalsCount}
              subtitle="All on track"
              icon={CheckCircle2}
              iconBgColor="bg-secondary/10"
              iconColor="text-secondary"
            />
          </div>

          {/* Quote */}
          <div className="mb-8">
            <QuoteCard quote={dailyQuote.quote} author={dailyQuote.author} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Goals List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Today's Goals
              </h2>

              {activeGoalsCount > 0 ? (
                goals
                  .filter((g) => g.is_active)
                  .map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      streak={getStreakForGoal(goal.id)?.currentStreak || 0}
                      progress={getCompletionRate(goal.id)}
                    />
                  ))
              ) : (
                <Card className="bg-card border-border text-center py-8">
                  <p className="text-muted-foreground">
                    No active goals. Create your first goal to get started!
                  </p>
                </Card>
              )}
            </div>

            {/* Chart + Achievements */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Weekly Performance
                </h2>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <ChartContainer
                      config={{
                        completed: {
                          label: "Completion %",
                          color: "hsl(var(--primary))",
                        },
                      }}
                      className="h-64"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="day" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
                          <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
                          <Tooltip content={<ChartTooltip content={<ChartTooltipContent />} />} />
                          <Bar dataKey="completed" radius={[8, 8, 0, 0]}>
                            {weeklyProgress.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={
                                  entry.completed
                                    ? "var(--primary)"
                                    : "var(--muted)"
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAchievements.slice(0, 2).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                    >
                      <Award className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{achievement.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}