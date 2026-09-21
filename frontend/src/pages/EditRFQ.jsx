import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import rfqService from '../api/rfqService';

const EditRFQ = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    quantity: 1,
    delivery_location: '',
    deadline: '',
    status: 'OPEN',
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRFQDetail();
  }, [id]);

  const fetchRFQDetail = async () => {
    try {
      setLoading(true);
      setApiError('');
      const data = await rfqService.getRFQById(id);

      // Format ISO datetime string for datetime-local input (YYYY-MM-DDTHH:mm)
      let formattedDeadline = '';
      if (data.deadline) {
        const d = new Date(data.deadline);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        formattedDeadline = `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      setFormData({
        product_name: data.product_name || '',
        description: data.description || '',
        quantity: data.quantity || 1,
        delivery_location: data.delivery_location || '',
        deadline: formattedDeadline,
        status: data.status || 'OPEN',
      });
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to load RFQ details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product/Service name is required.';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0.';
    }
    if (!formData.delivery_location.trim()) {
      newErrors.delivery_location = 'Delivery location is required.';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline date & time is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
      };

      await rfqService.updateRFQ(id, payload);
      navigate('/buyer/rfqs', { state: { message: 'RFQ updated successfully!' } });
    } catch (err) {
      const errData = err.response?.data;
      if (errData) {
        if (typeof errData === 'string') {
          setApiError(errData);
        } else if (errData.detail) {
          setApiError(errData.detail);
        } else {
          setApiError('Please fix validation errors below.');
        }
      } else {
        setApiError('Failed to update RFQ.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading RFQ...</span>
        </div>
        <p className="text-muted mt-3">Loading RFQ details for edit...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="d-flex align-items-center mb-4">
            <Link to="/buyer/rfqs" className="btn btn-outline-secondary rounded-pill me-3">
              <i className="bi bi-arrow-left me-1"></i> Back to My RFQs
            </Link>
            <h2 className="fw-bold mb-0">Edit RFQ #{id}</h2>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-primary bg-gradient text-white p-4 border-0">
              <h5 className="fw-bold mb-1">Update Request Specifications</h5>
              <p className="mb-0 text-white-50">Modify product details, quantity, deadline, or status.</p>
            </div>

            <div className="card-body p-4 p-md-5 bg-white">
              {apiError && (
                <div className="alert alert-danger alert-dismissible fade show rounded-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {apiError}
                  <button type="button" className="btn-close" onClick={() => setApiError('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Status Toggle */}
                <div className="mb-4 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                  <div>
                    <label className="fw-semibold text-secondary mb-0">RFQ Status</label>
                    <p className="small text-muted mb-0">
                      {formData.status === 'OPEN'
                        ? 'Active and receiving supplier quotations.'
                        : 'Closed — no new supplier quotations allowed.'}
                    </p>
                  </div>
                  <select
                    name="status"
                    className={`form-select form-select-sm w-auto fw-bold ${
                      formData.status === 'OPEN' ? 'border-success text-success' : 'border-secondary text-secondary'
                    }`}
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* Product Name */}
                <div className="mb-4">
                  <label htmlFor="product_name" className="form-label fw-semibold text-secondary">
                    Product / Service Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="product_name"
                    name="product_name"
                    className={`form-control form-control-lg bg-light ${errors.product_name ? 'is-invalid' : ''}`}
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  {errors.product_name && <div className="invalid-feedback">{errors.product_name}</div>}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="form-label fw-semibold text-secondary">
                    Description & Specifications <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className={`form-control bg-light ${errors.description ? 'is-invalid' : ''}`}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  ></textarea>
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>

                {/* Quantity & Location */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label htmlFor="quantity" className="form-label fw-semibold text-secondary">
                      Quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      className={`form-control bg-light ${errors.quantity ? 'is-invalid' : ''}`}
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="delivery_location" className="form-label fw-semibold text-secondary">
                      Delivery Location <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="delivery_location"
                      name="delivery_location"
                      className={`form-control bg-light ${errors.delivery_location ? 'is-invalid' : ''}`}
                      value={formData.delivery_location}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.delivery_location && <div className="invalid-feedback">{errors.delivery_location}</div>}
                  </div>
                </div>

                {/* Deadline */}
                <div className="mb-4">
                  <label htmlFor="deadline" className="form-label fw-semibold text-secondary">
                    Quotation Deadline <span className="text-danger">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    name="deadline"
                    className={`form-control bg-light ${errors.deadline ? 'is-invalid' : ''}`}
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  {errors.deadline && <div className="invalid-feedback">{errors.deadline}</div>}
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-3 mt-4">
                  <Link to="/buyer/rfqs" className="btn btn-light px-4 py-2 rounded-3 fw-semibold">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary bg-gradient px-5 py-2 fw-bold rounded-3 shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRFQ;
