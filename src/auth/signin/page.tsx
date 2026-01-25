"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Back Button */}
      <Link to="/" className="auth-back-btn">
        ←
      </Link>

      {/* Purple Header Section */}
      <div className="auth-header">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Manage quizzes. Control the game.</p>
      </div>

      {/* White Card Container */}
      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Username/Email Input */}
          <div className="auth-input-group">
            <label className="auth-label">Username</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter username"
              className="auth-input"
              required
            />
          </div>

          {/* Password Input */}
          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-input"
              required
            />
            <a href="#" className="auth-forgot-password">
              Forgot password?
            </a>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-signin">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <div className="divider-line"></div>
          <span className="divider-text">OR</span>
          <div className="divider-line"></div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn-google"
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Sign Up Link */}
        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/auth/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>

      {/* Bottom Logo Placeholder */}
      <div className="auth-bottom-logo">
        <img
          src="/gdgLogo.png"
          alt="Logo"
          className="auth-logo-placeholder"
          style={{ width: "160px", height: "auto" }}
        />
      </div>
    </div>
  );
}
