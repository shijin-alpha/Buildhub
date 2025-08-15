import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
  
  if (!isAdminLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedAdminRoute;