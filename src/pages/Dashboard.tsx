import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Flame, Plus, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useProgress } from "@/hooks/useProgress";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import type { Goal } from "@/types";

type GoalProgress = {
  goalId: string;
  todayProgress: number;
  percentComplete: number;
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [logValue, setLogValue] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const { goals, loading: loadingGoals } = useGoals();
  const {
    completionRate,
    totalDaysTracked,
    goalSummaries,
    loadingStats,
    loading: isLogging,
    error: progressError,
    logProgress,
  } = useProgress({
    goalId: selectedGoalId || undefined,
    period: "week",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const goalProgressMap = useMemo(
    () =>
      Object.fromEntries(
        goalSummaries.map((item) => [
          item.goalId,
          {
            goalId: item.goalId,
            todayProgress: item.currentPeriodProgress,
            percentComplete: item.currentProgressPercentage,
          } satisfies GoalProgress,
        ])
      ) as Record<string, GoalProgress>,
    [goalSummaries]
  );

  const activeGoals = goals.filter((goal) => goal.is_active);
  const displayedGoals = selectedGoalId
    ? activeGoals.filter((goal) => goal.id === selectedGoalId)
    : activeGoals;

  const handleLogProgress = async () => {
    if (!selectedGoal || !logValue) return;

    const result = await logProgress(
      selectedGoal.id,
      parseFloat(logValue),
      logNotes
    );

    if (result) {
      setLogDialogOpen(false);
      setLogValue("");
      setLogNotes("");
      setSelectedGoal(null);
      toast.success("Progress logged successfully.");
      return;
    }

    toast.error(progressError || "Failed to log progress. Please try again.");
  };

  return (
    <>
      <Navbar
        user={user || undefined}
        onLogout={() => {
          logout();
          navigate("/");
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {user?.first_name || "User"}!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  aria-label="Filter goals"
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="border rounded-md px-3 py-2 bg-white"
                  disabled={loadingGoals}
                >
                  <option value="">All Goals</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>

                <Link to="/goals">
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    New Goal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Days Tracked</p>
                    <p className="text-2xl font-bold">
                      {loadingStats ? "..." : totalDaysTracked}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {loadingStats ? "..." : `${completionRate}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Goals</p>
                    <p className="text-2xl font-bold">{activeGoals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">
              {selectedGoalId ? "Selected Goal" : "Your Goals"}
            </h2>

            {loadingGoals ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : displayedGoals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    {selectedGoalId
                      ? "Goal not found or inactive."
                      : "No active goals yet. Create your first goal to get started!"}
                  </p>
                  {!selectedGoalId && (
                    <Link to="/goals">
                      <Button>Create Goal</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedGoals.map((goal) => {
                  const progress = goalProgressMap[goal.id] || {
                    todayProgress: 0,
                    percentComplete: 0,
                  };

                  return (
                    <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Target className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 break-words">
                              {goal.title}
                            </h3>
                            <p className="text-sm text-muted-foreground break-words mb-3">
                              {goal.description}
                            </p>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  {progress.todayProgress} / {goal.targetValue}{" "}
                                  {goal.targetUnit}
                                </span>
                              </div>
                              <Progress value={progress.percentComplete} className="h-2" />
                              <p className="text-xs text-muted-foreground text-right">
                                {progress.percentComplete}% complete
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <span>
                            Target: {goal.targetValue} {goal.targetUnit}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{goal.frequency}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => {
                              setSelectedGoal(goal);
                              setLogDialogOpen(true);
                            }}
                          >
                            Log Progress
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/goals/${goal.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Progress</DialogTitle>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Goal</p>
                <p className="text-sm text-muted-foreground">{selectedGoal.title}</p>
              </div>

              <div>
                <label htmlFor="value" className="text-sm font-medium block mb-2">
                  Value ({selectedGoal.targetUnit})
                </label>
                <Input
                  id="value"
                  type="number"
                  placeholder={`e.g., ${selectedGoal.targetValue}`}
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="notes" className="text-sm font-medium block mb-2">
                  Notes (optional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="How did it go?"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setLogDialogOpen(false);
                setLogValue("");
                setLogNotes("");
                setSelectedGoal(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogProgress}
              disabled={!logValue || isLogging}
              className="w-full sm:w-auto"
            >
              {isLogging ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
