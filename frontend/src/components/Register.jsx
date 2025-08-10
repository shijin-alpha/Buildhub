import React, { useState } from 'react';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateEmail = email => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const validatePassword = password => {
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (/\s/.test(password)) return 'Password cannot contain spaces.';
    return '';
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!formData.firstName.trim()) return setError('First Name is required.');
    if (!formData.lastName.trim()) return setError('Last Name is required.');
    if (!formData.email) return setError('Email is required.');
    if (!validateEmail(formData.email)) return setError('Enter a valid Gmail address.');

    const passwordError = validatePassword(formData.password);
    if (passwordError) return setError(passwordError);
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match!');
    if (!formData.role) return setError('Please select your role.');

    alert('Form submitted successfully!');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
  };

  return (
    <main className="register-page" aria-label="Registration section">
      {/* Left Side Logo/Image */}
      <div className="register-logo-section">
        <img src="/images/logo.png" alt="Brand Logo" className="side-logo" />
      </div>

      {/* Right Side Form */}
      <div className="register-form-section">
        <h2>Create Your Account</h2>
        <p className="subtitle">Join us today and start your journey 🚀</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid-two-col">
            <div>
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="full-width">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid-two-col">
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="full-width">
            <label htmlFor="role">Select Role</label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="homeowner">Homeowner</option>
              <option value="contractor">Contractor</option>
              <option value="architect">Architect</option>
            </select>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-submit">Register</button>

          <button
            type="button"
            className="google-btn"
            onClick={() => alert('Google SignUp - implement OAuth')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="google-icon">
              <path fill="#4285F4" d="M24 9.5c3.54 0..."/>
            </svg>
            Sign up with Google
          </button>

          <div className="extra-links">
            <a href="/forgot-password">Forgot password?</a> | 
            <a href="/login"> Already have an account? Login</a>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Register;
