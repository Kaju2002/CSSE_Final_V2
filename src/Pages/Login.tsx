import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../Shared_Ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://csse-api-final.onrender.com";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

  // Store in auth context
  login(data.data.user, data.data.token);

  // Redirect based on user role
  const role = (data.data.user.role || '').toLowerCase();
      
      switch (role) {
        case "admin":
          navigate("/admin/hospital-stats");
          break;
        case "doctor":
          navigate("/doctor/dashboard");
          break;
        case "patient":
          navigate("/");
          break;
        case "staff":
          navigate("/staff/check-in");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, redirect away from the login page
  useEffect(() => {
    if (!isAuthenticated) return;

    const role = (user?.role || '').toLowerCase();
    switch (role) {
      case "admin":
        navigate("/admin/hospital-stats");
        break;
      case "doctor":
        navigate("/doctor/dashboard");
        break;
      case "patient":
        navigate("/");
        break;
      case "staff":
        navigate("/staff/check-in");
        break;
      default:
        navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setError("Please enter your email address");
      return;
    }

    setError(null);
    setForgotPasswordMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send password reset email");
      }

      setForgotPasswordMessage("Password reset link sent! Please check your email.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
        setForgotPasswordMessage(null);
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send reset email. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Prevent rendering the login form while redirecting
  if (isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-6">
        <div className="text-center">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="hidden lg:block">
          <div className="overflow-hidden border border-[#e1eaf5] bg-white shadow-md">
            <img
              src="/login.webp"
              alt="hospital reception"
              className="w-full h-[550px] object-cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white border border-[#e1eaf5] rounded-3xl shadow-sm p-10">
            {!showForgotPassword ? (
              <>
                <h2 className="text-2xl font-semibold text-[#1b2b4b] mb-2 text-center md:text-left">
                  Welcome Back
                </h2>
                <p className="text-sm text-[#6f7d95] mb-8 text-center md:text-left">
                  Log in to your account to access your dashboard.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    type="email"
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                  />

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-11 font-semibold"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium text-[#2a6bb7] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-sm text-[#6f7d95]">Don't have an account? </span>
                  <a href="/register" className="text-sm font-medium text-[#2a6bb7] hover:underline">
                    Register here
                  </a>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-[#1b2b4b] mb-2 text-center md:text-left">
                  Forgot Password?
                </h2>
                <p className="text-sm text-[#6f7d95] mb-8 text-center md:text-left">
                  Enter your email and we'll send you a password reset link.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    name="forgotEmail"
                    type="email"
                  />

                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {forgotPasswordMessage && (
                    <p className="text-sm text-green-600">{forgotPasswordMessage}</p>
                  )}

                  <div className="pt-2 space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full h-11 font-semibold"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setError(null);
                        setForgotPasswordEmail("");
                        setForgotPasswordMessage(null);
                      }}
                      className="w-full h-11 font-semibold border border-[#2a6bb7] text-[#2a6bb7] rounded hover:bg-[#2a6bb7]/5 transition"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
