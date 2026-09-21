import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import rfqService from '../api/rfqService';
import quotationService from '../api/quotationService';

const BuyerDashboard = () => {
  const { user, logout } = useAuth();

  const [rfqs, setRfqs] = useState([]);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const rfqList = await rfqService.getRFQs();
      setRfqs(rfqList);

      // Fetch quotations count across all buyer RFQs
      let quoteCount = 0;
      await Promise.all(
        rfqList.map(async (rfq) => {
          try {
            const quotes = await quotationService.getRFQQuotations(rfq.id);
            quoteCount += quotes.length;
          } catch (e) {
            // ignore error for single rfq
          }
        })
      );
      setTotalQuotes(quoteCount);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const openRfqsCount = rfqs.filter((r) => r.status === 'OPEN').length;
  const closedRfqsCount = rfqs.filter((r) => r.status === 'CLOSED').length;
  const recentRfqs = rfqs.slice(0, 5);

  return (
    <div className="container py-5">
      {/* Welcome Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary bg-gradient text-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <div>
                <span className="badge bg-light text-primary px-3 py-2 rounded-pill fw-bold mb-2">
                  BUYER PORTAL
                </span>
                <h2 className="fw-bold mb-1">Welcome back, {user?.name}!</h2>
                <p className="mb-0 text-white-50">{user?.email} • Buyer Account</p>
              </div>
              <div className="mt-3 mt-md-0 d-flex gap-2">
                <Link to="/buyer/rfqs/new" className="btn btn-light text-primary rounded-pill px-4 fw-bold shadow-sm">
                  <i className="bi bi-plus-lg me-1"></i> Post New RFQ
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
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase d-block mb-1">Total RFQs</span>
                <h2 className="fw-bold text-dark mb-0">{loading ? '...' : rfqs.length}</h2>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4 fs-3">
                <i className="bi bi-folder-check"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase d-block mb-1">Open RFQs</span>
                <h2 className="fw-bold text-success mb-0">{loading ? '...' : openRfqsCount}</h2>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-4 fs-3">
                <i className="bi bi-check-circle"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase d-block mb-1">Closed RFQs</span>
                <h2 className="fw-bold text-secondary mb-0">{loading ? '...' : closedRfqsCount}</h2>
              </div>
              <div className="bg-secondary bg-opacity-10 text-secondary p-3 rounded-4 fs-3">
                <i className="bi bi-lock"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase d-block mb-1">Total Quotations</span>
                <h2 className="fw-bold text-info mb-0">{loading ? '...' : totalQuotes}</h2>
              </div>
              <div className="bg-info bg-opacity-10 text-info p-3 rounded-4 fs-3">
                <i className="bi bi-chat-left-quote"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="card-body text-center">
              <i className="bi bi-plus-circle-fill fs-1 text-primary mb-3 d-block"></i>
              <h5 className="fw-bold">Create New RFQ</h5>
              <p className="text-muted small mb-4">Post product specifications and delivery deadlines to receive supplier bids.</p>
              <Link to="/buyer/rfqs/new" className="btn btn-primary rounded-pill w-100 fw-semibold">
                Post RFQ Now
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="card-body text-center">
              <i className="bi bi-list-task fs-1 text-success mb-3 d-block"></i>
              <h5 className="fw-bold">Manage My RFQs</h5>
              <p className="text-muted small mb-4">View all your posted RFQs, update requirements, or close active requests.</p>
              <Link to="/buyer/rfqs" className="btn btn-outline-primary rounded-pill w-100 fw-semibold">
                View My RFQs
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="card-body text-center">
              <i className="bi bi-chat-quote-fill fs-1 text-info mb-3 d-block"></i>
              <h5 className="fw-bold">Received Quotations</h5>
              <p className="text-muted small mb-4">Review competitive bids, delivery timelines, and price breakdowns from suppliers.</p>
              <Link to="/buyer/quotations" className="btn btn-outline-info rounded-pill w-100 fw-semibold">
                Review Quotes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent RFQs Section */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Recent RFQs</h4>
          <Link to="/buyer/rfqs" className="btn btn-sm btn-link text-primary text-decoration-none fw-bold">
            View All ({rfqs.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
            <span className="ms-2 text-muted">Loading recent RFQs...</span>
          </div>
        ) : recentRfqs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-3">You have not created any RFQs yet.</p>
            <Link to="/buyer/rfqs/new" className="btn btn-primary btn-sm rounded-pill px-3">
              + Post First RFQ
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Destination</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRfqs.map((rfq) => (
                  <tr key={rfq.id}>
                    <td className="fw-semibold text-dark">{rfq.product_name}</td>
                    <td>{rfq.quantity.toLocaleString()}</td>
                    <td>{rfq.delivery_location}</td>
                    <td className="small text-muted">{new Date(rfq.deadline).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          rfq.status === 'OPEN' ? 'bg-success' : 'bg-secondary'
                        } rounded-pill px-3 py-1`}
                      >
                        {rfq.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link to={`/buyer/rfqs/${rfq.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
