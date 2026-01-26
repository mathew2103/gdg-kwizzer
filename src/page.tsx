"use client";

import { useAuth } from "./contexts/AuthContext";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="home-loading-container">
        <div className="home-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="home-page">
      {/* Purple Header Section */}
      <div className="home-header">
        <h1 className="home-title">KWIZZER</h1>
        <p className="home-subtitle">Play. Learn. Compete.</p>
      </div>

      {/* White Card Container */}
      <div className="home-container">
        <div className="home-buttons-grid">
          <Link to="/admin/quizzes">
            <button className="home-button home-button-outline">
              Manage Quizzes
            </button>
          </Link>
          <Link to="/admin/quizzes/create">
            <button className="home-button home-button-outline">
              Create Quiz
            </button>
          </Link>
        </div>

        {/* Divider */}
        <div className="home-divider">
          <div className="home-divider-line"></div>
          <span className="home-divider-text">OR</span>
          <div className="home-divider-line"></div>
        </div>

        <Link to="/play/join">
          <button className="home-button home-button-filled">Join Game</button>
        </Link>

        <button onClick={signOut} className="home-button home-signout-button">
          Sign Out
        </button>

        <p className="home-user-info">
          Logged in as {user.displayName || user.email?.split("@")[0]}
        </p>
      </div>

      {/* Bottom Logo */}
      <div className="home-bottom-logo">
        <img
          src="/gdgLogo.png"
          alt="GDG Logo"
          className="home-logo-placeholder"
        />
      </div>
    </div>
  );
}
