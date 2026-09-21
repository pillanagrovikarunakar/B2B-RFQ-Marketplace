import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import rfqService from '../api/rfqService';
import quotationService from '../api/quotationService';

const RFQDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [rfqData, quotesData] = await Promise.all([
        rfqService.getRFQById(id),
        quotationService.getRFQQuotations(id),
      ]);
      setRfq(rfqData);
      setQuotations(quotesData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load RFQ details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!rfq) return;
    const newStatus = rfq.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    const actionText = newStatus === 'CLOSED' ? 'close' : 're-open';

    if (!window.confirm(`Are you sure you want to ${actionText} this RFQ?`)) {
      return;
    }

    try {
      setStatusLoading(true);
      const updated = await rfqService.patchRFQ(rfq.id, { status: newStatus });
      setRfq(updated);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update RFQ status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Compute price statistics
  const prices = quotations.map((q) => parseFloat(q.quoted_price)).filter((p) => !isNaN(p));
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading details...</span>
        </div>
        <p className="text-muted mt-3">Loading RFQ specifications & received quotes...</p>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger rounded-4 p-4 text-center" role="alert">
          <i className="bi bi-exclamation-octagon fs-1 d-block mb-2"></i>
          <h4>{error || 'RFQ Not Found'}</h4>
          <p className="mb-3">The requested RFQ could not be found or you do not have permission to view it.</p>
          <Link to="/buyer/rfqs" className="btn btn-outline-danger rounded-pill px-4">
            Return to My RFQs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <Link to="/buyer/rfqs" className="btn btn-outline-secondary rounded-pill btn-sm mb-2">
            <i className="bi bi-arrow-left me-1"></i> Back to My RFQs
          </Link>
          <div className="d-flex align-items-center gap-3">
            <h2 className="fw-bold mb-0">{rfq.product_name}</h2>
            <span
              className={`badge ${
                rfq.status === 'OPEN' ? 'bg-success' : 'bg-secondary'
              } px-3 py-2 rounded-pill fs-6`}
            >
              {rfq.status}
            </span>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link to={`/buyer/rfqs/${rfq.id}/edit`} className="btn btn-outline-primary rounded-pill px-3">
            <i className="bi bi-pencil me-1"></i> Edit RFQ
          </Link>
          <button
            onClick={handleToggleStatus}
            className={`btn ${rfq.status === 'OPEN' ? 'btn-outline-warning' : 'btn-outline-success'} rounded-pill px-3`}
            disabled={statusLoading}
          >
            {statusLoading ? (
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
            ) : rfq.status === 'OPEN' ? (
              <>
                <i className="bi bi-lock me-1"></i> Close RFQ
              </>
            ) : (
              <>
                <i className="bi bi-unlock me-1"></i> Re-open RFQ
              </>
            )}
          </button>
        </div>
      </div>

      {/* Specifications Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-5 overflow-hidden bg-white">
        <div className="card-header bg-primary bg-gradient text-white p-4 border-0">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-file-earmark-text me-2"></i>RFQ Specifications & Requirements
          </h5>
        </div>
        <div className="card-body p-4 p-md-5">
          <div className="row g-4">
            <div className="col-12">
              <h6 className="fw-bold text-secondary text-uppercase mb-2">Description / Scope of Work</h6>
              <p className="text-dark bg-light p-3 rounded-3 mb-0" style={{ whiteSpace: 'pre-line' }}>
                {rfq.description}
              </p>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3">
                <span className="text-muted d-block small mb-1">Required Quantity</span>
                <span className="fw-bold fs-5 text-primary">
                  <i className="bi bi-box-seam me-2"></i>
                  {rfq.quantity.toLocaleString()} units
                </span>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3">
                <span className="text-muted d-block small mb-1">Delivery Destination</span>
                <span className="fw-bold fs-5 text-dark">
                  <i className="bi bi-geo-alt me-2 text-danger"></i>
                  {rfq.delivery_location}
                </span>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3">
                <span className="text-muted d-block small mb-1">Quotation Deadline</span>
                <span className="fw-bold fs-6 text-dark">
                  <i className="bi bi-calendar-check me-2 text-warning"></i>
                  {new Date(rfq.deadline).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quotations Section Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1">
            Received Supplier Quotations ({quotations.length})
          </h3>
          <p className="text-muted mb-0">Competitive bids submitted by verified suppliers.</p>
        </div>

        {quotations.length > 0 && (
          <div className="d-flex gap-3">
            <div className="badge bg-success bg-gradient px-3 py-2 rounded-3 text-start">
              <small className="d-block text-white-50">Lowest Quote</small>
              <span className="fs-6 fw-bold">${minPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="badge bg-info bg-gradient px-3 py-2 rounded-3 text-start">
              <small className="d-block text-white-50">Average Quote</small>
              <span className="fs-6 fw-bold">${avgPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quotations List */}
      {quotations.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <div className="card-body">
            <i className="bi bi-chat-left-quote fs-1 text-muted mb-3 d-block"></i>
            <h4 className="fw-bold">No Quotations Received Yet</h4>
            <p className="text-muted mb-0">
              Suppliers have not submitted quotes for this RFQ yet. Quotes will appear here as soon as suppliers submit them.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {quotations.map((quote) => (
            <div key={quote.id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-success">
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-md-3">
                    <span className="badge bg-light text-success border border-success px-3 py-1 rounded-pill mb-2">
                      Supplier Quote #{quote.id}
                    </span>
                    <h4 className="fw-bold text-success mb-1">
                      ${parseFloat(quote.quoted_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h4>
                    <small className="text-muted">Total Price Bid</small>
                  </div>

                  <div className="col-12 col-md-4">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-building me-2 text-primary"></i>
                      {quote.supplier_name}
                    </h6>
                    <p className="text-muted small mb-2">{quote.supplier_email}</p>
                    <div className="small text-secondary">
                      <i className="bi bi-truck me-1 text-primary"></i>
                      <strong>Est. Delivery:</strong> {quote.estimated_delivery_time}
                    </div>
                  </div>

                  <div className="col-12 col-md-5">
                    <h6 className="fw-bold text-secondary small mb-1">Supplier Note / Message:</h6>
                    <p className="text-dark bg-light p-3 rounded-3 small mb-0">
                      {quote.message || <em className="text-muted">No additional message provided.</em>}
                    </p>
                    <small className="text-muted d-block mt-2 text-end">
                      Submitted on: {new Date(quote.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RFQDetails;
