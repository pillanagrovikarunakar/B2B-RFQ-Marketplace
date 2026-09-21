import axiosClient from './axiosClient';

/**
 * Service encapsulating all Quotation API calls.
 */
export const quotationService = {
  // Fetch quotations for a specific RFQ
  async getRFQQuotations(rfqId) {
    const response = await axiosClient.get(`/rfqs/${rfqId}/quotations/`);
    return response.data;
  },

  // Fetch quotations submitted by the logged-in Supplier
  async getMyQuotations() {
    const response = await axiosClient.get('/quotations/my/');
    return response.data;
  },

  // Submit a quotation for a specific RFQ (SUPPLIER only)
  async submitQuotation(rfqId, payload) {
    const response = await axiosClient.post(`/rfqs/${rfqId}/quotations/`, payload);
    return response.data;
  },
};

export default quotationService;
