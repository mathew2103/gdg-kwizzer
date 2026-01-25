"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { firestoreService } from "../../lib/firestore";
import { Spinner } from "../../components/ui";
import { ArrowLeft } from "lucide-react";
import type { Quiz } from "../../types/firebase";

export default function QuizzesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const userQuizzes = await firestoreService.getQuizzesByCreator(
          user!.uid,
        );
        setQuizzes(userQuizzes);
      } catch (error) {
        console.error("Error loading quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [navigate, user]);

  const handleDelete = async (quizId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await firestoreService.deleteQuiz(quizId);
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <div className="quizzes-loading-container">
        <Spinner size="lg" />
        <p className="quizzes-loading-text">Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="quizzes-page">
      {/* Back Button */}
      <Link to="/" className="quizzes-back-btn" title="Go back">
        <ArrowLeft size={24} />
      </Link>

      {/* Purple Header Section */}
      <div className="quizzes-header-section">
        <h1 className="quizzes-title">Your Quizzes</h1>
        <p className="quizzes-subtitle">
          Manage and host your interactive sessions
        </p>
      </div>

      {/* White Card Container */}
      <div className="quizzes-container">
        {quizzes.length === 0 ? (
          <div className="quizzes-empty">
            <h2 className="quizzes-empty-title">No quizzes yet</h2>
            <p className="quizzes-empty-text">
              Create your first quiz to get started!
            </p>
          </div>
        ) : (
          quizzes.map((quiz, index) => (
            <div key={quiz.id} className="quiz-card">
              <h3 className="quiz-card-title">Quiz {index + 1}</h3>
              <p className="quiz-card-name">{quiz.title}</p>
              <div className="quiz-card-meta">
                <span>{quiz.questions.length} questions</span>
                <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="quiz-card-actions">
                <Link
                  to={`/admin/quizzes/${quiz.id}`}
                  style={{ flex: 1, textDecoration: "none" }}
                >
                  <button
                    className="quiz-action-btn quiz-action-edit"
                    style={{ width: "100%" }}
                  >
                    Edit
                  </button>
                </Link>
                <Link
                  to={`/admin/host?quiz=${quiz.id}`}
                  style={{ flex: 1, textDecoration: "none" }}
                >
                  <button
                    className="quiz-action-btn quiz-action-host"
                    style={{ width: "100%" }}
                  >
                    Host
                  </button>
                </Link>
                <button
                  className="quiz-action-btn quiz-action-delete"
                  onClick={(e) => handleDelete(quiz.id, e)}
                  title="Delete Quiz"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}

        {/* Divider */}
        <div className="quizzes-divider">
          <div className="quizzes-divider-line"></div>
          <span className="quizzes-divider-text">OR</span>
          <div className="quizzes-divider-line"></div>
        </div>

        {/* Create Quiz Button */}
        <Link to="/admin/quizzes/create" className="quizzes-create-btn">
          Create New Quiz
        </Link>
      </div>

      {/* Bottom Logo */}
      <div className="quizzes-bottom-logo">
        <img src="/gdgLogo.png" alt="GDG Logo" className="quizzes-logo-img" />
      </div>
    </div>
  );
}
