import React from 'react';
import { Navigate } from 'react-router-dom';

const ArchitectRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  
  // Check if user is logged in and is an architect
  if (!user.id || user.role !== 'architect') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ArchitectRoute;