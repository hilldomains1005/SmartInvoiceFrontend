import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Store,
  FileText,
  Package,
  DollarSign,
} from 'lucide-react';
import { getInvoiceById, Invoice } from '../services/api';

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoiceById(id!);
      setInvoice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-';
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

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Invoice not found'}</p>
          <button
            onClick={fetchInvoice}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h2 className="text-3xl font-bold text-slate-800">Invoice Details</h2>
        <p className="text-slate-600 mt-1">{invoice.invoice_number || 'No invoice number'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-600">Invoice Number</span>
          </div>
          <p className="text-xl font-semibold text-slate-800">
            {invoice.invoice_number || '-'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-600">Invoice Date</span>
          </div>
          <p className="text-xl font-semibold text-slate-800">
            {formatDate(invoice.invoice_date)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-slate-600">Vendor</span>
          </div>
          <p className="text-xl font-semibold text-slate-800">
            {invoice.vendor_name || '-'}
          </p>
        </div>
      </div>

      {invoice.remarks && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-1">Remarks</h3>
          <p className="text-amber-800">{invoice.remarks}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-800">Items</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">
                  Item Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">
                  HSN/SAC
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700">
                  Qty
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700">
                  Rate
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700">
                  Discount %
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700">
                  Amount
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700">
                  SGST
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700">
                  CGST
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700">
                  IGST
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-800">{item.item_name || '-'}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {item.barcode_number_hsn_sac || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-slate-800">
                    {item.quantity || '-'} {item.unit || ''}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-slate-800">
                    {formatCurrency(item.rate_per_quantity)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600">
                    {item.discount_percent ? `${item.discount_percent}%` : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-slate-800">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600">
                    {item.sgst_percent ? `${item.sgst_percent}%` : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600">
                    {item.cgst_percent ? `${item.cgst_percent}%` : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-slate-600">
                    {item.igst_percent ? `${item.igst_percent}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Total Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300">Total Quantity:</span>
              <span className="font-medium">{invoice.totals.total_quantity || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Total Amount:</span>
              <span className="font-medium">{formatCurrency(invoice.totals.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Discount:</span>
              <span className="font-medium">
                {formatCurrency(invoice.totals.total_discount_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Freight Charges:</span>
              <span className="font-medium">{formatCurrency(invoice.totals.freight_charges)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Other Charges:</span>
              <span className="font-medium">{formatCurrency(invoice.totals.total_other_charges)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300">SGST:</span>
              <span className="font-medium">{formatCurrency(invoice.totals.total_sgst_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">CGST:</span>
              <span className="font-medium">{formatCurrency(invoice.totals.total_cgst_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">IGST:</span>
              <span className="font-medium">{formatCurrency(invoice.totals.total_igst_amount)}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-600">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Net Amount:</span>
            <span className="text-3xl font-bold">{formatCurrency(invoice.totals.net_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
