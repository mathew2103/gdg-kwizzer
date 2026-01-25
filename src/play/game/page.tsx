"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { firestoreService } from "../../lib/firestore";
import { useGame, useLeaderboard } from "../../hooks/useGame";
import { Quiz, Player } from "../../types/firebase";
import { Button, Card, Spinner } from "../../components/ui";
import { Leaderboard } from "../../components/game";
import { Check, X, Clock } from "lucide-react";

export default function GamePage() {
  const { user } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const gameId = params.gameId as string;

  const { game, players, loading: gameLoading } = useGame(gameId);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Move all hooks to the top level - always called unconditionally
  const leaderboard = useLeaderboard(gameId);

  useEffect(() => {
    async function loadQuiz() {
      if (!game) return;

      try {
        const quizData = await firestoreService.getQuiz(String(game.quizId));
        setQuiz(quizData);

        const player = players.find((p) => p.id === user?.uid);
        setCurrentPlayer(player || null);
      } catch (error) {
        console.error("Error loading quiz:", error);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [game?.quizId, user?.uid]);

  // Reset answer state when question changes to a new question
  useEffect(() => {
    if (game?.phase === "questionLive" && quiz) {
      const currentQuestionIndex = game.currentQuestionIndex;
      if (currentQuestionIndex !== undefined) {
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
      }
    }
  }, [game?.currentQuestionIndex]);

  // Calculate time left from server-side timer
  const timeLeft = game?.timeLeft || 0;

  async function submitAnswer() {
    if (selectedAnswer === null || !game || !user || answerSubmitted || !quiz)
      return;

    try {
      await firestoreService.submitAnswer(game.id, game.currentQuestionIndex, {
        playerId: user.uid,
        questionIndex: game.currentQuestionIndex,
        selectedOption: selectedAnswer,
        answeredAt: new Date(),
        isCorrect:
          selectedAnswer ===
          quiz.questions[game.currentQuestionIndex].correctAnswer,
      });
      setAnswerSubmitted(true);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  }

  if (loading || gameLoading) {
    return (
      <div className="game-center-container">
        <Spinner />
      </div>
    );
  }

  if (!game || !quiz) {
    useEffect(() => {
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);

      return () => clearTimeout(timer);
    }, [navigate]);

    return (
      <div className="game-center-container">
        <Card variant="default" padding="lg" className="text-center">
          <h2 className="game-error-title">Game not found</h2>
          <p className="game-error-message">Redirecting you to home...</p>
          <button onClick={() => navigate("/")} className="game-error-button">
            Go to Home Now
          </button>
        </Card>
      </div>
    );
  }

  if (!currentPlayer) {
    useEffect(() => {
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);

      return () => clearTimeout(timer);
    }, [navigate]);

    return (
      <div className="game-center-container">
        <Card variant="default" padding="lg" className="text-center">
          <h2 className="game-error-title">Not in game</h2>
          <p className="game-error-message">
            You're not part of this game. Redirecting to home...
          </p>
          <button onClick={() => navigate("/")} className="game-error-button">
            Go to Home Now
          </button>
        </Card>
      </div>
    );
  }

  // Lobby Phase - New Design
  if (game.phase === "lobby") {
    // Create participant slots (show up to 5 slots)
    const maxSlots = 5;
    const participantSlots = [];
    for (let i = 0; i < maxSlots; i++) {
      participantSlots.push(players[i] || null);
    }

    return (
      <div className="game-lobby-container">
        {/* Purple Header Section */}
        <div className="lobby-header">
          <h1 className="lobby-title">Game Code</h1>
          <div className="lobby-code-display">#{game.joinCode}</div>
        </div>

        {/* White Card with Participants */}
        <div className="lobby-participants-card">
          <h2 className="lobby-participants-title">Participants</h2>

          <div className="lobby-participants-list">
            {participantSlots.map((player, index) => (
              <div
                key={index}
                className={`lobby-participant-slot ${player ? "filled" : ""}`}
              >
                {player ? (
                  <span className="lobby-participant-name">{player.name}</span>
                ) : (
                  <div className="lobby-participant-empty"></div>
                )}
              </div>
            ))}
          </div>

          {/* Show player count if more than 5 */}
          {players.length > maxSlots && (
            <p className="lobby-waiting-message">
              +{players.length - maxSlots} more participants
            </p>
          )}

          <p className="lobby-waiting-message">Waiting for more participants</p>
        </div>

        {/* Note: START button would be shown to host only */}
      </div>
    );
  }

  // Question Phase - New Design
  if (game.phase === "questionLive") {
    if (
      !quiz ||
      !quiz.questions ||
      game.currentQuestionIndex === undefined ||
      game.currentQuestionIndex >= quiz.questions.length
    ) {
      return (
        <div className="game-center-container">
          <Card variant="default" padding="lg" className="text-center">
            <h2 className="game-loading-text">Loading question...</h2>
          </Card>
        </div>
      );
    }

    const question = quiz.questions[game.currentQuestionIndex];

    return (
      <div className="game-question-container">
        {/* Back Button */}
        <button className="game-back-button" onClick={() => navigate("/")}>
          ←
        </button>

        {/* Question Header with Number and Timer */}
        <div className="game-question-header">
          <span className="game-question-number">
            Question {game.currentQuestionIndex + 1}/ {quiz.questions.length}
          </span>
          <div className="game-timer-badge">{timeLeft}s</div>
        </div>

        {/* Question Card */}
        <div className="game-question-card">
          <p className="game-question-text">{question.text}</p>
        </div>

        {/* Options Grid */}
        <div className="game-options-grid">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`game-option-item ${selectedAnswer === index ? "selected" : ""}`}
              onClick={() => !answerSubmitted && setSelectedAnswer(index)}
              disabled={answerSubmitted}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        {selectedAnswer !== null && !answerSubmitted && (
          <div className="game-submit-section">
            <button onClick={submitAnswer} className="game-submit-button">
              Submit Answer
            </button>
          </div>
        )}

        {answerSubmitted && (
          <div className="game-submitted-section">
            <p className="game-submitted-text">Answer submitted!</p>
          </div>
        )}
      </div>
    );
  }

  // Results Phase
  if (game.phase === "results") {
    if (
      !quiz ||
      !quiz.questions ||
      game.currentQuestionIndex === undefined ||
      game.currentQuestionIndex >= quiz.questions.length
    ) {
      return (
        <div className="game-center-container">
          <Card variant="default" padding="lg" className="text-center">
            <h2 className="game-loading-text">Loading results...</h2>
          </Card>
        </div>
      );
    }

    const question = quiz.questions[game.currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;
    const didAnswer = selectedAnswer !== null;

    return (
      <div className="game-results-container">
        <div className="game-results-wrapper">
          {/* Result Feedback Banner */}
          <div
            className={`game-result-banner ${
              !didAnswer
                ? "game-result-no-answer"
                : isCorrect
                  ? "game-result-correct"
                  : "game-result-wrong"
            }`}
          >
            <div className="game-result-icon-wrapper">
              {!didAnswer ? (
                <Clock size={32} />
              ) : isCorrect ? (
                <Check size={32} />
              ) : (
                <X size={32} />
              )}
            </div>

            <div
              className={`game-result-status ${
                !didAnswer
                  ? "game-result-status-no-answer"
                  : isCorrect
                    ? "game-result-status-correct"
                    : "game-result-status-wrong"
              }`}
            >
              {!didAnswer ? "Time's Up!" : isCorrect ? "Correct!" : "Wrong"}
            </div>
            <p
              className={`game-result-message ${
                !didAnswer
                  ? "game-result-message-no-answer"
                  : isCorrect
                    ? "game-result-message-correct"
                    : "game-result-message-wrong"
              }`}
            >
              {!didAnswer
                ? "You didn't answer in time"
                : isCorrect
                  ? "Great job! You got it right!"
                  : "Better luck next time!"}
            </p>
          </div>

          {/* Question Card with Answer */}
          <Card variant="default" padding="lg" className="game-results-card">
            <div className="game-results-question-meta">
              Question {game.currentQuestionIndex + 1} of{" "}
              {quiz.questions.length}
            </div>
            <h2 className="game-results-question-text">{question.text}</h2>

            <div className="game-results-answers">
              {/* Correct Answer Display */}
              <div className="game-answer-box game-correct-answer">
                <div className="game-answer-label game-answer-label-correct">
                  Correct Answer
                </div>
                <div className="game-answer-value game-answer-value-correct">
                  {question.options[question.correctAnswer]}
                </div>
              </div>

              {/* Show user's answer if they answered wrong */}
              {didAnswer && !isCorrect && (
                <div className="game-answer-box game-user-answer">
                  <div className="game-answer-label game-answer-label-wrong">
                    Your Answer
                  </div>
                  <div className="game-answer-value game-answer-value-wrong">
                    {question.options[selectedAnswer]}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Show leaderboard */}
          <Leaderboard entries={leaderboard} currentPlayerId={user?.uid} />

          <div className="game-results-waiting">
            <p className="game-results-waiting-text">
              Waiting for next question...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Game Over Phase
  if (game.phase === "ended") {
    const userEntry = leaderboard.find((entry) => entry.playerId === user?.uid);
    const userRank = userEntry?.rank || 0;
    const userScore = userEntry?.score || 0;

    const getRankDisplay = (rank: number) => {
      if (rank === 0) return "Not ranked";
      if (rank === 1) return "1st";
      if (rank === 2) return "2nd";
      if (rank === 3) return "3rd";
      return `#${rank}`;
    };

    const getResultMessage = (
      rank: number,
      score: number,
      playerName: string,
    ) => {
      if (rank === 0 && score === 0) {
        return `${playerName}, you didn't score any points this round.`;
      }
      if (rank === 0) {
        return `${playerName}, thanks for playing!`;
      }
      if (score === 0) {
        return `${playerName}, you finished ${getRankDisplay(
          rank,
        )} with no points. Better luck next time!`;
      }
      return `${playerName}, you finished ${getRankDisplay(
        rank,
      )} place with ${score} points!`;
    };

    return (
      <div className="game-over-container">
        <div className="game-over-wrapper">
          <h1 className="game-over-title">Game Over!</h1>

          {/* User's Results Card */}
          <Card variant="default" padding="lg" className="game-over-card">
            <h2 className="game-over-results-title">Your Results</h2>
            <div className="game-over-results-flex">
              <div className="game-over-stat">
                <div className="game-over-stat-value">
                  {userRank > 0 ? `#${userRank}` : "—"}
                </div>
                <div className="game-over-stat-label">Your Rank</div>
              </div>
              <div className="game-over-stat">
                <div className="game-over-stat-value">{userScore}</div>
                <div className="game-over-stat-label">Your Points</div>
              </div>
            </div>
            <p className="game-over-message">
              {getResultMessage(
                userRank,
                userScore,
                currentPlayer?.name || "Player",
              )}
            </p>
          </Card>

          {/* Full Leaderboard with Podium */}
          {leaderboard.length > 0 && (
            <div className="game-over-leaderboard-section">
              <Leaderboard
                entries={leaderboard}
                showLiveIndicator={false}
                currentPlayerId={user?.uid}
                showPodium={true}
              />
            </div>
          )}

          {leaderboard.length === 0 && (
            <div className="game-over-no-data">
              <p className="game-over-no-data-text">
                No leaderboard data available
              </p>
            </div>
          )}

          <div className="game-over-action">
            <Button onClick={() => navigate("/")} className="w-full max-w-xs">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-center-container">
      <Card variant="default" padding="lg" className="text-center">
        <h2 className="game-error-title">Unknown game phase</h2>
        <button onClick={() => navigate("/")} className="game-error-button">
          Back to Home
        </button>
      </Card>
    </div>
  );
}
