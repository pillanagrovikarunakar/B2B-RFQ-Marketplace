import axiosClient from './axiosClient';

/**
 * Service encapsulating all RFQ API calls.
 */
export const rfqService = {
  // Fetch list of RFQs (BUYER sees own RFQs; SUPPLIER sees OPEN RFQs)
  async getRFQs() {
    const response = await axiosClient.get('/rfqs/');
    return response.data;
  },

  // Fetch RFQ detail by ID
  async getRFQById(id) {
    const response = await axiosClient.get(`/rfqs/${id}/`);
    return response.data;
  },

  // Create new RFQ (BUYER only)
  async createRFQ(payload) {
    const response = await axiosClient.post('/rfqs/', payload);
    return response.data;
  },

  // Update existing RFQ (BUYER only)
  async updateRFQ(id, payload) {
    const response = await axiosClient.put(`/rfqs/${id}/`, payload);
    return response.data;
  },

  // Partial update existing RFQ (BUYER only)
  async patchRFQ(id, payload) {
    const response = await axiosClient.patch(`/rfqs/${id}/`, payload);
    return response.data;
  },

  // Delete RFQ (BUYER only)
  async deleteRFQ(id) {
    const response = await axiosClient.delete(`/rfqs/${id}/`);
    return response.data;
  },
};

export default rfqService;
