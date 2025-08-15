import React from 'react';
import { Navigate } from 'react-router-dom';

const HomeownerRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  
  // Check if user is logged in and is a homeowner
  if (!user.id || user.role !== 'homeowner') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default HomeownerRoute;