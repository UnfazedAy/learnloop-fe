import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/Navbar"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Enter your email to receive a password reset link</CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-emerald-500" />
                </div>

                <p className="font-semibold text-foreground mb-2">Check your email</p>
                <p className="text-sm text-muted-foreground mb-6">
                  We sent a password reset link to {email}
                </p>

                <Link to="/login">
                  <Button className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Send Reset Link
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
