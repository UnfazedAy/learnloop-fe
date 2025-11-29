import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { useGoals } from "@/hooks/useGoals"

export default function GoalsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { goals, addGoal, deleteGoal } = useGoals()

  const [loading, setLoading] = useState(true)

  const [newGoal, setNewGoal] = useState({
    title: "",
    type: "time" as const,
    targetValue: 1,
    targetUnit: "hours",
    description: "",
    frequency: "daily" as const,
  })

  const [openDialog, setOpenDialog] = useState(false)

  // React Router version of auth guard
  useEffect(() => {
    if (!user) {
      navigate("/login")
    } else {
      setLoading(false)
    }
  }, [user, navigate])

  if (loading) return null

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.targetUnit) {
      addGoal({
        title: newGoal.title,
        description: newGoal.description,
        goalType: newGoal.type,
        targetValue: newGoal.targetValue,
        targetUnit: newGoal.targetUnit,
        frequency: newGoal.frequency,
      })

      // Reset
      setNewGoal({
        title: "",
        type: "time",
        targetValue: 1,
        targetUnit: "hours",
        description: "",
        frequency: "daily",
      })

      setOpenDialog(false)
    }
  }

  return (
    <>
      <Navbar
        user={user}
        onLogout={() => {
          logout()
          navigate("/")
        }}
      />

      <div className="min-h-screen bg-background">
        
        {/* Page Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Learning Goals</h1>
                <p className="text-muted-foreground mt-1">Manage your learning objectives</p>
              </div>

              {/* New Goal Dialog */}
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Goal
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">

                    <div>
                      <label htmlFor="goalTitle" className="text-sm font-medium block mb-1">Goal Title</label>
                      <Input
                        id="goalTitle"
                        placeholder="e.g., Daily Coding Practice"
                        value={newGoal.title}
                        onChange={(e) =>
                          setNewGoal({ ...newGoal, title: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label htmlFor="goalDescription" className="text-sm font-medium block mb-1">Description</label>
                      <Input
                        id="goalDescription"
                        placeholder="Optional description"
                        value={newGoal.description}
                        onChange={(e) =>
                          setNewGoal({ ...newGoal, description: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label htmlFor="goalType" className="text-sm font-medium block mb-1">Goal Type</label>

                      <Select
                        value={newGoal.type}
                        onValueChange={(value) =>
                          setNewGoal({ ...newGoal, type: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="time">Time-based</SelectItem>
                          <SelectItem value="completion">Completion-based</SelectItem>
                          <SelectItem value="custom">Custom Metric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">

                      <div>
                        <label htmlFor="targetValue" className="text-sm font-medium block mb-1">Target Value</label>
                        <Input
                          id="targetValue"
                          type="number"
                          min="1"
                          value={newGoal.targetValue}
                          onChange={(e) =>
                            setNewGoal({
                              ...newGoal,
                              targetValue: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label htmlFor="targetUnit" className="text-sm font-medium block mb-1">Unit</label>
                        <Input
                          id="targetUnit"
                          placeholder="hours, pages, modules"
                          value={newGoal.targetUnit}
                          onChange={(e) =>
                            setNewGoal({ ...newGoal, targetUnit: e.target.value })
                          }
                        />
                      </div>

                    </div>

                    <div>
                      <label htmlFor="frequency" className="text-sm font-medium block mb-1">Frequency</label>

                      <Select
                        value={newGoal.frequency}
                        onValueChange={(value) =>
                          setNewGoal({ ...newGoal, frequency: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full" onClick={handleAddGoal}>
                      Create Goal
                    </Button>

                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {goals.length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">No goals yet. Create your first one!</p>
                <Button onClick={() => setOpenDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>
          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <Card
                  key={goal.id}
                  className="bg-card border-border hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex flex-row items-start justify-between pb-3">

                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium capitalize">{goal.goalType}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-sm font-medium">
                        {goal.targetValue} {goal.targetUnit}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Frequency</p>
                      <p className="text-sm font-medium capitalize">{goal.frequency}</p>
                    </div>
                  </CardContent>

                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

    </>
  )
}
