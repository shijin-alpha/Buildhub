import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple default avatar SVG component
const DefaultAvatar = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#e6efff" />
    <circle cx="12" cy="9" r="4" fill="#99b7ff" />
    <path d="M4 19.5C6.2 16.5 8.9 15 12 15c3.1 0 5.8 1.5 8 4.5" fill="#99b7ff" />
  </svg>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Read user info from localStorage
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('bh_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const displayName = useMemo(() => {
    if (!user) return '';
    if (user.name && user.name.trim()) return user.name;
    if (user.email) return user.email;
    return '';
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bh_user');
    sessionStorage.removeItem('user');
    setOpen(false);
    navigate('/login');
  };

  const handleProfile = () => {
    setOpen(false);
    // Navigate to profile based on user role
    if (user?.role === 'homeowner') {
      navigate('/homeowner-dashboard');
    } else if (user?.role === 'contractor') {
      navigate('/contractor-dashboard');
    } else if (user?.role === 'architect') {
      navigate('/architect-dashboard');
    } else {
      navigate('/profile');
    }
  };

  const isGoogle = user?.method === 'google';
  const avatarUrl = isGoogle && user?.picture ? user.picture : null;

  return (
    <header className="bh-navbar">
      <div className="bh-navbar__brand">
        <img src="/images/logo.png" alt="BuildHub" />
        <span>BuildHub</span>
      </div>

      <div className="bh-navbar__spacer" />

      <div className="bh-navbar__user" ref={menuRef}>
        {displayName && <span className="bh-navbar__name">{displayName}</span>}
        <button
          className="bh-navbar__avatar"
          aria-label="Open profile menu"
          onClick={() => setOpen((v) => !v)}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" />
          ) : (
            <DefaultAvatar />
          )}
        </button>
        {open && (
          <div className="bh-navbar__menu" role="menu">
            <div className="bh-navbar__profile-section">
              <div className="bh-navbar__profile-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" />
                ) : (
                  <DefaultAvatar size={48} />
                )}
              </div>
              <div className="bh-navbar__profile-info">
                <div className="bh-navbar__profile-name">{displayName}</div>
                <div className="bh-navbar__profile-email">{user?.email}</div>
                {user?.role && (
                  <div className="bh-navbar__profile-role">
                    {user.role === 'homeowner' && '🏠 Homeowner'}
                    {user.role === 'contractor' && '👷‍♂️ Contractor'}
                    {user.role === 'architect' && '🏛️ Architect'}
                    {user.role === 'admin' && '🔐 Admin'}
                  </div>
                )}
              </div>
            </div>
            <div className="bh-navbar__menu-divider"></div>
            <button className="bh-navbar__menu-item" onClick={handleProfile}>
              <span className="bh-navbar__menu-icon">👤</span>
              View Profile
            </button>
            <button className="bh-navbar__menu-item" onClick={handleLogout}>
              <span className="bh-navbar__menu-icon">🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;