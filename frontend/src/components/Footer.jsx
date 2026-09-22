import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-5">
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <i className="bi bi-diagram-3-fill text-primary me-2"></i>
              <span>B2B RFQ Marketplace</span>
            </h5>
            <p className="text-white-50 small pe-lg-4 mb-3">
              A enterprise sourcing platform connecting verified buyers with suppliers to post Request for Quotations (RFQs), submit competitive price bids, and streamline industrial procurement.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-secondary bg-opacity-20 text-white-50 border border-secondary px-2.5 py-1.5 small">
                <i className="bi bi-shield-check me-1 text-success"></i> JWT Encrypted
              </span>
              <span className="badge bg-secondary bg-opacity-20 text-white-50 border border-secondary px-2.5 py-1.5 small">
                <i className="bi bi-database-check me-1 text-info"></i> RBAC Secured
              </span>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="fw-bold text-uppercase text-white-50 mb-3 small">Quick Links</h6>
            <ul className="list-unstyled mb-0 small">
              <li className="mb-2">
                <Link to="/" className="text-white-50 text-decoration-none opacity-100-hover">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-white-50 text-decoration-none opacity-100-hover">Sign In</Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-white-50 text-decoration-none opacity-100-hover">Register Account</Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-4">
            <h6 className="fw-bold text-uppercase text-white-50 mb-3 small">Marketplace Portals</h6>
            <ul className="list-unstyled mb-0 small">
              <li className="mb-2">
                <i className="bi bi-cart-check text-primary me-2"></i>
                <span className="text-white-50">Buyer Portal — Post RFQs & Review Quotations</span>
              </li>
              <li className="mb-2">
                <i className="bi bi-building-check text-success me-2"></i>
                <span className="text-white-50">Supplier Portal — Browse RFQs & Submit Bids</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary opacity-25 my-4" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center text-white-50 small">
          <p className="mb-2 mb-sm-0">&copy; {new Date().getFullYear()} B2B RFQ Marketplace. All rights reserved.</p>
          <p className="mb-0">Designed with Bootstrap 5</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
