// src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [error, setError] = useState('');

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/quiz');
      setQuizzes(response.data.data);
    } catch (err) {
      setError('Failed to load quizzes.');
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/quiz/create', { title: newQuizTitle });
      setNewQuizTitle('');
      fetchQuizzes(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz.');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure? This will delete the quiz and all its questions.')) {
      try {
        await api.delete(`/quiz/${quizId}/delete`);
        fetchQuizzes(); // Refresh the list
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete quiz.');
      }
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      
      <h3>Create New Quiz</h3>
      <form onSubmit={handleCreateQuiz} className="form-container">
        <div className="form-group">
          <label htmlFor="title">Quiz Title</label>
          <input
            type="text"
            id="title"
            value={newQuizTitle}
            onChange={(e) => setNewQuizTitle(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Quiz</button>
      </form>
      {error && <p className="error-message">{error}</p>}

      <hr style={{ margin: '30px 0' }} />

      <h3>Manage Quizzes</h3>
      <div className="quiz-list">
        {quizzes.map((quiz) => (
          <div key={quiz.quiz_id} className="quiz-list-item">
            <div>
              <h3>{quiz.title}</h3>
              <small>ID: {quiz.quiz_id}</small>
            </div>
            <div>
              {/* --- NEW LINK ADDED HERE --- */}
              <Link
                to={`/quiz/${quiz.quiz_id}`}
                className="btn btn-primary btn-small"
                target="_blank" // Opens in a new tab so admin doesn't lose dashboard
                rel="noopener noreferrer"
              >
                Attempt Quiz
              </Link>
              {/* --- END OF NEW LINK --- */}

              <Link
                to={`/admin/quiz/${quiz.quiz_id}/add`}
                className="btn btn-secondary btn-small"
              >
                Add Questions
              </Link>
              <button
                onClick={() => handleDeleteQuiz(quiz.quiz_id)}
                className="btn btn-danger btn-small"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;