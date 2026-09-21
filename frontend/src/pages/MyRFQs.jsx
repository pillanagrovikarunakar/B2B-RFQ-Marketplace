import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import rfqService from '../api/rfqService';

const MyRFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear location state message
      window.history.replaceState({}, document.title);
    }
    fetchRFQs();
  }, [location.state]);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await rfqService.getRFQs();
      setRfqs(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your RFQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRFQ = async (id) => {
    if (!window.confirm('Are you sure you want to close this RFQ? Suppliers will no longer be able to submit quotations.')) {
      return;
    }

    try {
      setActionLoadingId(id);
      await rfqService.patchRFQ(id, { status: 'CLOSED' });
      setSuccessMessage('RFQ status updated to CLOSED.');
      fetchRFQs();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to close RFQ.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteRFQ = async (id) => {
    if (!window.confirm('Are you sure you want to delete this RFQ? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoadingId(id);
      await rfqService.deleteRFQ(id);
      setSuccessMessage('RFQ deleted successfully.');
      setRfqs((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete RFQ.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtering
  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesStatus = filterStatus === 'ALL' || rfq.status === filterStatus;
    const matchesSearch =
      rfq.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.delivery_location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">My RFQs</h2>
          <p className="text-muted mb-0">Manage all Request for Quotations you have posted.</p>
        </div>
        <div>
          <Link to="/buyer/rfqs/new" className="btn btn-primary bg-gradient rounded-pill px-4 py-2 fw-bold shadow-sm">
            <i className="bi bi-plus-lg me-2"></i>Create New RFQ
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show rounded-3" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('ALL')}
              >
                All RFQs ({rfqs.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === 'OPEN' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('OPEN')}
              >
                Open ({rfqs.filter((r) => r.status === 'OPEN').length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterStatus === 'CLOSED' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('CLOSED')}
              >
                Closed ({rfqs.filter((r) => r.status === 'CLOSED').length})
              </button>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search by product or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading RFQs...</span>
          </div>
          <p className="text-muted mt-3">Loading your RFQs...</p>
        </div>
      ) : filteredRFQs.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <div className="card-body">
            <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
            <h4 className="fw-bold">No RFQs Found</h4>
            <p className="text-muted mb-4">
              {searchQuery || filterStatus !== 'ALL'
                ? 'No RFQs match your current filter criteria.'
                : 'You have not created any RFQs yet.'}
            </p>
            <Link to="/buyer/rfqs/new" className="btn btn-primary rounded-pill px-4 py-2">
              <i className="bi bi-plus-circle me-2"></i>Create Your First RFQ
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredRFQs.map((rfq) => (
            <div key={rfq.id} className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold text-dark mb-0 me-2">{rfq.product_name}</h5>
                      <span
                        className={`badge ${
                          rfq.status === 'OPEN' ? 'bg-success' : 'bg-secondary'
                        } px-3 py-2 rounded-pill`}
                      >
                        {rfq.status}
                      </span>
                    </div>

                    <p className="text-muted small mb-3 text-truncate" style={{ maxHeight: '2.8em' }}>
                      {rfq.description}
                    </p>

                    <div className="bg-light p-3 rounded-3 mb-3">
                      <div className="row g-2 text-secondary small">
                        <div className="col-6">
                          <i className="bi bi-box-seam me-1 text-primary"></i>
                          <strong>Qty:</strong> {rfq.quantity.toLocaleString()}
                        </div>
                        <div className="col-6">
                          <i className="bi bi-geo-alt me-1 text-primary"></i>
                          <strong>Location:</strong> {rfq.delivery_location}
                        </div>
                        <div className="col-12 mt-2">
                          <i className="bi bi-calendar-event me-1 text-primary"></i>
                          <strong>Deadline:</strong> {new Date(rfq.deadline).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
                    <Link
                      to={`/buyer/rfqs/${rfq.id}`}
                      className="btn btn-sm btn-primary rounded-pill px-3"
                    >
                      <i className="bi bi-eye me-1"></i> View Details
                    </Link>

                    <div className="d-flex gap-2">
                      <Link
                        to={`/buyer/rfqs/${rfq.id}/edit`}
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      >
                        <i className="bi bi-pencil me-1"></i> Edit
                      </Link>

                      {rfq.status === 'OPEN' && (
                        <button
                          onClick={() => handleCloseRFQ(rfq.id)}
                          className="btn btn-sm btn-outline-warning rounded-pill px-3"
                          disabled={actionLoadingId === rfq.id}
                        >
                          <i className="bi bi-lock me-1"></i> Close
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteRFQ(rfq.id)}
                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        disabled={actionLoadingId === rfq.id}
                      >
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    </div>
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

export default MyRFQs;
