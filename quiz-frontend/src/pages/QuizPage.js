// src/pages/QuizPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // Stores { questionId: optionId }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // This route is incorrect in your backend (getAllQuestions in qustion.controller.js)
        // It returns 'questions' but maps it incorrectly.
        // Assuming backend route GET /api/v1/quiz/:quizId returns the questions
        const response = await api.get(`/quiz/${quizId}`);
        setQuestions(response.data.data);
      } catch (err) {
        setError('Failed to load quiz questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId]);

  const handleOptionChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Format for the backend: [{ questionId: X, optionId: Y }, ...]
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: parseInt(qId),
      optionId: parseInt(answers[qId]),
    }));

    if (formattedAnswers.length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    try {
      const response = await api.post(`/quiz/${quizId}/submit`, {
        answers: formattedAnswers,
      });
      // Navigate to results page, passing the result data
      navigate(`/quiz/${quizId}/results`, { state: { result: response.data.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz.');
    }
  };

  if (loading) return <p>Loading quiz...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h2>Quiz Time!</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((q) => (
          <div key={q.question_id} className="question-block">
            <h3>{q.text}</h3>
            {q.options.map((opt) => (
              <label key={opt.option_id} className="option-label">
                <input
                  type="radio"
                  name={`question_${q.question_id}`}
                  value={opt.option_id}
                  onChange={() => handleOptionChange(q.question_id, opt.option_id)}
                  required
                />
                {opt.text}
              </label>
            ))}
          </div>
        ))}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn btn-primary">Submit Quiz</button>
      </form>
    </div>
  );
};

export default QuizPage;