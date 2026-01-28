"use client";

import {LeaderboardEntry} from "../../types/firebase";

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentPlayerId?: string;
    maxEntries?: number;
    showLiveIndicator?: boolean;
}

export function Leaderboard({
                                entries,
                                currentPlayerId,
                                maxEntries = 5,
                                showLiveIndicator = true,
                            }: LeaderboardProps) {
    const displayEntries = entries.slice(0, maxEntries);

    const getMedalRank = (index: number) => {
        switch (index) {
            case 0:
                return "rank-gold"; // Gold
            case 1:
                return "rank-silver"; // Silver
            case 2:
                return "rank-bronze"; // Bronze
            default:
                return "rank-default";
        }
    };

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
                                <div className={`leaderboard-rank ${getMedalRank(index)}`}>
                                    {index + 1}
                                </div>
                                <div>
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
                            </div>
                            <div className="leaderboard-score">{entry.score}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function Podium({entries}: { entries: LeaderboardEntry[] }) {
    const winners = entries.slice(0, 3);

    // Custom order to put 1st place in the middle: [Silver, Gold, Bronze]
    const podiumOrder = [winners[1], winners[0], winners[2]];

    return (
        <div className="podium-container">
            {podiumOrder.map((player, idx) => {
                if (!player) return <div key={idx} className="podium-empty"/>;

                // Match the rank back to the original winner index
                const actualRank = winners.indexOf(player) + 1;

                return (
                    <div key={player.playerId} className={`rank-${actualRank}-pos`}>
                        <div key={player.playerId} className={`podium-step rank-${actualRank}`}>
                            {actualRank === 1 && <span className="crown">👑</span>}
                            <div className="podium-name">{player.playerName}</div>
                            <div className="podium-bar">
                                <span className="rank-number">{actualRank}</span>
                            </div>
                            <div className="podium-score">{player.score} pts</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}