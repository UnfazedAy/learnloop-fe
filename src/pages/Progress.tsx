import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  fetchGoalsRequest,
  fetchProgressStatsRequest,
  logProgressRequest,
  type GoalBreakdownItem,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Calendar, Plus, TrendingUp, Clock, Target } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Goal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  target_unit: string;
  frequency: string;
  is_active: boolean;
}

interface GoalSummary {
  goalId: string;
  averageValue: number;
  completionRate: number;
}

export default function ProgressPage() {
  const { user, logout, getToken } = useAuth();
  const navigate = useNavigate();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [completionRate, setCompletionRate] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const [goalSummaries, setGoalSummaries] = useState<GoalSummary[]>([]);

  // Log dialog
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [dialogGoalId, setDialogGoalId] = useState("");
  const [logValue, setLogValue] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const goalData = await fetchGoalsRequest(token);
        const goalsData = goalData.map((goal) => ({
          id: goal.id,
          title: goal.title,
          description: goal.description || "",
          target_value: goal.targetValue,
          target_unit: goal.targetUnit,
          frequency: goal.frequency,
          is_active: goal.is_active,
        }));
        setGoals(goalsData);
        
        // Set first active goal as default for dialog
        if (goalsData.length > 0) {
          const firstActive = goalsData.find((g: Goal) => g.is_active);
          if (firstActive) setDialogGoalId(firstActive.id);
        }
      } catch (err) {
        console.error("Failed to fetch goals:", err);
      } finally {
        setLoadingGoals(false);
      }
    };

    fetchGoals();
  }, [getToken]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) return;

      setLoadingStats(true);

      try {
        const data = await fetchProgressStatsRequest(token, {
          period: "month",
          goalId: selectedGoalId || undefined,
        });

        setCompletionRate(data.completionRate);
        setTotalDays(data.totalDaysTracked);
        setTotalEntries(data.totalEntries);
        setGoalSummaries(
          Object.values(data.goalBreakdown).map((item: GoalBreakdownItem) => ({
            goalId: item.goalId,
            averageValue: item.averageValue,
            completionRate: item.completionRate,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setGoalSummaries([]);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [getToken, selectedGoalId]);

  const handleLogProgress = async () => {
    if (!dialogGoalId || !logValue) {
      alert("Please select a goal and enter a value");
      return;
    }

    const token = getToken();
    if (!token) return;

    setIsLogging(true);

    try {
      await logProgressRequest(token, dialogGoalId, {
        value: parseFloat(logValue),
        notes: logNotes || undefined,
      });

      // Close dialog
      setLogDialogOpen(false);
      setLogValue("");
      setLogNotes("");

      // Refresh stats
      const data = await fetchProgressStatsRequest(token, {
        period: "month",
        goalId: selectedGoalId || undefined,
      });
      setCompletionRate(data.completionRate);
      setTotalDays(data.totalDaysTracked);
      setTotalEntries(data.totalEntries);
      setGoalSummaries(Object.values(data.goalBreakdown));

      alert("Progress logged successfully!");
    } catch (err) {
      console.error("Failed to log progress:", err);
      alert("Failed to log progress. Please try again.");
    } finally {
      setIsLogging(false);
    }
  };

  const getGoalTitle = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
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
        {/* Header */}
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
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
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
                      {loadingStats ? "..." : totalDays}
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

          {/* Goal Progress Summary */}
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
                          <p className="font-medium">{getGoalTitle(entry.goalId)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Average logged value:{" "}
                          <span className="font-medium">{entry.averageValue}</span>
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground ml-4">
                        {entry.completionRate}% complete
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Progress Dialog */}
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
                  {goals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
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
