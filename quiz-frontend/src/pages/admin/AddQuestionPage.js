// src/pages/admin/AddQuestionPage.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';

const AddQuestionPage = () => {
  const { quizId } = useParams();
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const correctCount = options.filter(opt => opt.isCorrect).length;
    if (correctCount === 0) {
      setError('You must select at least one correct answer.');
      return;
    }
    
    if (options.some(opt => opt.text.trim() === '')) {
      setError('Options text cannot be empty.');
      return;
    }

    const questionData = {
      text: questionText,
      options: options,
    };

    try {
      // Your backend supports adding one question at a time
      await api.post(`/quiz/${quizId}/questions/add`, questionData);
      setSuccess('Question added successfully!');
      // Clear form
      setQuestionText('');
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question.');
    }
  };

  return (
    <div>
      <h2>Add Question to Quiz (ID: {quizId})</h2>
      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-group">
          <label htmlFor="questionText">Question Text</label>
          <input
            type="text"
            id="questionText"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </div>

        <div className="options-container">
          <label>Options</label>
          {options.map((opt, index) => (
            <div key={index} className="option-item">
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={opt.text}
                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                required
              />
              <input
                type="checkbox"
                title="Is Correct?"
                checked={opt.isCorrect}
                onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
              />
              <label>Correct</label>
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="btn btn-danger btn-small"
                disabled={options.length <= 2}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addOption} className="btn btn-secondary">
            Add Option
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Save Question
        </button>
      </form>
    </div>
  );
};

export default AddQuestionPage;