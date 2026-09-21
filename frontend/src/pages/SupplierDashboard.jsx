import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import rfqService from '../api/rfqService';
import quotationService from '../api/quotationService';

const SupplierDashboard = () => {
  const { user, logout } = useAuth();

  const [openRfqs, setOpenRfqs] = useState([]);
  const [myQuotations, setMyQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const [rfqList, quotesList] = await Promise.all([
        rfqService.getRFQs(),
        quotationService.getMyQuotations(),
      ]);

      setOpenRfqs(rfqList.filter((r) => r.status === 'OPEN'));
      setMyQuotations(quotesList);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load supplier metrics.');
    } finally {
      setLoading(false);
    }
  };

  const totalQuotedValue = myQuotations.reduce(
    (sum, q) => sum + (parseFloat(q.quoted_price) || 0),
    0
  );

  const recentOpenRfqs = openRfqs.slice(0, 5);
  const quotedRfqIds = new Set(myQuotations.map((q) => q.rfq));

  return (
    <div className="container py-5">
      {/* Welcome Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-success bg-gradient text-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <div>
                <span className="badge bg-light text-success px-3 py-2 rounded-pill fw-bold mb-2">
                  SUPPLIER PORTAL
                </span>
                <h2 className="fw-bold mb-1">Welcome back, {user?.name}!</h2>
                <p className="mb-0 text-white-50">{user?.email} • Supplier Account</p>
              </div>
              <div className="mt-3 mt-md-0 d-flex gap-2">
                <Link to="/supplier/rfqs" className="btn btn-light text-success rounded-pill px-4 fw-bold shadow-sm">
                  <i className="bi bi-search me-1"></i> Browse Marketplace
                </Link>
                <button onClick={logout} className="btn btn-outline-light rounded-pill px-4">
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase d-block mb-1">Open RFQs Available</span>
                <h2 className="fw-bold text-success mb-0">{loading ? '...' : openRfqs.length}</h2>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-4 fs-3">
                <i className="bi bi-shop"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase d-block mb-1">My Submitted Quotes</span>
                <h2 className="fw-bold text-primary mb-0">{loading ? '...' : myQuotations.length}</h2>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4 fs-3">
                <i className="bi bi-send-check"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase d-block mb-1">Total Quoted Value</span>
                <h2 className="fw-bold text-dark mb-0">
                  {loading ? '...' : `$${totalQuotedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </h2>
              </div>
              <div className="bg-info bg-opacity-10 text-info p-3 rounded-4 fs-3">
                <i className="bi bi-currency-dollar"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="card-body text-center">
              <i className="bi bi-search fs-1 text-success mb-3 d-block"></i>
              <h5 className="fw-bold">Browse Open RFQs</h5>
              <p className="text-muted small mb-4">
                Explore active buyer RFQs, search by product, filter by location, and submit price bids.
              </p>
              <Link to="/supplier/rfqs" className="btn btn-success rounded-pill w-100 fw-semibold">
                Browse Marketplace RFQs
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="card-body text-center">
              <i className="bi bi-send-check-fill fs-1 text-primary mb-3 d-block"></i>
              <h5 className="fw-bold">My Submitted Quotations</h5>
              <p className="text-muted small mb-4">
                Review and track all price quotations you have submitted across open and closed RFQs.
              </p>
              <Link to="/supplier/quotations" className="btn btn-outline-success rounded-pill w-100 fw-semibold">
                View My Quotations
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Open RFQs Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Recent Open Marketplace RFQs</h4>
          <Link to="/supplier/rfqs" className="btn btn-sm btn-link text-success text-decoration-none fw-bold">
            View All ({openRfqs.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success spinner-border-sm" role="status"></div>
            <span className="ms-2 text-muted">Loading open RFQs...</span>
          </div>
        ) : recentOpenRfqs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-0">No open RFQs currently available in the marketplace.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Delivery Location</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOpenRfqs.map((rfq) => {
                  const hasQuoted = quotedRfqIds.has(rfq.id);

                  return (
                    <tr key={rfq.id}>
                      <td className="fw-semibold text-dark">{rfq.product_name}</td>
                      <td>{rfq.quantity.toLocaleString()}</td>
                      <td>{rfq.delivery_location}</td>
                      <td className="small text-muted">{new Date(rfq.deadline).toLocaleDateString()}</td>
                      <td>
                        {hasQuoted ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1">
                            <i className="bi bi-check-circle-fill me-1"></i> Quoted
                          </span>
                        ) : (
                          <span className="badge bg-success rounded-pill px-3 py-1">OPEN</span>
                        )}
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/supplier/rfqs/${rfq.id}`}
                          className={`btn btn-sm ${hasQuoted ? 'btn-outline-success' : 'btn-success'} rounded-pill px-3`}
                        >
                          {hasQuoted ? 'View Quote' : 'Quote Now'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;
