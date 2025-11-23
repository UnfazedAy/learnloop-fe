import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Target, Flame, TrendingUp } from "lucide-react";

// TEMP: Replace this with your real auth logic later
const useAuth = () => {
  return {
    user: null,
    logout: () => {},
  };
};

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <>
      <Navbar user={user || undefined} onLogout={logout} />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6 border border-primary/20">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">
              Learn Consistently, Grow Exponentially
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Build Consistent Learning Habits
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            LearnLoop is the learning accountability platform that helps you
            transform sporadic learning into sustainable habits through goal
            setting, progress tracking, and motivational support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div
              className="p-6 rounded-lg bg-card border border-border 
  transition-colors hover:border-primary hover:bg-primary/5"
            >
              <Target className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-2">
                Smart Goal Setting
              </h3>
              <p className="text-sm text-muted-foreground">
                Create flexible learning goals with time-based, completion, or
                custom metrics
              </p>
            </div>

            <div
              className="p-6 rounded-lg bg-card border border-border 
  transition-colors hover:border-primary hover:bg-primary/5"
            >
              <TrendingUp className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-2">
                Track Progress
              </h3>
              <p className="text-sm text-muted-foreground">
                Visualize your learning journey with detailed charts and weekly
                summaries
              </p>
            </div>

            <div
              className="p-6 rounded-lg bg-card border border-border 
  transition-colors hover:border-primary hover:bg-primary/5"
            >
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-2">
                Build Streaks
              </h3>
              <p className="text-sm text-muted-foreground">
                Maintain momentum with streak tracking and motivational
                notifications
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
            <p>© 2025 LearnLoop. Build consistent learning habits.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
