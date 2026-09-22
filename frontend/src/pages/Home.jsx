import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === 'BUYER') return '/buyer/dashboard';
    if (user?.role === 'SUPPLIER') return '/supplier/dashboard';
    return '/';
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary bg-gradient text-white py-5">
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <span className="badge bg-light text-primary px-3 py-2 rounded-pill fw-bold mb-3 shadow-sm">
                ENTERPRISE SOURCING & PROCUREMENT
              </span>
              <h1 className="display-4 fw-extrabold mb-3 text-white">
                Streamline Industrial B2B RFQs & Supplier Bidding
              </h1>
              <p className="lead text-white-50 mb-4 pe-lg-4">
                Connect Buyers with verified Suppliers. Post detailed Request for Quotations (RFQs), receive competitive price bids, and manage procurement transparently.
              </p>

              {isAuthenticated ? (
                <div className="d-flex flex-wrap gap-3">
                  <Link to={getDashboardLink()} className="btn btn-light text-primary btn-lg rounded-pill px-4 fw-bold shadow-sm">
                    <i className="bi bi-speedometer2 me-2"></i>Go to {user?.role === 'BUYER' ? 'Buyer' : 'Supplier'} Dashboard
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/register" className="btn btn-light text-primary btn-lg rounded-pill px-4 fw-bold shadow-sm">
                    <i className="bi bi-person-plus-fill me-2"></i>Register Now
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-bold">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Sign In to Portal
                  </Link>
                </div>
              )}
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden text-dark p-4 bg-white">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle me-3">
                      <i className="bi bi-shield-lock-fill fs-2"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Role-Based Access Control</h5>
                      <small className="text-muted">Separate Portals for Buyers & Suppliers</small>
                    </div>
                  </div>
                  <hr className="text-muted" />
                  <ul className="list-unstyled mb-0 small text-secondary">
                    <li className="mb-2 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Buyers post RFQs with strict deadlines & location limits</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Suppliers browse open RFQs & submit competitive bids</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Database Unique Constraints prevent duplicate bids</span>
                    </li>
                    <li className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Secure JWT authentication & real-time updates</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Marketplace Capabilities</span>
            <h2 className="fw-bold">Designed for Efficient B2B Procurement</h2>
          </div>

          <div className="row g-4">
            {/* For Buyers */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-4 border-top border-4 border-primary">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3 me-3">
                      <i className="bi bi-cart-check-fill fs-2"></i>
                    </div>
                    <div>
                      <h4 className="fw-bold mb-0">For Buyers</h4>
                      <span className="text-muted small">Post Sourcing Needs & Evaluate Quotes</span>
                    </div>
                  </div>
                  <ul className="list-unstyled text-secondary mb-4 small">
                    <li className="mb-2">✓ Create detailed RFQs with quantity, location, and deadline specifications.</li>
                    <li className="mb-2">✓ View and compare supplier price bids side-by-side.</li>
                    <li className="mb-2">✓ Track quote statistics (lowest price, average price).</li>
                    <li className="mb-2">✓ Close RFQs when sourcing demands are fulfilled.</li>
                  </ul>
                  <Link to="/register" className="btn btn-outline-primary rounded-pill w-100 fw-semibold">
                    Register as Buyer →
                  </Link>
                </div>
              </div>
            </div>

            {/* For Suppliers */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-4 border-top border-4 border-success">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 text-success p-3 rounded-3 me-3">
                      <i className="bi bi-building-check fs-2"></i>
                    </div>
                    <div>
                      <h4 className="fw-bold mb-0">For Suppliers</h4>
                      <span className="text-muted small">Discover Sourcing Leads & Win Contracts</span>
                    </div>
                  </div>
                  <ul className="list-unstyled text-secondary mb-4 small">
                    <li className="mb-2">✓ Browse open buyer RFQs across various delivery locations.</li>
                    <li className="mb-2">✓ Submit transparent price bids and estimated delivery times.</li>
                    <li className="mb-2">✓ Search open RFQs by product name and specifications.</li>
                    <li className="mb-2">✓ Track all your submitted quotations in a central portal.</li>
                  </ul>
                  <Link to="/register" className="btn btn-outline-success rounded-pill w-100 fw-semibold">
                    Register as Supplier →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
