import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../zustand/useAuthStore';


const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(state => state.token)
  console.log("token print in protected route", token)

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;