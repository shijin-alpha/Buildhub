<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const HomeownerRoute = ({ children }) => {
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      let serverAuth = false;
      try {
        const res = await fetch('/buildhub/backend/api/session_check.php', { credentials: 'include' });
        const data = await res.json();
        serverAuth = !!data.authenticated;
      } catch {}
      setOk(!!user.id && user.role === 'homeowner' && serverAuth);
      setChecked(true);
    })();
  }, []);

  if (!checked) return null;
  if (!ok) return <Navigate to="/login" replace />;
=======
import React from 'react';
import { Navigate } from 'react-router-dom';

const HomeownerRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  
  // Check if user is logged in and is a homeowner
  if (!user.id || user.role !== 'homeowner') {
    return <Navigate to="/login" replace />;
  }
  
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
  return children;
};

export default HomeownerRoute;