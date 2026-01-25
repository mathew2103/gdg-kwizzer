"use client";

import { LeaderboardEntry } from "../../types/firebase";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string;
  maxEntries?: number;
  showLiveIndicator?: boolean;
  showPodium?: boolean;
}

// Crown SVG component
function Crown() {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="crown-svg"
    >
      <path
        d="M32 4L40 20L56 14L48 40H16L8 14L24 20L32 4Z"
        fill="url(#crown-gradient)"
      />
      <ellipse cx="32" cy="8" rx="4" ry="4" fill="#FBBF24" />
      <ellipse cx="14" cy="16" rx="3" ry="3" fill="#FBBF24" />
      <ellipse cx="50" cy="16" rx="3" ry="3" fill="#FBBF24" />
      <defs>
        <linearGradient
          id="crown-gradient"
          x1="8"
          y1="4"
          x2="56"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FCD34D" />
          <stop offset="0.5" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Leaderboard({
  entries,
  currentPlayerId,
  maxEntries = 10,
  showLiveIndicator = true,
  showPodium = false,
}: LeaderboardProps) {
  const displayEntries = entries.slice(0, maxEntries);

  // For podium view, we need at least 3 entries
  const hasPodium = showPodium && entries.length >= 3;
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  // Podium Layout - matching reference image
  if (hasPodium) {
    return (
      <div className="leaderboard-podium-page">
        {/* Title */}
        <h1 className="leaderboard-podium-title">Leaderboard</h1>

        {/* Podium Section */}
        <div className="podium-container">
          {/* Crown above 1st place */}
          <div className="podium-crown-wrapper">
            <Crown />
          </div>

          {/* Podium Cards */}
          <div className="podium-cards">
            {/* 2nd Place - Left */}
            <div className="podium-card podium-second">
              <span className="podium-rank">2</span>
              <span className="podium-name">{second?.playerName || "-"}</span>
              <span className="podium-score">{second?.score || 0} pt</span>
            </div>

            {/* 1st Place - Center, Tall */}
            <div className="podium-card podium-first">
              <span className="podium-rank">1</span>
              <span className="podium-name">{first?.playerName || "-"}</span>
              <span className="podium-score">{first?.score || 0} pt</span>
            </div>

            {/* 3rd Place - Right */}
            <div className="podium-card podium-third">
              <span className="podium-rank">3</span>
              <span className="podium-name">{third?.playerName || "-"}</span>
              <span className="podium-score">{third?.score || 0} pt</span>
            </div>
          </div>
        </div>

        {/* List Card */}
        <div className="leaderboard-list-card">
          {entries.map((entry) => (
            <div
              key={entry.playerId}
              className={`leaderboard-list-entry ${
                entry.playerId === currentPlayerId ? "is-current" : ""
              }`}
            >
              <div className="entry-left">
                <div className="entry-avatar"></div>
                <span className="entry-name">
                  {entry.playerId === currentPlayerId
                    ? "You"
                    : entry.playerName}
                </span>
              </div>
              <span className="entry-score">{entry.score} pt</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default embedded leaderboard card
  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">Leaderboard</h2>
        {showLiveIndicator && (
          <div className="leaderboard-live-indicator">
            <span className="live-dot"></span>
            Live
          </div>
        )}
      </div>

      <div className="leaderboard-entries">
        {displayEntries.length === 0 ? (
          <div className="leaderboard-empty">No scores yet</div>
        ) : (
          displayEntries.map((entry, index) => (
            <div
              key={entry.playerId}
              className={`leaderboard-entry ${
                entry.playerId === currentPlayerId ? "current-player" : ""
              }`}
            >
              <div className="leaderboard-player-info">
                <div
                  className={`leaderboard-rank ${
                    index === 0
                      ? "rank-gold"
                      : index === 1
                        ? "rank-silver"
                        : index === 2
                          ? "rank-bronze"
                          : "rank-default"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="leaderboard-avatar"></div>
                <span
                  className={`leaderboard-player-name ${
                    entry.playerId === currentPlayerId ? "current" : ""
                  }`}
                >
                  {entry.playerName}
                </span>
                {entry.playerId === currentPlayerId && (
                  <span className="leaderboard-you-badge">YOU</span>
                )}
              </div>
              <div className="leaderboard-score">{entry.score} pt</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
