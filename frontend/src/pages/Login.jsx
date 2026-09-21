import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error: apiError, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true });
      } else if (user.role === 'SUPPLIER') {
        navigate('/supplier/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    clearError();
    setFormError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const userData = await login(email, password);

      // Redirect based on role
      if (from) {
        navigate(from, { replace: true });
      } else if (userData.role === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true });
      } else if (userData.role === 'SUPPLIER') {
        navigate('/supplier/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      // Error handled by AuthContext state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-primary bg-gradient text-white p-4 text-center border-0">
              <h3 className="fw-bold mb-1">Welcome Back</h3>
              <p className="mb-0 text-white-50">Sign in to your B2B RFQ Marketplace account</p>
            </div>
            <div className="card-body p-4 p-md-5 bg-white">
              {(formError || apiError) && (
                <div className="alert alert-danger alert-dismissible fade show rounded-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {formError || apiError}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setFormError('');
                      clearError();
                    }}
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="loginEmail" className="form-label fw-semibold text-secondary">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      id="loginEmail"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label htmlFor="loginPassword" className="form-label fw-semibold text-secondary mb-0">
                      Password
                    </label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      id="loginPassword"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary bg-gradient w-100 py-3 fw-bold rounded-3 shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="text-center">
                <p className="text-muted mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary fw-bold text-decoration-none ms-1">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
