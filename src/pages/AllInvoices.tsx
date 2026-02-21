import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  getAllInvoices,
  deleteInvoice,
  AllInvoiceRecord,
  AllInvoicesPagination,
} from '../services/api';

export function AllInvoices() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<AllInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState<AllInvoicesPagination>({
    currentPage: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  // Get page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageLimit = 10;

  useEffect(() => {
    fetchInvoices(currentPage);
  }, [currentPage]);

  const fetchInvoices = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllInvoices(page, pageLimit);
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleInvoiceClick = (invoiceId: string) => {
    navigate(`/invoice/${invoiceId}`);
  };

  const handleDeleteClick = async (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        setDeleting(true);
        await deleteInvoice(invoiceId);
        setInvoices(invoices.filter((inv) => inv.invoice_id !== invoiceId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      } finally {
        setDeleting(false);
      }
    }
  };

  const goToPage = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => fetchInvoices(currentPage)}
          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">All Invoices</h2>
        <p className="text-slate-600 mt-1">
          Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
          {pagination.totalRecords} invoices
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No Invoices Found
          </h3>
          <p className="text-slate-600">There are no invoices to display</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Invoice Number
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Vendor
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                      Amount
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                      CGST
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                      SGST
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                      IGST
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                      Net Amount
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.invoice_id}
                      onClick={() => handleInvoiceClick(invoice.invoice_id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="font-semibold text-slate-800">
                            {invoice.invoice_number || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {invoice.vendor_name || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(invoice.invoice_date)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-slate-800">
                        {formatCurrency(invoice.total_amount || 0)}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-700">
                        {formatCurrency(invoice.cgst || 0)}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-700">
                        {formatCurrency(invoice.sgst || 0)}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-700">
                        {formatCurrency(invoice.igst || 0)}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-slate-800">
                        {formatCurrency(invoice.net_amount || 0)}
                      </td>
                      <td className="py-4 px-6 flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvoiceClick(invoice.invoice_id);
                          }}
                          className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                          title="View invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) =>
                            handleDeleteClick(e, invoice.invoice_id)
                          }
                          disabled={deleting}
                          className="text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Delete invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || loading}
                className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pagination.currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
