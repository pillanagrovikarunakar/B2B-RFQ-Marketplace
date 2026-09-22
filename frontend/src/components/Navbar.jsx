import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'BUYER') return '/buyer/dashboard';
    if (user?.role === 'SUPPLIER') return '/supplier/dashboard';
    return '/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary bg-gradient shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <i className="bi bi-diagram-3-fill me-2 fs-4"></i>
          <span>B2B RFQ Marketplace</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2 mt-2 mt-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link text-white opacity-75 opacity-100-hover" to="/">
                Home
              </NavLink>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link text-white fw-semibold" to={getDashboardLink()}>
                    Dashboard
                  </NavLink>
                </li>

                {user?.role === 'BUYER' && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link text-white opacity-75 opacity-100-hover" to="/buyer/rfqs">
                        My RFQs
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link text-white opacity-75 opacity-100-hover" to="/buyer/quotations">
                        Quotations
                      </NavLink>
                    </li>
                    <li className="nav-item me-lg-2">
                      <Link className="btn btn-light text-primary btn-sm rounded-pill px-3 fw-bold shadow-sm" to="/buyer/rfqs/new">
                        + Post RFQ
                      </Link>
                    </li>
                  </>
                )}

                {user?.role === 'SUPPLIER' && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link text-white opacity-75 opacity-100-hover" to="/supplier/rfqs">
                        Browse RFQs
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link text-white opacity-75 opacity-100-hover" to="/supplier/quotations">
                        My Quotations
                      </NavLink>
                    </li>
                  </>
                )}

                <li className="nav-item d-flex align-items-center ms-lg-2">
                  <span className="badge bg-light text-primary px-3 py-2 rounded-pill shadow-sm">
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.name} ({user?.role})
                  </span>
                </li>
                <li className="nav-item ms-lg-2">
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-light btn-sm rounded-pill px-3 py-1 fw-bold"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-light rounded-pill px-3 py-1 me-2 fw-semibold" to="/login">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light text-primary rounded-pill px-3 py-1 fw-bold shadow-sm" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
