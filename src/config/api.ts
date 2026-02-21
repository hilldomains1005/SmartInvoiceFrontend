const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/upload`,
  INVOICES: `${API_BASE_URL}/invoice`,
  REPORT_YEARLY: `${API_BASE_URL}/reports/yearly`,
  REPORT_VENDORS: `${API_BASE_URL}/reports/vendors`,
  EXPORT: `${API_BASE_URL}/export`,
  EXPORT_EXCEL: `${API_BASE_URL}/export/excel`,
};
