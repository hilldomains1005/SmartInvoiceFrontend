import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { AddInvoiceModal } from './components/AddInvoiceModal';
import { Dashboard } from './pages/Dashboard';
import { Vendors } from './pages/Vendors';
import { InvoiceList } from './pages/InvoiceList';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { AllInvoices } from './pages/AllInvoices';
import { Login } from './pages/Login';
import {
  exportYearlySummary,
  exportByYearAndVendor,
  exportInvoiceDetails,
  exportAllInvoicesSummary,
  exportToExcel
} from './services/api';

function AppContent() {
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();

  const handleAddInvoice = () => {
    setIsAddInvoiceModalOpen(true);
  };

  const handleInvoiceSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleExport = async () => {
    try {
      const pathname = location.pathname;

      // Dashboard - export yearly summary
      if (pathname === '/') {
        await exportYearlySummary();
      }
      // AllInvoices - export all invoices summary
      else if (pathname === '/all-invoices') {
        await exportAllInvoicesSummary();
      }
      // InvoiceDetail - export invoice details by ID
      else if (pathname.startsWith('/invoice/')) {
        const id = pathname.split('/').pop();
        if (id) {
          await exportInvoiceDetails(id);
        }
      }
      // InvoiceList - export by year and vendor
      else if (pathname.includes('/invoices/')) {
        const match = pathname.match(/\/invoices\/(\d+)\/(.+)$/);
        if (match) {
          const year = parseInt(match[1], 10);
          const vendor = decodeURIComponent(match[2]);
          await exportByYearAndVendor(year, vendor);
        }
      }
      // Vendors page - no export (or export yearly as fallback)
      else if (pathname.includes('/vendors/')) {
        await exportToExcel();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  return (
    <>
      <Layout onAddInvoice={handleAddInvoice} onExport={handleExport}>
        <Routes key={refreshKey}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/all-invoices" element={<AllInvoices />} />
          <Route path="/vendors/:year" element={<Vendors />} />
          <Route path="/invoices/:year/:vendor" element={<InvoiceList />} />
          <Route path="/invoice/:id" element={<InvoiceDetail />} />
        </Routes>
      </Layout>

      <AddInvoiceModal
        isOpen={isAddInvoiceModalOpen}
        onClose={() => setIsAddInvoiceModalOpen(false)}
        onSuccess={handleInvoiceSuccess}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
