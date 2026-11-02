import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import "../styles/ResetPassword.css"

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 
  
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword,
      });

      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login'); 
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className='reset-password-container'>  
     <div className='reset-password-card'>
      <h2>Reset Password</h2>
      {message && <div className='success-message'>{message}</div>}
      {error && <div className='error-message'>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
       
          />
        </div>
        <button type='submit' className='submit-btn'>
          Update Password
        </button>
      </form>
    </div>
    </div>
 
  );
};

export default ResetPassword;