"use client";

import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { firestoreService } from "../../../lib/firestore";
import { ArrowLeft } from "lucide-react";

const OPTION_COLORS = [
  "option-red",
  "option-blue",
  "option-yellow",
  "option-green",
];
const OPTION_LABELS = ["A", "B", "C", "D"];

interface QuestionData {
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

export default function CreateQuizPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([
    { text: "", options: ["", "", "", ""], correctAnswer: 0, timeLimit: 30 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], correctAnswer: 0, timeLimit: 30 },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (
    qIndex: number,
    field: keyof QuestionData,
    value: any,
  ) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a quiz title");
      return;
    }
    if (questions.some((q) => !q.text.trim())) {
      setError("Please complete all questions");
      return;
    }
    if (questions.some((q) => q.options.some((opt) => !opt.trim()))) {
      setError("Please complete all options");
      return;
    }
    if (!user) {
      setError("You must be logged in");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const quizId = await firestoreService.createQuiz({
        title: title.trim(),
        description: description.trim(),
        questions: questions.map((q, i) => ({
          id: `q${i}`,
          text: q.text.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctAnswer: q.correctAnswer,
          timeLimit: q.timeLimit,
        })),
        createdBy: user.uid,
      });
      navigate(`/admin/quizzes/${quizId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-quiz-page">
      {/* Back Button */}
      <Link
        to="/admin/quizzes"
        className="create-back-btn"
        title="Back to Quizzes"
      >
        <ArrowLeft size={24} />
      </Link>

      {/* Header */}
      <div className="create-quiz-header">
        <h1 className="create-quiz-title">Create Quiz</h1>
        <p className="create-quiz-subtitle">Add questions to your quiz</p>
      </div>

      {/* White Card Container */}
      <div className="create-quiz-container">
        <form onSubmit={handleSubmit} className="create-quiz-form">
          {/* Quiz Title */}
          <div className="create-input-group">
            <label className="create-label">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="create-input"
              required
            />
          </div>

          {/* Description */}
          <div className="create-input-group">
            <label className="create-label">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              className="create-input"
            />
          </div>

          {/* Questions */}
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="create-question-card">
              <div className="create-question-header">
                <span className="create-question-label">
                  Question {qIndex + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="create-remove-btn"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="create-question-content">
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) =>
                    updateQuestion(qIndex, "text", e.target.value)
                  }
                  placeholder="Enter question..."
                  className="create-input"
                  required
                />

                <div className="create-options-list">
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      onClick={() =>
                        updateQuestion(qIndex, "correctAnswer", oIndex)
                      }
                      className={`create-option-item ${
                        question.correctAnswer === oIndex
                          ? "create-option-selected"
                          : ""
                      }`}
                    >
                      <div
                        className={`create-option-label ${OPTION_COLORS[oIndex]}`}
                      >
                        <span className="create-option-text">
                          {OPTION_LABELS[oIndex]}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Option ${OPTION_LABELS[oIndex]}`}
                        className="create-option-input"
                        required
                      />
                      {question.correctAnswer === oIndex && (
                        <span className="create-correct-badge">✓</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="create-time-control">
                  <span className="create-time-label">Time:</span>
                  <input
                    type="number"
                    value={question.timeLimit}
                    onChange={(e) =>
                      updateQuestion(
                        qIndex,
                        "timeLimit",
                        parseInt(e.target.value) || 30,
                      )
                    }
                    min="5"
                    max="120"
                    className="create-time-input"
                  />
                  <span className="create-time-label">sec</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <button
            type="button"
            onClick={addQuestion}
            className="create-add-btn"
          >
            + Add Question
          </button>

          {/* Error Message */}
          {error && <p className="create-error">{error}</p>}

          {/* Action Buttons */}
          <div className="create-button-group">
            <Link to="/admin/quizzes" className="create-cancel-btn">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="create-submit-btn"
            >
              {loading ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
