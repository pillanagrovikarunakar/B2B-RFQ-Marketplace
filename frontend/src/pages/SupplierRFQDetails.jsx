import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import rfqService from '../api/rfqService';
import quotationService from '../api/quotationService';

const SupplierRFQDetails = () => {
  const { id } = useParams();

  const [rfq, setRfq] = useState(null);
  const [existingQuote, setExistingQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    quoted_price: '',
    estimated_delivery_time: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRFQAndQuoteData();
  }, [id]);

  const fetchRFQAndQuoteData = async () => {
    try {
      setLoading(true);
      setError('');
      const [rfqData, quotesData] = await Promise.all([
        rfqService.getRFQById(id),
        quotationService.getRFQQuotations(id),
      ]);

      setRfq(rfqData);

      // Check if supplier already submitted a quote for this RFQ
      if (quotesData && quotesData.length > 0) {
        setExistingQuote(quotesData[0]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load RFQ specifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    const priceNum = parseFloat(formData.quoted_price);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.quoted_price = 'Quoted price must be greater than 0.';
    }

    if (!formData.estimated_delivery_time.trim()) {
      errors.estimated_delivery_time = 'Estimated delivery time is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    if (rfq?.status === 'CLOSED') {
      setSubmitError('Quotations cannot be submitted for a closed RFQ.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        quoted_price: parseFloat(formData.quoted_price).toFixed(2),
        estimated_delivery_time: formData.estimated_delivery_time.trim(),
        message: formData.message.trim(),
      };

      const newQuote = await quotationService.submitQuotation(id, payload);
      setSuccessMessage('Quotation submitted successfully!');
      setExistingQuote(newQuote);
    } catch (err) {
      const errData = err.response?.data;
      if (errData) {
        if (typeof errData === 'string') {
          setSubmitError(errData);
        } else if (errData.detail) {
          setSubmitError(errData.detail);
        } else if (errData.non_field_errors) {
          setSubmitError(errData.non_field_errors[0]);
        } else {
          setSubmitError('Failed to submit quotation. Please check form inputs.');
        }
      } else {
        setSubmitError('Network error while submitting quotation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading details...</span>
        </div>
        <p className="text-muted mt-3">Loading RFQ specifications...</p>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger rounded-4 p-4 text-center" role="alert">
          <i className="bi bi-exclamation-octagon fs-1 d-block mb-2"></i>
          <h4>{error || 'RFQ Not Found'}</h4>
          <p className="mb-3">The requested RFQ could not be found or is unavailable.</p>
          <Link to="/supplier/rfqs" className="btn btn-outline-danger rounded-pill px-4">
            Return to Marketplace
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
          <Link to="/supplier/rfqs" className="btn btn-outline-secondary rounded-pill btn-sm mb-2">
            <i className="bi bi-arrow-left me-1"></i> Back to Marketplace
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
      </div>

      <div className="row g-4">
        {/* Left Side: RFQ Specifications */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
            <div className="card-header bg-success bg-gradient text-white p-4 border-0">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-file-earmark-text me-2"></i>Buyer RFQ Specifications
              </h5>
            </div>

            <div className="card-body p-4">
              <div className="mb-4">
                <h6 className="fw-bold text-secondary text-uppercase mb-2">Scope of Work / Description</h6>
                <p className="text-dark bg-light p-3 rounded-3 mb-0" style={{ whiteSpace: 'pre-line' }}>
                  {rfq.description}
                </p>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3">
                    <span className="text-muted d-block small mb-1">Required Quantity</span>
                    <span className="fw-bold fs-5 text-success">
                      <i className="bi bi-box-seam me-2"></i>
                      {rfq.quantity.toLocaleString()} units
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 bg-light rounded-3">
                    <span className="text-muted d-block small mb-1">Destination</span>
                    <span className="fw-bold fs-6 text-dark">
                      <i className="bi bi-geo-alt me-2 text-danger"></i>
                      {rfq.delivery_location}
                    </span>
                  </div>
                </div>

                <div className="col-12">
                  <div className="p-3 bg-light rounded-3">
                    <span className="text-muted d-block small mb-1">Submission Deadline</span>
                    <span className="fw-bold fs-6 text-dark">
                      <i className="bi bi-calendar-check me-2 text-warning"></i>
                      {new Date(rfq.deadline).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-3 bg-light-subtle">
                <small className="text-muted d-block">
                  <strong>Posted by Buyer:</strong> {rfq.buyer_name || 'Buyer'} ({rfq.buyer_email})
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quotation Form or Submitted Quotation View */}
        <div className="col-12 col-lg-5">
          {existingQuote ? (
            /* Case 1: Supplier has already submitted a quote */
            <div className="card border-0 shadow-sm rounded-4 bg-white border-start border-4 border-success p-4 h-100">
              <div className="card-body">
                <div className="mb-3 text-center">
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fs-6 mb-2">
                    <i className="bi bi-check-circle-fill me-1"></i> Quotation Submitted
                  </span>
                  <p className="text-muted small">You have already submitted a price bid for this RFQ.</p>
                </div>

                <hr className="my-3 text-muted" />

                <div className="mb-3">
                  <span className="text-muted small d-block">Quoted Total Price</span>
                  <h3 className="fw-bold text-success mb-0">
                    ${parseFloat(existingQuote.quoted_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>

                <div className="mb-3">
                  <span className="text-muted small d-block">Estimated Delivery Time</span>
                  <span className="fw-semibold text-dark fs-6">
                    <i className="bi bi-truck me-2 text-primary"></i>
                    {existingQuote.estimated_delivery_time}
                  </span>
                </div>

                <div className="mb-3">
                  <span className="text-muted small d-block mb-1">Notes / Message to Buyer</span>
                  <p className="text-dark bg-light p-3 rounded-3 small mb-0">
                    {existingQuote.message || <em className="text-muted">No message provided.</em>}
                  </p>
                </div>

                <small className="text-muted d-block text-end mt-4">
                  Submitted: {new Date(existingQuote.created_at).toLocaleString()}
                </small>
              </div>
            </div>
          ) : rfq.status === 'CLOSED' ? (
            /* Case 2: RFQ is CLOSED */
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 text-center h-100 justify-content-center">
              <div className="card-body">
                <i className="bi bi-lock fs-1 text-secondary mb-3 d-block"></i>
                <h5 className="fw-bold text-secondary">RFQ is Closed</h5>
                <p className="text-muted mb-0">
                  The buyer has closed this RFQ. New quotations are no longer accepted for this request.
                </p>
              </div>
            </div>
          ) : (
            /* Case 3: Submit Quotation Form */
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
              <div className="card-header bg-success bg-gradient text-white p-4 border-0">
                <h5 className="fw-bold mb-1">Submit Supplier Quotation</h5>
                <p className="mb-0 text-white-50">Provide your price bid and delivery commitment.</p>
              </div>

              <div className="card-body p-4">
                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show rounded-3 mb-3" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {successMessage}
                  </div>
                )}

                {submitError && (
                  <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {submitError}
                    <button type="button" className="btn-close" onClick={() => setSubmitError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmitQuote} noValidate>
                  {/* Quoted Price */}
                  <div className="mb-3">
                    <label htmlFor="quoted_price" className="form-label fw-semibold text-secondary">
                      Quoted Total Price ($) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 fw-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        id="quoted_price"
                        name="quoted_price"
                        className={`form-control bg-light border-start-0 ${formErrors.quoted_price ? 'is-invalid' : ''}`}
                        placeholder="e.g. 4500.00"
                        value={formData.quoted_price}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.quoted_price && <div className="text-danger small mt-1">{formErrors.quoted_price}</div>}
                  </div>

                  {/* Delivery Time */}
                  <div className="mb-3">
                    <label htmlFor="estimated_delivery_time" className="form-label fw-semibold text-secondary">
                      Estimated Delivery Time <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="estimated_delivery_time"
                      name="estimated_delivery_time"
                      className={`form-control bg-light ${formErrors.estimated_delivery_time ? 'is-invalid' : ''}`}
                      placeholder="e.g. 5 business days, 2 weeks..."
                      value={formData.estimated_delivery_time}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                    {formErrors.estimated_delivery_time && (
                      <div className="invalid-feedback">{formErrors.estimated_delivery_time}</div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <label htmlFor="message" className="form-label fw-semibold text-secondary">
                      Message / Notes to Buyer <span className="text-muted">(Optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="3"
                      className="form-control bg-light"
                      placeholder="Include details about shipping, warranties, or payment terms..."
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success bg-gradient w-100 py-3 fw-bold rounded-3 shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting Quotation...
                      </>
                    ) : (
                      'Submit Quotation'
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierRFQDetails;
