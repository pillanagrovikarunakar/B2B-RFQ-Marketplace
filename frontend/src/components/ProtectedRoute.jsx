import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component enforcing authentication and role authorization.
 *
 * @param {Array} allowedRoles - List of roles permitted to access the route ('BUYER', 'SUPPLIER')
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect user to their own valid role dashboard if trying to access unauthorized route
    if (user?.role === 'BUYER') {
      return <Navigate to="/buyer/dashboard" replace />;
    } else if (user?.role === 'SUPPLIER') {
      return <Navigate to="/supplier/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
