"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { firestoreService } from "../../../lib/firestore";
import { Quiz, Question } from "../../../types/firebase";
import { Spinner, EditableText } from "../../../components/ui";
import { ArrowLeft, Trash2, Play } from "lucide-react";

export default function QuizDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get quizId from URL params
  const quizId = params.quizId as string;

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) {
        setError("Quiz ID not found");
        setLoading(false);
        return;
      }

      try {
        const quizData = await firestoreService.getQuiz(quizId);
        setQuiz(quizData);
      } catch (err: any) {
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId, navigate]);

  const handleUpdateQuiz = async (field: keyof Quiz, value: any) => {
    if (!quiz) return;
    try {
      await firestoreService.updateQuiz(quiz.id, { [field]: value });
      setQuiz({ ...quiz, [field]: value });
    } catch (err) {
      console.error("Failed to update quiz:", err);
      alert("Failed to update quiz. Please try again.");
    }
  };

  const handleUpdateQuestion = async (
    questionIndex: number,
    updates: Partial<Question>,
  ) => {
    if (!quiz) return;

    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      ...updates,
    };

    try {
      await firestoreService.updateQuiz(quiz.id, {
        questions: updatedQuestions,
      });
      setQuiz({ ...quiz, questions: updatedQuestions });
    } catch (err) {
      console.error("Failed to update question:", err);
      alert("Failed to update question. Please try again.");
    }
  };

  const handleUpdateOption = async (
    questionIndex: number,
    optionIndex: number,
    newValue: string,
  ) => {
    if (!quiz) return;

    const updatedQuestions = [...quiz.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = newValue;

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions,
    };

    try {
      await firestoreService.updateQuiz(quiz.id, {
        questions: updatedQuestions,
      });
      setQuiz({ ...quiz, questions: updatedQuestions });
    } catch (err) {
      console.error("Failed to update option:", err);
      alert("Failed to update option. Please try again.");
    }
  };

  const handleAddQuestion = async () => {
    if (!quiz) return;
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      text: "New Question",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      timeLimit: 30,
    };
    const updatedQuestions = [...quiz.questions, newQuestion];
    try {
      await firestoreService.updateQuiz(quiz.id, {
        questions: updatedQuestions,
      });
      setQuiz({ ...quiz, questions: updatedQuestions });
    } catch (err) {
      console.error("Failed to add question:", err);
      alert("Failed to add question");
    }
  };

  const handleRemoveQuestion = async (index: number) => {
    if (!quiz) return;
    if (!confirm("Are you sure you want to remove this question?")) return;

    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    try {
      await firestoreService.updateQuiz(quiz.id, {
        questions: updatedQuestions,
      });
      setQuiz({ ...quiz, questions: updatedQuestions });
    } catch (err) {
      console.error("Failed to remove question:", err);
      alert("Failed to remove question");
    }
  };

  if (loading) {
    return (
      <div className="quiz-detail-loading">
        <Spinner size="lg" />
        <p className="quiz-detail-loading-text">Loading quiz...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="quiz-detail-loading">
        <div className="quiz-detail-error-card">
          <h2 className="quiz-detail-error-title">Error</h2>
          <p className="quiz-detail-error-text">{error || "Quiz not found"}</p>
          <Link to="/admin/quizzes" className="quiz-detail-error-link">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-detail-page">
      {/* Back Button */}
      <Link
        to="/admin/quizzes"
        className="quiz-detail-back-btn"
        title="Back to Quizzes"
      >
        <ArrowLeft size={24} />
      </Link>

      {/* Purple Header */}
      <div className="quiz-detail-page-header">
        <h1 className="quiz-detail-page-title">Edit Quiz</h1>
      </div>

      {/* White Card Container */}
      <div className="quiz-detail-container">
        {/* Quiz Info Header */}
        <div className="quiz-detail-header">
          <div className="quiz-detail-title-section">
            <EditableText
              value={quiz.title}
              onSave={(val) => handleUpdateQuiz("title", val)}
              className="quiz-detail-title-wrapper"
              textClassName="quiz-detail-title"
              label="Quiz Title"
            />
            <EditableText
              value={quiz.description || ""}
              onSave={(val) => handleUpdateQuiz("description", val)}
              className="quiz-detail-description"
              multiline
              label="Description"
              placeholder="Add a description describing your quiz..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="quiz-detail-actions">
          <Link
            to={`/admin/host?quiz=${quiz.id}`}
            className="quiz-detail-host-btn"
          >
            <Play
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Host Quiz
          </Link>
          <button
            className="quiz-detail-delete-btn"
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete this quiz entirelly? This cannot be undone.",
                )
              ) {
                firestoreService
                  .deleteQuiz(quiz.id)
                  .then(() => {
                    navigate("/admin/quizzes");
                  })
                  .catch((err: Error) => {
                    alert("Failed to delete quiz: " + err.message);
                  });
              }
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Questions */}
        <div className="quiz-detail-questions-grid">
          <div className="quiz-detail-questions-header">
            <h2 className="quiz-detail-questions-title">
              Questions ({quiz.questions.length})
            </h2>
            <button
              className="quiz-detail-add-question-btn"
              onClick={handleAddQuestion}
            >
              Add Question
            </button>
          </div>

          <div className="quiz-detail-questions-list">
            {quiz.questions.map((question, qIndex) => (
              <div
                key={question.id || qIndex}
                className="quiz-detail-question-item"
              >
                <div className="quiz-detail-question-header">
                  <span className="quiz-detail-question-number">
                    Question {qIndex + 1}
                  </span>
                  <button
                    className="quiz-detail-question-remove"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    title="Remove Question"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <EditableText
                  value={question.text}
                  onSave={(val) => handleUpdateQuestion(qIndex, { text: val })}
                  textClassName="quiz-detail-question-text"
                  multiline
                />

                <div className="quiz-detail-options-list">
                  {question.options.map((option, oIndex) => {
                    const OPTION_COLORS = [
                      "option-red",
                      "option-blue",
                      "option-yellow",
                      "option-green",
                    ];
                    const OPTION_LABELS = ["Red", "Blue", "Yellow", "Green"];
                    const color = OPTION_COLORS[oIndex] || OPTION_COLORS[0];
                    const label = OPTION_LABELS[oIndex] || OPTION_LABELS[0];
                    const isCorrect = oIndex === question.correctAnswer;

                    return (
                      <div key={oIndex} className="quiz-detail-option-item">
                        <div
                          className={`quiz-detail-option-checkbox ${
                            isCorrect ? "quiz-detail-option-correct" : ""
                          }`}
                          onClick={() =>
                            handleUpdateQuestion(qIndex, {
                              correctAnswer: oIndex,
                            })
                          }
                          title={`Set ${label} as correct`}
                        >
                          {isCorrect && (
                            <svg
                              className="quiz-detail-checkmark"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={4}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div className={`quiz-detail-option-color ${color}`} />
                        <div className="quiz-detail-option-input-wrapper">
                          <EditableText
                            value={option}
                            onSave={(val) =>
                              handleUpdateOption(qIndex, oIndex, val)
                            }
                            label={label}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="quiz-detail-time-control">
                  <span>Time Limit:</span>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={question.timeLimit || 30}
                    onChange={(e) => {
                      const limit = parseInt(e.target.value);
                      if (!isNaN(limit) && limit > 0) {
                        handleUpdateQuestion(qIndex, { timeLimit: limit });
                      }
                    }}
                    className="quiz-detail-time-input"
                  />
                  <span>seconds</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
