import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error: apiError, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true });
      } else if (user.role === 'SUPPLIER') {
        navigate('/supplier/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    clearError();
    setFormError('');
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email address is required.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      const userData = await register(formData);

      if (userData.role === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true });
      } else if (userData.role === 'SUPPLIER') {
        navigate('/supplier/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      // Error managed in AuthContext state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-6">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-primary bg-gradient text-white p-4 text-center border-0">
              <h3 className="fw-bold mb-1">Create an Account</h3>
              <p className="mb-0 text-white-50">Join the B2B RFQ Marketplace as a Buyer or Supplier</p>
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
                {/* Account Role Selection */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-secondary mb-2">
                    I want to register as a:
                  </label>
                  <div className="row g-3">
                    <div className="col-6">
                      <div
                        className={`card h-100 border-2 text-center p-3 cursor-pointer rounded-3 ${
                          formData.role === 'BUYER' ? 'border-primary bg-primary-subtle' : 'border-light-subtle'
                        }`}
                        onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body p-2">
                          <i className={`bi bi-cart-check fs-2 ${formData.role === 'BUYER' ? 'text-primary' : 'text-muted'}`}></i>
                          <h6 className="fw-bold mb-1 mt-2">Buyer</h6>
                          <small className="text-muted d-block">Post RFQs & receive supplier quotes</small>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        className={`card h-100 border-2 text-center p-3 cursor-pointer rounded-3 ${
                          formData.role === 'SUPPLIER' ? 'border-success bg-success-subtle' : 'border-light-subtle'
                        }`}
                        onClick={() => setFormData({ ...formData, role: 'SUPPLIER' })}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body p-2">
                          <i className={`bi bi-building-check fs-2 ${formData.role === 'SUPPLIER' ? 'text-success' : 'text-muted'}`}></i>
                          <h6 className="fw-bold mb-1 mt-2">Supplier</h6>
                          <small className="text-muted d-block">Browse RFQs & submit quotations</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div className="mb-3">
                  <label htmlFor="regName" className="form-label fw-semibold text-secondary">
                    Full Name / Company Name
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      id="regName"
                      name="name"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="Acme Enterprises"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-3">
                  <label htmlFor="regEmail" className="form-label fw-semibold text-secondary">
                    Work Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      id="regEmail"
                      name="email"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label htmlFor="regPassword" className="form-label fw-semibold text-secondary">
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      id="regPassword"
                      name="password"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
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
                      Creating Account...
                    </>
                  ) : (
                    `Register as ${formData.role === 'BUYER' ? 'Buyer' : 'Supplier'}`
                  )}
                </button>
              </form>

              <hr className="my-4 text-muted" />

              <div className="text-center">
                <p className="text-muted mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-bold text-decoration-none ms-1">
                    Sign in here
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

export default Register;
