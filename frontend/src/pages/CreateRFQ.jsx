import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import rfqService from '../api/rfqService';

const CreateRFQ = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    quantity: 1,
    delivery_location: '',
    deadline: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    }));
    // Clear field-specific error
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
    } else {
      const selectedDeadline = new Date(formData.deadline);
      const now = new Date();
      if (selectedDeadline <= now) {
        newErrors.deadline = 'Deadline must be a future date & time.';
      }
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
      // Format deadline to ISO string
      const payload = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
        status: 'OPEN',
      };

      await rfqService.createRFQ(payload);
      navigate('/buyer/rfqs', { state: { message: 'RFQ created successfully!' } });
    } catch (err) {
      const errData = err.response?.data;
      if (errData) {
        if (typeof errData === 'string') {
          setApiError(errData);
        } else if (errData.detail) {
          setApiError(errData.detail);
        } else {
          // Format field error dictionary from backend
          const backendErrors = {};
          Object.keys(errData).forEach((key) => {
            if (Array.isArray(errData[key])) {
              backendErrors[key] = errData[key][0];
            } else {
              backendErrors[key] = errData[key];
            }
          });
          setErrors(backendErrors);
          setApiError('Please fix the validation errors below.');
        }
      } else {
        setApiError('Failed to create RFQ. Please check network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="d-flex align-items-center mb-4">
            <Link to="/buyer/rfqs" className="btn btn-outline-secondary rounded-pill me-3">
              <i className="bi bi-arrow-left me-1"></i> Back to My RFQs
            </Link>
            <h2 className="fw-bold mb-0">Create New RFQ</h2>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-primary bg-gradient text-white p-4 border-0">
              <h5 className="fw-bold mb-1">Request For Quotation Specifications</h5>
              <p className="mb-0 text-white-50">Provide details for suppliers to quote accurately.</p>
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
                    placeholder="e.g. Industrial Seamless Steel Pipes 50mm"
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
                    Detailed Specification & Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className={`form-control bg-light ${errors.description ? 'is-invalid' : ''}`}
                    placeholder="Provide full technical specifications, grade requirements, packaging preferences..."
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
                      Required Quantity <span className="text-danger">*</span>
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
                      Delivery Location / Destination <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="delivery_location"
                      name="delivery_location"
                      className={`form-control bg-light ${errors.delivery_location ? 'is-invalid' : ''}`}
                      placeholder="e.g. Warehouse 4, Chicago IL"
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
                    Quotation Submission Deadline <span className="text-danger">*</span>
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
                  <small className="text-muted d-block mt-1">
                    Suppliers will not be able to submit new quotes after this date.
                  </small>
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
                        Publishing RFQ...
                      </>
                    ) : (
                      'Publish RFQ'
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

export default CreateRFQ;
