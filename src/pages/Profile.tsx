import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Lock, LogOut } from "lucide-react"
import { api } from "@/lib/axios"
import { Avatar } from "@/components/Avatar"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function ProfilePage() {
  const { user, getToken, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    image: "",
  })

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        const token = getToken()
        if (!token) return navigate("/login")

        const res = await api.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.data.success) {
          setProfile(res.data.data)
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, getToken, navigate])

  if (loading) return null

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      const token = getToken()
      if (!token) return navigate("/login")
      const res = await api.put(
        "/user/update-profile",
        {
          firstName: profile.first_name,
          lastName: profile.last_name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (res.data.success) {
        await refreshUser()
        toast.success("Profile updated successfully!")
      }
    } catch (err) {
      toast.error("Failed to update profile.")
      console.error("Profile update error:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Navbar user={profile} onLogout={handleLogout} />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="min-h-screen bg-background">

        {/* HERO SECTION */}
        <div className="py-14 text-center bg-gradient-to-b from-background to-muted/40 border-b">
          <div className="flex justify-center">
            <div className="p-3 bg-white/60 rounded-full shadow-sm backdrop-blur-sm border">
              <Avatar image={profile.image} gender={profile.gender} size={90} />
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-semibold text-foreground">
            {profile.first_name} {profile.last_name}
          </h1>

          <p className="text-muted-foreground capitalize mt-1">
            {profile.gender || "Not specified"}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage your profile and account preferences
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

          {/* PROFILE CARD */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div>
                <label className="text-sm font-medium block mb-1">First Name</label>
                <Input
                  value={profile.first_name}
                  onChange={(e) =>
                    setProfile({ ...profile, first_name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Last Name</label>
                <Input
                  value={profile.last_name}
                  onChange={(e) =>
                    setProfile({ ...profile, last_name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Email</label>
                <Input disabled value={profile.email} />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Gender</label>
                <Input disabled value={profile.gender} className="capitalize" />
              </div>

              <Button className="w-full" onClick={handleSaveChanges} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* NOTIFICATIONS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notification preferences coming soon.
              </p>
            </CardContent>
          </Card>

          {/* SECURITY */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>

          {/* LOGOUT */}
          <Card className="border-destructive/20">
            <CardContent className="pt-6">
              <Button
                onClick={handleLogout}
                className="gap-2 w-full bg-transparent"
                variant="outline"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
