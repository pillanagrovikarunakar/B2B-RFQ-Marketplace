import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import rfqService from '../api/rfqService';
import quotationService from '../api/quotationService';

const BuyerQuotations = () => {
  const [rfqs, setRfqs] = useState([]);
  const [quotationsMap, setQuotationsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllQuotations();
  }, []);

  const fetchAllQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      const rfqList = await rfqService.getRFQs();
      setRfqs(rfqList);

      // Fetch quotations for each RFQ in parallel
      const map = {};
      await Promise.all(
        rfqList.map(async (rfq) => {
          try {
            const quotes = await quotationService.getRFQQuotations(rfq.id);
            map[rfq.id] = quotes;
          } catch (e) {
            map[rfq.id] = [];
          }
        })
      );

      setQuotationsMap(map);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load received quotations.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading quotations...</span>
        </div>
        <p className="text-muted mt-3">Fetching received quotations across your RFQs...</p>
      </div>
    );
  }

  // Calculate total quotes
  const allQuotations = Object.values(quotationsMap).flat();

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Received Quotations Summary</h2>
          <p className="text-muted mb-0">Overview of all supplier bids submitted for your RFQs.</p>
        </div>
        <Link to="/buyer/rfqs" className="btn btn-outline-secondary rounded-pill px-4">
          <i className="bi bi-arrow-left me-1"></i> Back to My RFQs
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {allQuotations.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <div className="card-body">
            <i className="bi bi-chat-quote fs-1 text-muted mb-3 d-block"></i>
            <h4 className="fw-bold">No Quotations Received</h4>
            <p className="text-muted mb-4">
              None of your RFQs have received supplier quotations yet.
            </p>
            <Link to="/buyer/rfqs/new" className="btn btn-primary rounded-pill px-4">
              Create New RFQ
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {rfqs.map((rfq) => {
            const quotes = quotationsMap[rfq.id] || [];
            if (quotes.length === 0) return null;

            return (
              <div key={rfq.id} className="col-12">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-3 gap-2">
                    <div>
                      <span className="badge bg-light text-primary border border-primary px-3 py-1 rounded-pill mb-1">
                        RFQ #{rfq.id}
                      </span>
                      <h4 className="fw-bold text-dark mb-0">{rfq.product_name}</h4>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge bg-success rounded-pill px-3 py-2">
                        {quotes.length} {quotes.length === 1 ? 'Quote Received' : 'Quotes Received'}
                      </span>
                      <Link to={`/buyer/rfqs/${rfq.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                        View RFQ & Quotes →
                      </Link>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Supplier Name</th>
                          <th>Email</th>
                          <th>Quoted Price</th>
                          <th>Est. Delivery Time</th>
                          <th>Submitted Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map((q) => (
                          <tr key={q.id}>
                            <td className="fw-semibold text-dark">{q.supplier_name}</td>
                            <td className="text-muted small">{q.supplier_email}</td>
                            <td className="fw-bold text-success">
                              ${parseFloat(q.quoted_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td>{q.estimated_delivery_time}</td>
                            <td className="small text-muted">{new Date(q.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default BuyerQuotations;
