import React from 'react';
import { useAuth } from '../context/AuthContext';

const SupplierDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-success text-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <div>
                <span className="badge bg-light text-success px-3 py-2 rounded-pill fw-bold mb-2">
                  SUPPLIER PORTAL
                </span>
                <h2 className="fw-bold mb-1">Welcome back, {user?.name}!</h2>
                <p className="mb-0 text-white-50">{user?.email} • Supplier Account</p>
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
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
            <div className="card-body">
              <i className="bi bi-search fs-1 text-success mb-3 d-block"></i>
              <h5 className="fw-bold">Browse Open RFQs</h5>
              <p className="text-muted small">Search open Requests for Quotations posted by buyers and submit competitive bids.</p>
              <button className="btn btn-success rounded-pill px-4">Browse Marketplace</button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
            <div className="card-body">
              <i className="bi bi-send-check fs-1 text-primary mb-3 d-block"></i>
              <h5 className="fw-bold">My Submitted Quotations</h5>
              <p className="text-muted small">Track all quotations you have submitted across open and past buyer RFQs.</p>
              <button className="btn btn-outline-success rounded-pill px-4">View My Quotes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
