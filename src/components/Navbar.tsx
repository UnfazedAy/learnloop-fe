import { useState } from "react"
import { Menu, LogOut, Settings } from "lucide-react"
import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  user?: { first_name: string; email: string } | null
  onLogout?: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-foreground hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-linear-to-br from-primary to-accent rounded-lg"></div>
            LearnLoop
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <NavLink to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Dashboard
                </NavLink>
                <NavLink to="/goals" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Goals
                </NavLink>
                <NavLink to="/progress" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Progress
                </NavLink>

                <div className="flex items-center gap-3 pl-6 border-l border-border">
                  <span className="text-sm text-muted-foreground">{user.first_name}</span>

                  <NavLink to="/profile">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </NavLink>

                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login">
                  <Button variant="ghost">Sign In</Button>
                </NavLink>

                <NavLink to="/register">
                  <Button>Get Started</Button>
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {user ? (
              <>
                <NavLink to="/dashboard" className="block text-sm py-2 text-muted-foreground hover:text-foreground">
                  Dashboard
                </NavLink>
                <NavLink to="/goals" className="block text-sm py-2 text-muted-foreground hover:text-foreground">
                  Goals
                </NavLink>
                <NavLink to="/progress" className="block text-sm py-2 text-muted-foreground hover:text-foreground">
                  Progress
                </NavLink>
                <NavLink to="/profile" className="block text-sm py-2 text-muted-foreground hover:text-foreground">
                  Profile
                </NavLink>

                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onLogout?.()
                  }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign In
                  </Button>
                </NavLink>

                <NavLink to="/register" className="block">
                  <Button className="w-full">Get Started</Button>
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
