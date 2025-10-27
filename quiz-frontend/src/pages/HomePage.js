// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quiz'); // GET /api/v1/quiz
        setQuizzes(response.data.data);
      } catch (err) {
        setError('Failed to load quizzes.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) return <p>Loading quizzes...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h2>Available Quizzes</h2>
      {quizzes.length === 0 ? (
        <p>No quizzes available at the moment.</p>
      ) : (
        <div className="quiz-list">
          {quizzes.map((quiz) => (
            <div key={quiz.quiz_id} className="quiz-list-item">
              <h3>{quiz.title}</h3>
              <Link to={`/quiz/${quiz.quiz_id}`} className="btn btn-primary">
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;