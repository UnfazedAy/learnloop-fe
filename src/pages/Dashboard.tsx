import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Target, Eye, Plus, TrendingUp, Flame, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
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

interface GoalProgress {
  goalId: string;
  todayProgress: number;
  percentComplete: number;
}

export default function DashboardPage() {
  const { user, logout, getToken } = useAuth();
  const navigate = useNavigate();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  
  const [completionRate, setCompletionRate] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [goalProgressMap, setGoalProgressMap] = useState<Record<string, GoalProgress>>({});

  // Log dialog
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [logValue, setLogValue] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch goals on mount
  useEffect(() => {
    const fetchGoals = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await api.get("/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGoals(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch goals:", err);
      } finally {
        setLoadingGoals(false);
      }
    };

    fetchGoals();
  }, [getToken]);

  // Fetch stats and goal progress
  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const params: any = { period: "week" };
        if (selectedGoalId) params.goalId = selectedGoalId;

        const res = await api.get("/progress/stats", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        const data = res.data.data;
        setCompletionRate(data?.completionRate || 0);
        setTotalDays(data?.totalDaysTracked || 0);

        // Build progress map from goalBreakdown
        const breakdown = data?.goalBreakdown || {};
        const progressMap: Record<string, GoalProgress> = {};
        
        Object.keys(breakdown).forEach((goalId) => {
          const info = breakdown[goalId];
          progressMap[goalId] = {
            goalId,
            todayProgress: info.averageValue || 0,
            percentComplete: info.completionRate || 0,
          };
        });

        setGoalProgressMap(progressMap);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [getToken, selectedGoalId]);

  const handleLogProgress = async () => {
    if (!selectedGoal || !logValue) return;

    const token = getToken();
    if (!token) return;

    setIsLogging(true);

    try {
      await api.post(
        `/progress/${selectedGoal.id}`,
        {
          value: parseFloat(logValue),
          notes: logNotes || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Close dialog
      setLogDialogOpen(false);
      setLogValue("");
      setLogNotes("");
      setSelectedGoal(null);

      // Refresh stats
      const params: any = { period: "week" };
      if (selectedGoalId) params.goalId = selectedGoalId;

      const res = await api.get("/progress/stats", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const data = res.data.data;
      setCompletionRate(data?.completionRate || 0);
      setTotalDays(data?.totalDaysTracked || 0);

      // Update progress map
      const breakdown = data?.goalBreakdown || {};
      const progressMap: Record<string, GoalProgress> = {};
      
      Object.keys(breakdown).forEach((goalId) => {
        const info = breakdown[goalId];
        progressMap[goalId] = {
          goalId,
          todayProgress: info.averageValue || 0,
          percentComplete: info.completionRate || 0,
        };
      });

      setGoalProgressMap(progressMap);

      alert("Progress logged successfully!");
    } catch (err) {
      console.error("Failed to log progress:", err);
      alert("Failed to log progress. Please try again.");
    } finally {
      setIsLogging(false);
    }
  };

  const activeGoals = goals.filter((g) => g.is_active);
  const displayedGoals = selectedGoalId 
    ? activeGoals.filter(g => g.id === selectedGoalId)
    : activeGoals;

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
                <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {user?.first_name || "User"}!
                </p>
              </div>

              <div className="flex items-center gap-3 ">
                <select
                  aria-label="Filter goals"
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
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

          {/* Goals Section */}
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
                    percentComplete: 0 
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

                            {/* Progress Bar */}
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  {progress.todayProgress} / {goal.target_value} {goal.target_unit}
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
                          <span>Target: {goal.target_value} {goal.target_unit}</span>
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

      {/* Log Progress Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Progress</DialogTitle>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Goal</p>
                <p className="text-sm text-muted-foreground">
                  {selectedGoal.title}
                </p>
              </div>

              <div>
                <label htmlFor="value" className="text-sm font-medium block mb-2">
                  Value ({selectedGoal.target_unit})
                </label>
                <Input
                  id="value"
                  type="number"
                  placeholder={`e.g., ${selectedGoal.target_value}`}
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