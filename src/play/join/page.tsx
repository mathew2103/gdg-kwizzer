"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { firestoreService } from "../../lib/firestore";
import { Game } from "../../types/firebase";
import { ArrowLeft } from "lucide-react";

export default function JoinGamePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [game, setGame] = useState<Game | null>(null);

  async function handleFindGame(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const foundGame = await firestoreService.getGameByJoinCode(
        joinCode.toUpperCase(),
      );
      if (!foundGame) {
        setError("Game not found. Check the code.");
        return;
      }

      if (foundGame.phase === "ended") {
        setError("This game has already ended.");
        return;
      }

      setGame(foundGame);
    } catch (err: any) {
      setError(err.message || "Failed to find game");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGame(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!game || !user) return;

      const playerData = {
        id: user.uid,
        name:
          playerName.trim() ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "Player",
        score: 0,
        joinedAt: new Date(),
      };

      await firestoreService.addPlayerToGame(game.id, playerData);
      navigate(`/play/game/${game.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to join game");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="join-page">
        {/* Back Button */}
        <Link to="/" className="join-back-btn" title="Back to Home">
          <ArrowLeft size={24} />
        </Link>

        <div className="join-header">
          <h1 className="join-title">Join Game</h1>
          <p className="join-subtitle">Sign in to play</p>
        </div>

        <div className="join-card">
          <p className="join-message">Please sign in first to join a game</p>
          <Link to="/auth/signin" className="join-signin-link">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="join-page">
      {/* Back Button */}
      <Link to="/" className="join-back-btn" title="Back to Home">
        <ArrowLeft size={24} />
      </Link>

      {/* Header */}
      <div className="join-header">
        <h1 className="join-title">Join Game</h1>
        <p className="join-subtitle">Enter the game code to play</p>
      </div>

      {/* White Card */}
      <div className="join-card">
        {!game ? (
          <form onSubmit={handleFindGame} className="join-form">
            {/* Game Code Label */}
            <div className="join-input-group">
              <label className="join-label">Game Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                  )
                }
                placeholder="XXXXXX"
                maxLength={6}
                className="join-code-input"
                required
              />
            </div>

            {error && <p className="join-error">{error}</p>}

            <button
              type="submit"
              disabled={loading || joinCode.length < 4}
              className="join-find-btn"
            >
              {loading ? "Finding..." : "Find Game"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinGame} className="join-form">
            {/* Game Found */}
            <div className="join-found-section">
              <p className="join-found-text">Game Found!</p>
              <p className="join-found-code">#{game.joinCode}</p>
            </div>

            {/* Nickname Input */}
            <div className="join-input-group">
              <label className="join-label">Your Nickname</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={15}
                className="join-name-input"
                required
              />
            </div>

            {error && <p className="join-error">{error}</p>}

            <div className="join-button-group">
              <button
                type="button"
                onClick={() => {
                  setGame(null);
                  setJoinCode("");
                  setError("");
                }}
                className="join-back-button"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !playerName.trim()}
                className="join-submit-btn"
              >
                {loading ? "Joining..." : "Join Game"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bottom Logo */}
      <div className="join-bottom-logo">
        <img src="/gdgLogo.png" alt="GDG Logo" className="join-logo-img" />
      </div>
    </div>
  );
}
