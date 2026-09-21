import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import rfqService from '../api/rfqService';
import quotationService from '../api/quotationService';

const BrowseRFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [quotedRfqIds, setQuotedRfqIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('OPEN');

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      setError('');
      const [rfqList, myQuotes] = await Promise.all([
        rfqService.getRFQs(),
        quotationService.getMyQuotations(),
      ]);

      setRfqs(rfqList);

      // Collect IDs of RFQs already quoted by this supplier
      const quotedIds = new Set(myQuotes.map((q) => q.rfq));
      setQuotedRfqIds(quotedIds);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load open RFQs.');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique delivery locations for filter dropdown
  const uniqueLocations = Array.from(
    new Set(rfqs.map((r) => r.delivery_location).filter(Boolean))
  );

  // Filter RFQs
  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesStatus = statusFilter === 'ALL' || rfq.status === statusFilter;
    const matchesLocation = locationFilter === 'ALL' || rfq.delivery_location === locationFilter;
    const matchesSearch =
      rfq.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesLocation && matchesSearch;
  });

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Browse RFQ Marketplace</h2>
          <p className="text-muted mb-0">Discover open buyer requests for quotations and submit competitive price bids.</p>
        </div>
        <Link to="/supplier/quotations" className="btn btn-outline-success rounded-pill px-4 py-2 fw-semibold">
          <i className="bi bi-card-checklist me-2"></i>My Submitted Quotes
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          {/* Search by Product Name */}
          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold text-secondary mb-1">Search Product / Service</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="e.g. Steel pipes, Generator, Cables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter by Location */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-secondary mb-1">Delivery Location</label>
            <select
              className="form-select bg-light"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="ALL">All Delivery Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="col-12 col-md-3">
            <label className="form-label small fw-semibold text-secondary mb-1">RFQ Status</label>
            <select
              className="form-select bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="OPEN">OPEN RFQs Only</option>
              <option value="ALL">All Statuses</option>
            </select>
          </div>
        </div>
      </div>

      {/* RFQ List Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading open RFQs...</span>
          </div>
          <p className="text-muted mt-3">Fetching open marketplace RFQs...</p>
        </div>
      ) : filteredRFQs.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <div className="card-body">
            <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h4 className="fw-bold">No RFQs Found</h4>
            <p className="text-muted mb-0">
              {searchQuery || locationFilter !== 'ALL'
                ? 'No open RFQs match your search and location filters.'
                : 'There are currently no open RFQs available in the marketplace.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredRFQs.map((rfq) => {
            const hasQuoted = quotedRfqIds.has(rfq.id);

            return (
              <div key={rfq.id} className="col-12 col-md-6 col-xl-4">
                <div className={`card border-0 shadow-sm rounded-4 h-100 p-3 bg-white ${hasQuoted ? 'border-start border-4 border-success' : ''}`}>
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold text-dark mb-0 text-truncate me-2" title={rfq.product_name}>
                          {rfq.product_name}
                        </h5>
                        <span className={`badge ${rfq.status === 'OPEN' ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                          {rfq.status}
                        </span>
                      </div>

                      {hasQuoted && (
                        <div className="mb-2">
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 small">
                            <i className="bi bi-check-circle-fill me-1"></i> Quote Submitted
                          </span>
                        </div>
                      )}

                      <p className="text-muted small mb-3 text-truncate-2" style={{ height: '2.8em', overflow: 'hidden' }}>
                        {rfq.description}
                      </p>

                      <div className="bg-light p-3 rounded-3 mb-3">
                        <div className="row g-2 text-secondary small">
                          <div className="col-6">
                            <i className="bi bi-box-seam me-1 text-success"></i>
                            <strong>Quantity:</strong> {rfq.quantity.toLocaleString()}
                          </div>
                          <div className="col-6">
                            <i className="bi bi-geo-alt me-1 text-danger"></i>
                            <strong>Location:</strong> {rfq.delivery_location}
                          </div>
                          <div className="col-12 mt-2">
                            <i className="bi bi-clock me-1 text-warning"></i>
                            <strong>Deadline:</strong> {new Date(rfq.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-top">
                      <Link
                        to={`/supplier/rfqs/${rfq.id}`}
                        className={`btn btn-sm w-100 rounded-pill fw-bold ${hasQuoted ? 'btn-outline-success' : 'btn-success bg-gradient text-white'}`}
                      >
                        {hasQuoted ? (
                          <>
                            <i className="bi bi-eye me-1"></i> View & Manage Quote
                          </>
                        ) : (
                          <>
                            <i className="bi bi-pencil-square me-1"></i> View Details & Quote
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseRFQs;
