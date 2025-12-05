import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Navbar } from "@/components/Navbar";

export default function EmailVerificationCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const { completeRegistration } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processEmailVerification = async () => {
      try {
        // Parse the hash fragment (Supabase sends token in hash, not query params)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        if (!accessToken) {
          setStatus("error");
          setMessage("No access token found in the verification link.");
          return;
        }

        // Only process signup verification
        if (type !== "signup") {
          setStatus("error");
          setMessage("Invalid verification type.");
          return;
        }

        // Complete the registration with the access token
        await completeRegistration(accessToken);

        setStatus("success");
        setMessage("Email verified successfully! Redirecting to dashboard...");

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to verify email. Please try again or contact support."
        );
      }
    };

    processEmailVerification();
  }, [completeRegistration, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === "loading" && <Spinner className="w-16 h-16" />}
              {status === "success" && (
                <CheckCircle className="w-16 h-16 text-green-500" />
              )}
              {status === "error" && (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === "loading" && "Verifying Email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "error" && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Please try registering again or contact support if the problem
                  persists.
                </p>
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary hover:underline font-medium"
                >
                  Back to Registration
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
