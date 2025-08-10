import React, { useState } from 'react';
import '../styles/Login.css'; // Make sure path is correct

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateEmail = email => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validatePassword = password => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (/\s/.test(password)) {
      return 'Password cannot contain spaces.';
    }
    return '';
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!formData.email) {
      setError('Email is required.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid Gmail address (must end with @gmail.com).');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Submit logic here (e.g., API call)
    alert('Login successful!');
    setFormData({
      email: '',
      password: '',
    });
  };

  return (
    <main className="login-container" aria-label="Login form">
      <h2>Login to your account</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="full-width">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your.email@gmail.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            aria-describedby="emailError"
          />
        </div>

        <div className="full-width">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            aria-describedby="passwordError"
          />
        </div>

        {error && (
          <p className="error" role="alert" style={{ color: 'red', marginTop: '0.5rem' }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn-submit">
          Login
        </button>

        <button
          type="button"
          className="google-btn"
          aria-label="Sign in with Google"
          onClick={() => alert('Google SignIn - implement OAuth')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            role="img"
            aria-hidden="true"
            className="google-icon"
          >
            <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.36 9.12 3.59l6.79-6.79C34.96 2.68 29.82 0 24 0 14.82 0 7.01 5.87 3.7 14.15l7.91 6.14C13.62 14.42 18.33 9.5 24 9.5z" />
            <path fill="#34A853" d="M46.4 24.5c0-1.5-.13-2.88-.38-4.25H24v8.04h12.84c-.56 3.03-2.28 5.58-4.87 7.33l7.87 6.11c4.62-4.26 7.66-10.53 7.66-17.23z" />
            <path fill="#FBBC05" d="M11.61 28.29a14.77 14.77 0 0 1 0-8.58v-6.14L3.7 14.15A23.85 23.85 0 0 0 0 24c0 3.76 1.02 7.28 2.84 10.34l8.77-6.05z" />
            <path fill="#EA4335" d="M24 48c6.48 0 11.92-2.13 15.88-5.77l-7.87-6.11c-2.2 1.5-5.01 2.41-8.01 2.41-6.39 0-11.8-4.32-13.75-10.1l-8.77 6.04C7.01 42.13 14.82 48 24 48z" />
          </svg>
          Sign in with Google
        </button>

        <div className="extra-links">
          <a href="/forgot-password" aria-label="Forgot password?">
            Forgot password?
          </a>{' '}
          |{' '}
          <a href="/register" aria-label="Go to registration page">
            Don't have an account? Register
          </a>
        </div>
      </form>
    </main>
  );
};

export default Login;
