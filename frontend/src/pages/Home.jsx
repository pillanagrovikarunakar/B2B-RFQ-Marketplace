import React from 'react';

const Home = () => {
  return (
    <div className="container my-5 text-center">
      <div className="p-5 mb-4 bg-light rounded-3 border shadow-sm">
        <h1 className="display-5 fw-bold text-primary">Mini B2B RFQ Marketplace</h1>
        <p className="lead col-md-8 mx-auto mt-3 text-secondary">
          A platform connecting Buyers to post RFQs and Suppliers to submit competitive quotes seamlessly.
        </p>
        <hr className="my-4" />
        <p className="text-muted">Phase 1 Setup Completed Successfully!</p>
      </div>
    </div>
  );
};

export default Home;
