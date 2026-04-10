import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, TrendingUp, Clock, Target } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useProgress } from "@/hooks/useProgress";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

export default function ProgressPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [dialogGoalId, setDialogGoalId] = useState("");
  const [logValue, setLogValue] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const { goals, loading: loadingGoals } = useGoals();
  const {
    completionRate,
    totalDaysTracked,
    totalEntries,
    goalSummaries,
    recentEntries,
    loadingStats,
    loadingRecentEntries,
    loading: isLogging,
    error: progressError,
    logProgress,
  } = useProgress({
    goalId: selectedGoalId || undefined,
    period: "month",
    includeRecentEntries: true,
    recentLimit: 10,
    recentDateRange: "month",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (goals.length > 0 && !dialogGoalId) {
      const firstActive = goals.find((goal) => goal.is_active);
      if (firstActive) {
        setDialogGoalId(firstActive.id);
      }
    }
  }, [dialogGoalId, goals]);

  const handleLogProgress = async () => {
    if (!dialogGoalId || !logValue) {
      toast.error("Please select a goal and enter a value.");
      return;
    }

    const result = await logProgress(dialogGoalId, parseFloat(logValue), logNotes);

    if (result) {
      setLogDialogOpen(false);
      setLogValue("");
      setLogNotes("");
      toast.success("Progress logged successfully.");
      return;
    }

    toast.error(progressError || "Failed to log progress. Please try again.");
  };

  const getGoalTitle = (goalId: string) => {
    const goal = goals.find((item) => item.id === goalId);
    return goal?.title || "Unknown Goal";
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
                <h1 className="text-2xl sm:text-3xl font-bold">Progress</h1>
                <p className="text-muted-foreground mt-1">
                  Track your progress and view your history
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label htmlFor="goal-select" className="sr-only">
                  Select a goal
                </label>
                <select
                  id="goal-select"
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

                <Button
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => setLogDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Log Progress
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-500" />
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
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                    <p className="text-2xl font-bold">
                      {loadingStats ? "..." : totalEntries}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Goal Progress Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : goalSummaries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No stats available yet. Log progress to start seeing goal summaries.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goalSummaries.map((entry) => (
                    <div
                      key={entry.goalId}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-primary" />
                          <p className="font-medium">
                            {entry.goalTitle || getGoalTitle(entry.goalId)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Current period progress:{" "}
                          <span className="font-medium">
                            {entry.currentPeriodProgress} {entry.targetUnit}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Average logged value:{" "}
                          <span className="font-medium">{entry.averageValue}</span>
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground ml-4">
                        {entry.currentProgressPercentage}% of target
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecentEntries ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : recentEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No recent entries yet. Log progress to start building history.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-primary" />
                          <p className="font-medium">
                            {entry.goal?.title || getGoalTitle(entry.goalId)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Logged value: <span className="font-medium">{entry.value}</span>
                          {entry.goal?.targetUnit ? ` ${entry.goal.targetUnit}` : ""}
                        </p>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground ml-4">
                        {entry.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Progress</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Goal</label>
              <Select value={dialogGoalId} onValueChange={setDialogGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="value" className="text-sm font-medium block mb-2">
                Value
              </label>
              <Input
                id="value"
                type="number"
                placeholder="Enter progress value"
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setLogDialogOpen(false);
                setLogValue("");
                setLogNotes("");
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
