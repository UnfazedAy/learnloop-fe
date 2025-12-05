// MINIMAL DASHBOARD - NO INFINITE LOOPS
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { GoalCard } from "@/components/GoalCard";
import { QuoteCard } from "@/components/QuoteCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Flame, TrendingUp, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getTodayQuote } from "@/lib/mock-data";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/axios";
import type { Goal } from "@/types/index";

export default function DashboardPage() {
  const { user, logout, getToken } = useAuth();
  const navigate = useNavigate();
  
  // Use refs to prevent infinite loops
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [completionRate, setCompletionRate] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch goals ONCE on mount
  useEffect(() => {
    if (hasInitialized.current || isFetching.current) return;
    
    const fetchGoals = async () => {
      const token = getToken();
      if (!token) return;
      
      isFetching.current = true;
      
      try {
        const res = await api.get("/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formatted = res.data.data.map((g: any) => ({
          id: g.id,
          user_id: g.user_id,
          title: g.title,
          description: g.description,
          goalType: g.goal_type,
          targetValue: g.target_value,
          targetUnit: g.target_unit,
          frequency: g.frequency,
          is_active: g.is_active,
          created_at: g.created_at,
          updated_at: g.updated_at,
        }));

        setGoals(formatted);
      } catch (err) {
        console.error("Failed to load goals:", err);
      } finally {
        setGoalsLoading(false);
        isFetching.current = false;
        hasInitialized.current = true;
      }
    };

    fetchGoals();
  }, []); // Empty deps - run ONCE

  // Fetch stats when goal selection changes
  useEffect(() => {
    if (!hasInitialized.current) return; // Wait for goals to load first
    
    const fetchStats = async () => {
      const token = getToken();
      if (!token) return;
      
      setStatsLoading(true);
      
      try {
        const params: Record<string, string> = { period: "week" };
        if (selectedGoalId) params.goalId = selectedGoalId;

        const res = await api.get("/progress/stats", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        const data = res.data?.data;
        setCompletionRate(data?.completionRate ?? 0);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setCompletionRate(0);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [selectedGoalId]); // Only re-run when selection changes

  const dailyQuote = getTodayQuote();
  const activeGoalsCount = goals.filter((g) => g.is_active === true).length;
  const currentGoal = goals.find((g) => g.id === selectedGoalId) ?? null;

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
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {user?.first_name}!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label htmlFor="goal-select" className="sr-only">Select goal</label>
                  <select
                    name="goal-select"
                    id="goal-select"
                    value={selectedGoalId ?? ""}
                    onChange={(e) => setSelectedGoalId(e.target.value || null)}
                    className="border rounded-md px-3 py-2 bg-white"
                    disabled={goalsLoading}
                  >
                    <option value="">All goals</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
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
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Current Streak"
              value="0 days"
              subtitle="Current consecutive days completed"
              icon={Flame}
              iconBgColor="bg-orange-500/10"
              iconColor="text-orange-500"
            />
            <StatCard
              title="Completion Rate"
              value={statsLoading ? "..." : `${completionRate}%`}
              subtitle={selectedGoalId ? `For "${currentGoal?.title}"` : "Across all goals"}
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

          {/* Goals List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Today's Goals
            </h2>

            {goalsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : activeGoalsCount > 0 ? (
              goals
                .filter((g) => g.is_active === true)
                .map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    streak={0}
                    progress={0}
                  />
                ))
            ) : (
              <Card className="bg-card border-border text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">
                    No active goals. Create your first goal to get started!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}