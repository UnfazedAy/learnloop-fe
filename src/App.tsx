import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import Register from "@/pages/Register"
import Login from "@/pages/Login"
import ForgotPassword from "@/pages/ForgotPassword"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardPage from "@/pages/Dashboard"
import ProfilePage from "./pages/Profile"
import EmailVerificationCallback from "@/pages/EmailVerificationCallback"
import "./style.css"

export default function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  )
}
