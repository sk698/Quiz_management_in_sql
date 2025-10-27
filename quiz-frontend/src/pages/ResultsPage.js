// src/pages/ResultsPage.js
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const ResultsPage = () => {
  const { state } = useLocation();
  const result = state?.result;

  if (!result) {
    return (
      <div className="results-container">
        <h2>No result found.</h2>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h2>Quiz Completed!</h2>
      <h1>{`Your Score: ${result.score} / ${result.totalQuestions}`}</h1>
      <p>Your attempt has been recorded.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
};

export default ResultsPage;