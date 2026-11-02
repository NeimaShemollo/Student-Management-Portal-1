import { useState } from 'react';
import axios from 'axios';
import "./ForgotPassword.css"

const ForgotPassword = () => {
  const [emailAddress, setEmailAddress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Adjust your backend URL/port if needed
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        emailAddress,
      });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='forgot-password-container'>
        <div className='forgot-password-card'>
      <h2>Forgot Password</h2>
      <p>Enter your email address and we'll send you a link to reset your password.</p>
      
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label>Email Address:</label>
          <input
            type="email"
            name="emailAddress"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            required
            placeholder="admin@example.com"
            
          />
        </div>

        <button type="submit" className='submit-btn' disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      {message && <p className='success-message'>{message}</p>}
      {error && <p className='error-message'>{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;