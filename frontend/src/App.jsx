import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Buyer Pages
import BuyerDashboard from './pages/BuyerDashboard';
import MyRFQs from './pages/MyRFQs';
import CreateRFQ from './pages/CreateRFQ';
import EditRFQ from './pages/EditRFQ';
import RFQDetails from './pages/RFQDetails';
import BuyerQuotations from './pages/BuyerQuotations';

// Supplier Pages
import SupplierDashboard from './pages/SupplierDashboard';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Buyer Routes */}
              <Route
                path="/buyer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/rfqs"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <MyRFQs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/rfqs/new"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <CreateRFQ />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/rfqs/:id"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <RFQDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/rfqs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <EditRFQ />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/quotations"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <BuyerQuotations />
                  </ProtectedRoute>
                }
              />

              {/* Protected Supplier Routes */}
              <Route
                path="/supplier/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SUPPLIER']}>
                    <SupplierDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
