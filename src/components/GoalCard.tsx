import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Goal } from "@/types"
import { Flame, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

interface GoalCardProps {
  goal: Goal
  streak: number
  progress: number
  onLogClick?: () => void
}

const goalColors: Record<string, string> = {
  time: "bg-blue-500",
  completion: "bg-emerald-500",
  custom: "bg-purple-500",
}

export function GoalCard({ goal, streak, progress, onLogClick }: GoalCardProps) {
  const colorClass = goalColors[goal.type] || "bg-blue-500"

  return (
    <Card className="bg-card border-border hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{goal.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Target: {goal.targetValue} {goal.targetUnit}
            </p>
            {goal.description && <p className="text-xs text-muted-foreground mt-2">{goal.description}</p>}
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-orange-500 text-sm">{streak}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-muted-foreground">Progress Today</span>
            <span className="text-sm font-bold text-foreground">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${colorClass} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onLogClick}>
            Log Progress
          </Button>
          <Link to={`/goals/${goal.id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
