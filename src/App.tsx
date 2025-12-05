import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import Register from "@/pages/Register"
import Login from "@/pages/Login"
import ForgotPassword from "@/pages/ForgotPassword"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardPage from "@/pages/Dashboard"
import ProfilePage from "./pages/Profile"
import ProgressPage from "./pages/Progress"
import EmailVerificationCallback from "@/pages/EmailVerificationCallback"
import GoalsPage from "./pages/Goal"
import { Toaster } from "sonner";
import "./style.css"

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<EmailVerificationCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
      </Routes>

    </BrowserRouter>
  )
}
