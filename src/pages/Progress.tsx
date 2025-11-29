import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calendar, TrendingUp } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useProgress } from "@/hooks/useProgress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function ProgressPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { logProgress, getWeeklyStats, getCompletionRate, loading } =
    useProgress();

  const [pageLoading, setPageLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [progressEntry, setProgressEntry] = useState({
    value: "",
    notes: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setPageLoading(false);
      if (goals.length > 0) {
        setSelectedGoal(goals[0].id);
      }
    }
  }, [user, goals, navigate]);

  // Fetch stats when selected goal changes
  useEffect(() => {
    if (!selectedGoal) return;

    (async () => {
      const stats = await getWeeklyStats(selectedGoal);
      setWeeklyStats(stats);

      const rate = await getCompletionRate(selectedGoal);
      setCompletionRate(rate);
    })();
  }, [selectedGoal, getWeeklyStats, getCompletionRate]);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const handleAddProgress = async () => {
    if (!progressEntry.value) {
      return toast("Value required", { description: "Enter a number", });

    }

    try {
      const res = await logProgress(
        selectedGoal!,
        Number(progressEntry.value),
        progressEntry.notes
      );

      toast("Success", { description: res.message || "Progress logged successfully!" });

      setProgressEntry({ value: "", notes: "" });
      setOpenDialog(false);

      // refresh data
      const stats = await getWeeklyStats(selectedGoal!);
      setWeeklyStats(stats);

      const rate = await getCompletionRate(selectedGoal!);
      setCompletionRate(rate);
    } catch (err: any) {
      toast("Error", { description: err.response?.data?.message || "Failed to log progress" });
    }
  };

  const currentGoal = goals.find((g) => g.id === selectedGoal);

  return (
    <>
      <Navbar
        user={user}
        onLogout={() => {
          logout();
          navigate("/");
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Progress Tracking
                </h1>
                <p className="text-muted-foreground mt-1">
                  Visualize your learning journey
                </p>
              </div>

              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Log Progress
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Progress</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Goal
                      </label>
                      <Select
                        value={selectedGoal || ""}
                        onValueChange={setSelectedGoal}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      <label className="text-sm font-medium mb-2 block">
                        Value
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 2 hours"
                        value={progressEntry.value}
                        onChange={(e) =>
                          setProgressEntry({
                            ...progressEntry,
                            value: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Notes (optional)
                      </label>
                      <Input
                        placeholder="How did it go?"
                        value={progressEntry.notes}
                        onChange={(e) =>
                          setProgressEntry({
                            ...progressEntry,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button onClick={handleAddProgress} className="w-full">
                      {loading ? <Spinner /> : "Log Progress"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Stats
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Completion Rate
                    </p>
                    <p className="text-3xl font-bold">{completionRate}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Active Goals
                    </p>
                    <p className="text-3xl font-bold">
                      {goals.filter((g) => g.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Stats */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  This Week {currentGoal && `- ${currentGoal.title}`}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {weeklyStats.length > 0 ? (
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyStats.map((day, idx) => (
                      <div key={idx} className="text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {day.day}
                        </p>
                        <div
                          className={`p-2 rounded text-center text-xs font-medium ${
                            day.completed
                              ? "bg-primary/20 text-primary"
                              : "bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {day.value > 0 ? day.value : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
