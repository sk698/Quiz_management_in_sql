// src/pages/ChangePasswordPage.js
import React, { useState } from 'react';
import api from '../api/axiosConfig';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      // This will call the POST /api/v1/user/changePassword route
      const response = await api.post('/user/changePassword', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      setSuccess(response.data.message || "Password changed successfully!");
      // Clear the form
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="form-container">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="oldPassword">Old Password</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        
        <button type="submit" className="btn btn-primary">Update Password</button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;