// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// User (Protected) Pages
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';

// Admin (Protected) Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AddQuestionPage from './pages/admin/AddQuestionPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="quiz/:quizId" element={<QuizPage />} />
          <Route path="quiz/:quizId/results" element={<ResultsPage />} />
        </Route>
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/quiz/:quizId/add" element={<AddQuestionPage />} />
        </Route>

        {/* Catch-all for 404 Not Found */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Route>
    </Routes>
  );
}

export default App;