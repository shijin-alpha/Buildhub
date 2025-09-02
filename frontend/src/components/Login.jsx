import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import '../styles/Login.css';
<<<<<<< HEAD
import { Eye, EyeOff } from 'lucide-react';
=======
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235

const GOOGLE_CLIENT_ID = "1024134456606-et46lrm2ce8tl567a4m4s4e0u3v5t4sa.apps.googleusercontent.com";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
<<<<<<< HEAD
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const navigate = useNavigate();

  // If navigating back from dashboards, ensure server session exists before redirecting forward
  useEffect(() => {
    (async () => {
      const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      let serverAuth = false;
      try {
        const res = await fetch('/buildhub/backend/api/session_check.php', { credentials: 'include' });
        const data = await res.json();
        serverAuth = !!data.authenticated;
      } catch {}

      if (storedUser?.role === 'homeowner' && serverAuth) navigate('/homeowner-dashboard', { replace: true });
      else if (storedUser?.role === 'contractor' && serverAuth) navigate('/contractor-dashboard', { replace: true });
      else if (storedUser?.role === 'architect' && serverAuth) navigate('/architect-dashboard', { replace: true });
    })();
  }, []);

=======
  const navigate = useNavigate();

>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
  // Google Sign-In state
  const googleBtn = useRef(null);
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    let canceled = false;
    let attempts = 0;
    const maxAttempts = 60; // ~9s at 150ms interval

    const tryInit = () => {
      if (canceled) return;
      if (window.google?.accounts?.id && googleBtn.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });
        window.google.accounts.id.renderButton(googleBtn.current, {
          theme: "filled_blue",
          size: "large",
          text: "signin_with",
          shape: "pill",
          logo_alignment: "left",
          width: 350,
        });
        return true;
      }
      return false;
    };

    if (!tryInit()) {
      const intervalId = setInterval(() => {
        attempts += 1;
        if (tryInit() || attempts >= maxAttempts) {
          clearInterval(intervalId);
        }
      }, 150);
    }

    return () => {
      canceled = true;
      if (window.google?.accounts?.id) {
        try { window.google.accounts.id.cancel(); } catch {}
      }
    };
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateEmail = email => {
<<<<<<< HEAD
    // Allow any valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
=======
    // Allow admin email or Gmail addresses
    if (email === 'shijinthomas369@gmail.com') {
      return true;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
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

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.email) {
      setError('Email is required.');
      return;
    }

    if (!validateEmail(formData.email)) {
<<<<<<< HEAD
      setError('Please enter a valid email address.');
=======
      setError('Please enter a valid Gmail address or admin email.');
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const res = await fetch('/buildhub/backend/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        // Check if it's admin login
        if (result.redirect === 'admin-dashboard') {
          // Store admin session info
          localStorage.setItem('admin_logged_in', 'true');
          localStorage.setItem('admin_username', 'admin');
          navigate('/admin-dashboard');
        } else {
          // Store user data for dashboard access
          sessionStorage.setItem('user', JSON.stringify(result.user));
          
          // Persist minimal user info for navbar display
          localStorage.setItem('bh_user', JSON.stringify({
            email: formData.email,
            name: result.user ? `${result.user.first_name} ${result.user.last_name}`.trim() : '',
            method: 'email',
            role: result.user?.role
          }));
          
          // Redirect based on user role
          if (result.redirect === 'homeowner-dashboard') {
            navigate('/homeowner-dashboard');
          } else if (result.user?.role === 'contractor') {
            navigate('/contractor-dashboard');
          } else if (result.user?.role === 'architect') {
            navigate('/architect-dashboard');
          } else {
            navigate('/login');
          }
        }
        setFormData({ email: '', password: '' });
        setError('');
      } else {
        setError(result.message || 'Login failed.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  // Google Sign-In callback
  const handleGoogleResponse = async (response) => {
    setGoogleError('');
    window.google.accounts.id.disableAutoSelect();
    window.google.accounts.id.revoke(response.credential, () => {});

    // Get user info from Google
    const userInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${response.credential}`
    );
    const userInfo = await userInfoRes.json();

    // Send to backend for login
    try {
      const res = await fetch('/buildhub/backend/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google: true,
          email: userInfo.email,
        }),
      });
      const result = await res.json();
      if (result.success) {
        // Store user data for dashboard access
        if (result.user) {
          sessionStorage.setItem('user', JSON.stringify(result.user));
        }
        
        // Persist minimal google user info for navbar display
        localStorage.setItem('bh_user', JSON.stringify({
          email: userInfo.email,
          name: `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
          picture: userInfo.picture,
          method: 'google',
          role: result.user?.role
        }));
        
        // Redirect based on user role
        if (result.redirect === 'homeowner-dashboard') {
          navigate('/homeowner-dashboard');
        } else if (result.redirect === 'contractor-dashboard') {
          navigate('/contractor-dashboard');
        } else if (result.redirect === 'architect-dashboard') {
          navigate('/architect-dashboard');
        } else {
          alert(result.message || 'Login successful! Await admin verification.');
          navigate('/login');
        }
      } else {
        setGoogleError(result.message || 'Google login failed.');
      }
    } catch (err) {
      setGoogleError('Server error. Please try again.');
    }
  };

  return (
    <main className="register-page" aria-label="Login section">
      {/* Left: Brand / Identity (reuse styles) */}
      <section className="register-logo-section" aria-label="BuildHub brand">
        <div className="brand">
          <img src="/images/logo.png" alt="BuildHub Logo" className="brand-logo" />
          <h1 className="brand-title">BuildHub</h1>
          <p className="brand-tagline">Welcome back! Continue building with confidence.</p>
          <ul className="brand-highlights" aria-label="Key highlights">
            <li>Secure login</li>
            <li>Verified professionals</li>
            <li>Fast project matching</li>
          </ul>
        </div>
      </section>

      {/* Right: Login Form with glass card */}
      <section className="register-form-section" aria-label="Login form">
        <h2>Login to your account</h2>
        <p className="subtitle">Access your dashboard and projects</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="full-width">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
<<<<<<< HEAD
              placeholder="Email address"
=======
              placeholder="your.email@gmail.com"
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              aria-describedby="emailError"
            />
          </div>

          <div className="full-width">
            <label htmlFor="password">Password</label>
<<<<<<< HEAD
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showLoginPwd ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                aria-describedby="passwordError"
                style={{ paddingRight: 36 }}
              />
              <button
                type="button"
                aria-label={showLoginPwd ? 'Hide password' : 'Show password'}
                onClick={() => setShowLoginPwd(v=>!v)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showLoginPwd ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
=======
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
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
          </div>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-submit">Login</button>

          {/* Inline links */}
          <div className="form-links">
            <a href="/forgot-password" aria-label="Forgot password?">Forgot password?</a>
            <a href="/register" aria-label="Go to registration page">Don't have an account? Register</a>
          </div>

          {/* Google Sign-In button bottom */}
          <div className="google-signin-block" style={{ marginTop: 12 }}>
            <div className="google-btn-container" ref={googleBtn} />
          </div>

          {googleError && (
            <p className="error" role="alert">
              {googleError}
            </p>
          )}
        </form>
      </section>
    </main>
  );
};

export default Login;
