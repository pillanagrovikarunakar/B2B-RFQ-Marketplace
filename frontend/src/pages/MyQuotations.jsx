import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import quotationService from '../api/quotationService';

const MyQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await quotationService.getMyQuotations();
      setQuotations(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your submitted quotations.');
    } finally {
      setLoading(false);
    }
  };

  const totalQuotedValue = quotations.reduce((sum, q) => sum + (parseFloat(q.quoted_price) || 0), 0);

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">My Submitted Quotations</h2>
          <p className="text-muted mb-0">Track price bids you have submitted for buyer RFQs.</p>
        </div>
        <div>
          <Link to="/supplier/rfqs" className="btn btn-success bg-gradient rounded-pill px-4 py-2 fw-bold shadow-sm">
            <i className="bi bi-search me-2"></i>Browse Marketplace RFQs
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Summary Stat Banner */}
      {!loading && quotations.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase d-block">Submitted Quotations</span>
                  <h3 className="fw-bold text-success mb-0">{quotations.length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-4 fs-4">
                  <i className="bi bi-send-check"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase d-block">Total Quoted Value</span>
                  <h3 className="fw-bold text-dark mb-0">
                    ${totalQuotedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4 fs-4">
                  <i className="bi bi-currency-dollar"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotations List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading quotations...</span>
          </div>
          <p className="text-muted mt-3">Fetching your submitted quotations...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <div className="card-body">
            <i className="bi bi-send-x fs-1 text-muted mb-3 d-block"></i>
            <h4 className="fw-bold">No Submitted Quotations</h4>
            <p className="text-muted mb-4">You have not submitted any quotations for buyer RFQs yet.</p>
            <Link to="/supplier/rfqs" className="btn btn-success rounded-pill px-4 py-2">
              Browse Open RFQs
            </Link>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>RFQ Product</th>
                  <th>Quoted Total Price</th>
                  <th>Est. Delivery Time</th>
                  <th>Message / Notes</th>
                  <th>Submitted Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quote) => (
                  <tr key={quote.id}>
                    <td>
                      <h6 className="fw-bold text-dark mb-0">{quote.rfq_product_name}</h6>
                      <small className="text-muted">RFQ #{quote.rfq}</small>
                    </td>
                    <td className="fw-bold text-success fs-6">
                      ${parseFloat(quote.quoted_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2.5 py-1.5">
                        <i className="bi bi-truck me-1 text-primary"></i>
                        {quote.estimated_delivery_time}
                      </span>
                    </td>
                    <td className="small text-secondary" style={{ maxWidth: '250px' }}>
                      {quote.message ? (
                        <span className="text-truncate d-block" title={quote.message}>
                          {quote.message}
                        </span>
                      ) : (
                        <em className="text-muted">None</em>
                      )}
                    </td>
                    <td className="small text-muted">{new Date(quote.created_at).toLocaleDateString()}</td>
                    <td className="text-end">
                      <Link
                        to={`/supplier/rfqs/${quote.rfq}`}
                        className="btn btn-sm btn-outline-success rounded-pill px-3"
                      >
                        View RFQ Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuotations;
