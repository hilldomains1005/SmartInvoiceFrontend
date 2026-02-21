import { API_ENDPOINTS } from '../config/api';
import { authService } from './authService';

export interface InvoiceItem {
  barcode_number_hsn_sac: string | null;
  item_name: string | null;
  quantity: number | null;
  unit: string | null;
  rate_per_quantity: number | null;
  discount_percent: number | null;
  amount: number | null;
  sgst_percent: number | null;
  cgst_percent: number | null;
  igst_percent: number | null;
}

export interface InvoiceTotals {
  total_quantity: number | null;
  total_amount: number | null;
  total_discount_percent: number | null;
  total_discount_amount: number | null;
  freight_charges: number | null;
  total_other_charges: number | null;
  total_sgst_amount: number | null;
  total_cgst_amount: number | null;
  total_igst_amount: number | null;
  net_amount: number | null;
}

export interface Invoice {
  _id?: string;
  invoice_number: string | null;
  invoice_date: string | null;
  vendor_name: string | null;
  remarks: string | null;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  year?: number;
  createdAt?: string;
}

export interface YearlyReport {
  _id: number;
  purchaseAmount: number;
}

export interface VendorReport {
  _id: string;
  purchaseAmount: number;
}

export const uploadBill = async (file: File): Promise<Invoice> => {
  const formData = new FormData();
  formData.append('bill', file);

  const response = await fetch(API_ENDPOINTS.UPLOAD, {
    method: 'POST',
    headers: authService.getAuthHeadersForFormData(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload bill');
  }

  return response.json();
};

export const createInvoice = async (invoice: Invoice): Promise<Invoice> => {
  const response = await fetch(API_ENDPOINTS.INVOICES, {
    method: 'POST',
    headers: authService.getAuthHeaders(),
    body: JSON.stringify(invoice),
  });

  if (!response.ok) {
    throw new Error('Failed to create invoice');
  }

  return response.json();
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await fetch(`${API_ENDPOINTS.INVOICES}/${id}`, {
    headers: authService.getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoice');
  }

  return response.json();
};

export const updateInvoice = async (id: string, invoice: Invoice): Promise<Invoice> => {
  const response = await fetch(`${API_ENDPOINTS.INVOICES}/${id}`, {
    method: 'PUT',
    headers: authService.getAuthHeaders(),
    body: JSON.stringify(invoice),
  });

  if (!response.ok) {
    throw new Error('Failed to update invoice');
  }

  return response.json();
};

export const deleteInvoice = async (id: string): Promise<{ success: boolean; deleted: boolean }> => {
  const response = await fetch(`${API_ENDPOINTS.INVOICES}/${id}`, {
    method: 'DELETE',
    headers: authService.getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete invoice');
  }

  return response.json();
};

export const getYearlyReport = async (): Promise<YearlyReport[]> => {
  const response = await fetch(API_ENDPOINTS.REPORT_YEARLY, {
    headers: authService.getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch yearly report');
  }

  return response.json();
};

export const getVendorReport = async (year: number): Promise<VendorReport[]> => {
  const response = await fetch(`${API_ENDPOINTS.REPORT_VENDORS}?year=${year}`, {
    headers: authService.getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vendor report');
  }

  return response.json();
};

export const getInvoicesByVendorAndYear = async (
  year: number,
  vendor: string
): Promise<Invoice[]> => {
  const response = await fetch(
    `${API_ENDPOINTS.INVOICES}/search?year=${year}&vendor=${encodeURIComponent(vendor)}`,
    {
      headers: authService.getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return response.json();
};

export interface AllInvoiceRecord {
  invoice_id: string;
  invoice_number: string | null;
  invoice_date: string | null;
  vendor_name: string | null;
  total_amount: number | null;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  other_charges: number | null;
  net_amount: number | null;
}

export interface AllInvoicesPagination {
  currentPage: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface AllInvoicesResponse {
  data: AllInvoiceRecord[];
  pagination: AllInvoicesPagination;
}

export const getAllInvoices = async (
  page: number = 1,
  limit: number = 10
): Promise<AllInvoicesResponse> => {
  const response = await fetch(
    `${API_ENDPOINTS.INVOICES}/all?page=${page}&limit=${limit}`,
    {
      headers: authService.getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return response.json();
};

export const exportYearlySummary = async (): Promise<void> => {
  const response = await fetch(`${API_ENDPOINTS.EXPORT}/yearly`, {
    headers: authService.getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to export yearly summary');
  }

  const blob = await response.blob();
  downloadFile(blob, 'invoices-yearly.xlsx');
};

export const exportByYearAndVendor = async (year: number, vendor: string): Promise<void> => {
  const response = await fetch(
    `${API_ENDPOINTS.EXPORT}/by-year-vendor?year=${year}&vendor=${encodeURIComponent(vendor)}`,
    {
      headers: authService.getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export invoices');
  }

  const blob = await response.blob();
  downloadFile(blob, `invoices-${year}-${vendor}.xlsx`);
};

export const exportInvoiceDetails = async (id: string): Promise<void> => {
  const response = await fetch(`${API_ENDPOINTS.EXPORT}/details/${id}`, {
    headers: authService.getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to export invoice details');
  }

  const blob = await response.blob();
  downloadFile(blob, `invoice-${id}.xlsx`);
};

export const exportAllInvoicesSummary = async (): Promise<void> => {
  const response = await fetch(`${API_ENDPOINTS.EXPORT}/all-summary`, {
    headers: authService.getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to export invoices');
  }

  const blob = await response.blob();
  downloadFile(blob, 'invoices-all.xlsx');
};

const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportToExcel = async (): Promise<void> => {
  const response = await fetch(API_ENDPOINTS.EXPORT_EXCEL, {
    headers: authService.getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to export to Excel');
  }

  const blob = await response.blob();
  downloadFile(blob, 'invoices.xlsx');
};
