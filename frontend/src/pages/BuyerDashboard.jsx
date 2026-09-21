import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const BuyerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-primary text-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <div>
                <span className="badge bg-light text-primary px-3 py-2 rounded-pill fw-bold mb-2">
                  BUYER PORTAL
                </span>
                <h2 className="fw-bold mb-1">Welcome back, {user?.name}!</h2>
                <p className="mb-0 text-white-50">{user?.email} • Buyer Account</p>
              </div>
              <div className="mt-3 mt-md-0">
                <button onClick={logout} className="btn btn-outline-light rounded-pill px-4">
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
            <div className="card-body">
              <i className="bi bi-plus-circle fs-1 text-primary mb-3 d-block"></i>
              <h5 className="fw-bold">Create New RFQ</h5>
              <p className="text-muted small">Post a new Request For Quotation to receive bids from verified suppliers.</p>
              <button className="btn btn-primary rounded-pill px-3">Post RFQ</button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
            <div className="card-body">
              <i className="bi bi-card-checklist fs-1 text-success mb-3 d-block"></i>
              <h5 className="fw-bold">My Active RFQs</h5>
              <p className="text-muted small">Manage your created RFQs, check incoming quotations, or close active RFQs.</p>
              <button className="btn btn-outline-primary rounded-pill px-3">View My RFQs</button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
            <div className="card-body">
              <i className="bi bi-chat-quote fs-1 text-info mb-3 d-block"></i>
              <h5 className="fw-bold">Received Quotations</h5>
              <p className="text-muted small">Review competitive price bids and delivery timelines submitted by suppliers.</p>
              <button className="btn btn-outline-info rounded-pill px-3">Review Quotes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
