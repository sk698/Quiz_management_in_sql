// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  // Use a single state for the identifier (email/username)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // --- THIS IS THE FIX ---
    // Check if the identifier looks like an email
    const isEmail = identifier.includes('@');
    
    // Create the correct credentials object
    const credentials = {
      password: password
    };

    if (isEmail) {
      credentials.email = identifier;
    } else {
      credentials.username = identifier;
    }
    // --- END OF FIX ---

    try {
      // Pass the correctly formatted object to the login function
      await login(credentials);
      // Navigation is handled inside auth context
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="identifier">Email or Username</label>
          <input
            type="text"
            id="identifier"
            name="identifier" // Use a generic name
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)} // Update identifier state
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;