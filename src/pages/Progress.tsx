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
  DialogFooter,
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

type WeekRow = {
  day: string; // short day name e.g. Mon
  date: string; // iso date string (yyyy-mm-dd)
  value: number;
  completed: boolean;
};

function shortDayFromDate(dateStr: string) {
  const d = new Date(dateStr);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10); // yyyy-mm-dd
}

function buildEmptyWeek(): WeekRow[] {
  const result: WeekRow[] = [];
  const today = new Date();
  // build last 7 days (oldest -> newest)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const iso = isoDate(date);
    result.push({
      day: shortDayFromDate(iso),
      date: iso,
      value: 0,
      completed: false,
    });
  }
  return result;
}

/**
 * Progress Page (Clean & Minimal)
 */
export default function ProgressPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { goals, loading: goalsLoading } = useGoals();
  const { logProgress, getWeeklyStats, getCompletionRate, loading: logLoading } =
    useProgress();

  // page-level loading while we confirm auth
  const [pageLoading, setPageLoading] = useState(true);

  // selectedGoalId === null => All goals aggregated
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // weekly data for chart / heatmap
  const [weeklyRows, setWeeklyRows] = useState<WeekRow[]>(buildEmptyWeek());
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  // monthly completion rate (either aggregated or for selected goal)
  const [completionRate, setCompletionRate] = useState<number | null>(null);
  const [loadingCompletion, setLoadingCompletion] = useState(false);

  // dialog + form state
  const [openDialog, setOpenDialog] = useState(false);
  const [progressValue, setProgressValue] = useState<string>("");
  const [progressNotes, setProgressNotes] = useState<string>("");
  const [dialogGoalId, setDialogGoalId] = useState<string | "">("");

  // Redirect if not authed
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // authenticated
    setPageLoading(false);
  }, [user, navigate]);

  // When goals change, ensure dialog select options update and keep selectedGoalId unchanged.
  useEffect(() => {
    // default dialog goal to first active goal only for convenience (not auto-selecting page)
    if (!dialogGoalId && goals.length > 0) {
      const firstActive = goals.find((g) => g.is_active === true);
      setDialogGoalId(firstActive?.id ?? "");
    }
  }, [goals, dialogGoalId]);

  // Fetch weekly stats when selectedGoalId or goals change
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingWeekly(true);
      try {
        // request aggregated stats when selectedGoalId === null -> pass undefined to hook
        const rows = await getWeeklyStats(selectedGoalId ?? undefined);
        if (!mounted) return;

        // backend returns dailyProgress array with { date, totalValue, entriesCount, goalsCompleted }
        // normalize into WeekRow[] and fill missing days (last 7 days)
        const emptyWeek = buildEmptyWeek();
        const mapByDate: Record<string, any> = {};
        (rows || []).forEach((r: any) => {
          // accept either date or day fields, but your backend provides date strings
          const d = r.date ? r.date.slice(0, 10) : null;
          if (d) mapByDate[d] = r;
        });

        const normalized = emptyWeek.map((cell) => {
          const backendRow = mapByDate[cell.date];
          if (!backendRow) return cell;
          const value = backendRow.totalValue ?? 0;
          const completed = (backendRow.goalsCompleted ?? 0) > 0;
          return {
            ...cell,
            value,
            completed,
          };
        });

        setWeeklyRows(normalized);
      } catch (err) {
        console.error("Failed to load weekly stats", err);
        toast.error("Failed to load weekly stats");
        setWeeklyRows(buildEmptyWeek());
      } finally {
        if (mounted) setLoadingWeekly(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedGoalId, goals, getWeeklyStats]);

  // Fetch completion rate (month). If selectedGoalId === null, average across goals
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCompletion(true);
      try {
        if (selectedGoalId) {
          const r = await getCompletionRate(selectedGoalId);
          if (!mounted) return;
          setCompletionRate(Math.round(r));
        } else {
          // No goal selected: average across goals
          if (!goals || goals.length === 0) {
            setCompletionRate(0);
          } else {
            const rates = await Promise.all(goals.map((g) => getCompletionRate(g.id)));
            if (!mounted) return;
            const sum = rates.reduce((s, v) => s + (v || 0), 0);
            setCompletionRate(Math.round(sum / Math.max(1, goals.length)));
          }
        }
      } catch (err) {
        console.error("Failed to load completion rate", err);
        toast.error("Failed to load monthly stats");
        setCompletionRate(0);
      } finally {
        if (mounted) setLoadingCompletion(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedGoalId, goals, getCompletionRate]);

  if (pageLoading || goalsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.is_active === true);
  const currentGoal = goals.find((g) => g.id === selectedGoalId) ?? null;

  // handle logging progress
  const handleAddProgress = async () => {
    // ensure a goal is selected inside the dialog (progress requires a goal)
    const goalToUse = dialogGoalId || selectedGoalId;
    if (!goalToUse) {
      toast.error("Select a goal to log progress");
      return;
    }

    if (!progressValue || isNaN(Number(progressValue)) || Number(progressValue) <= 0) {
      toast.error("Enter a valid number for value");
      return;
    }

    try {
      const res = await logProgress(goalToUse, Number(progressValue), progressNotes);
      toast.success(res?.message || "Progress logged successfully");
      // clear form
      setProgressValue("");
      setProgressNotes("");
      setOpenDialog(false);

      // refresh weekly + completion rate for the currently selected view
      const rows = await getWeeklyStats(selectedGoalId ?? undefined);
      // re-normalize same as effect
      const emptyWeek = buildEmptyWeek();
      const mapByDate: Record<string, any> = {};
      (rows || []).forEach((r: any) => {
        const d = r.date ? r.date.slice(0, 10) : null;
        if (d) mapByDate[d] = r;
      });
      const normalized = emptyWeek.map((cell) => {
        const backendRow = mapByDate[cell.date];
        if (!backendRow) return cell;
        const value = backendRow.totalValue ?? 0;
        const completed = (backendRow.goalsCompleted ?? 0) > 0;
        return { ...cell, value, completed };
      });
      setWeeklyRows(normalized);

      // refresh completion rate
      if (selectedGoalId) {
        const r = await getCompletionRate(selectedGoalId);
        setCompletionRate(Math.round(r));
      } else {
        // average across goals
        if (goals.length > 0) {
          const rates = await Promise.all(goals.map((g) => getCompletionRate(g.id)));
          const sum = rates.reduce((s, v) => s + (v || 0), 0);
          setCompletionRate(Math.round(sum / Math.max(1, goals.length)));
        }
      }
    } catch (err: any) {
      console.error("logProgress error", err);
      toast.error(err?.response?.data?.message || "Failed to log progress");
    }
  };

  return (
    <>
      <Navbar
        user={user}
        onLogout={() => {
          logout();
          toast.success("Logged out");
          navigate("/");
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Progress</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Track your learning sessions and visualize weekly progress.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* goal selector */}
                <div className="flex items-center gap-2">
                  <label className="sr-only">Goal</label>
                  <select
                    value={selectedGoalId ?? ""}
                    onChange={(e) => setSelectedGoalId(e.target.value || null)}
                    className="border border-border rounded-md px-3 py-2 bg-white text-sm"
                    aria-label="Select goal"
                  >
                    <option value="">All goals</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
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
                      <p className="text-sm text-muted-foreground mt-1">
                        Log time or completion for a goal.
                      </p>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Goal</label>
                        <Select value={dialogGoalId} onValueChange={(v) => setDialogGoalId(v)}>
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
                        <label className="text-sm font-medium mb-1 block">Value</label>
                        <Input
                          type="number"
                          placeholder="e.g., 2 (hours or count depending on goal)"
                          value={progressValue}
                          onChange={(e) => setProgressValue(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
                        <Input
                          placeholder="How did it go?"
                          value={progressNotes}
                          onChange={(e) => setProgressNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <div className="w-full">
                        <Button
                          onClick={handleAddProgress}
                          className="w-full"
                          disabled={logLoading}
                        >
                          {logLoading ? <Spinner /> : "Save progress"}
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
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
                    <p className="text-sm text-muted-foreground mb-2">Completion Rate</p>
                    <p className="text-3xl font-semibold">
                      {loadingCompletion ? <Spinner /> : `${completionRate ?? 0}%`}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Active Goals</p>
                    <p className="text-3xl font-semibold">
                      {activeGoals.length}
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
                  This Week {currentGoal ? `- ${currentGoal.title}` : ""}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {/* heatmap row */}
                <div className="grid grid-cols-7 gap-2 items-end">
                  {weeklyRows.map((d) => (
                    <div key={d.date} className="flex flex-col items-center">
                      <div
                        className={`w-full rounded-md transition-all duration-150 flex items-end justify-center`}
                        style={{
                          height: `${Math.min(100, Math.max(12, (d.value / (Math.max(...weeklyRows.map(r => r.value)) || 1)) * 100))}px`,
                          backgroundColor: d.completed ? "var(--primary)" : "var(--muted)",
                          opacity: d.value > 0 ? 1 : 0.28,
                        }}
                        title={`${d.day} — ${d.value}`}
                      />
                      <div className="mt-2 text-xs text-muted-foreground">{d.day}</div>
                    </div>
                  ))}
                </div>

                {loadingWeekly && (
                  <div className="mt-4 flex justify-center">
                    <Spinner />
                  </div>
                )}

                {!loadingWeekly && weeklyRows.every((r) => r.value === 0) && (
                  <p className="text-sm text-muted-foreground mt-4">
                    No progress recorded this week. Log your first session to get started.
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
