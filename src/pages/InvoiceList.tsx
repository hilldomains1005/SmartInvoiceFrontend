import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, ArrowLeft, Calendar, Edit2, Trash2, X, Loader2, Plus } from 'lucide-react';
import { getInvoicesByVendorAndYear, deleteInvoice, updateInvoice, Invoice } from '../services/api';

export function InvoiceList() {
  const { year, vendor } = useParams<{ year: string; vendor: string }>();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // helper functions for safely mutating the invoice state without
  // worrying about `null` or creating unions that include `undefined`.
  const updateEditingInvoice = (changes: Partial<Invoice>) => {
    setEditingInvoice((prev) => (prev ? { ...prev, ...changes } : prev));
  };

  const updateItem = (
    idx: number,
    changes: Partial<Invoice['items'][0]>
  ) => {
    setEditingInvoice((prev) => {
      if (!prev) return prev;
      const items = [...prev.items];
      items[idx] = { ...items[idx], ...changes };
      return { ...prev, items };
    });
  };

  const updateTotals = (changes: Partial<Invoice['totals']>) => {
    setEditingInvoice((prev) =>
      prev ? { ...prev, totals: { ...prev.totals, ...changes } } : prev
    );
  };

  useEffect(() => {
    if (year && vendor) {
      fetchInvoices();
    }
  }, [year, vendor]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoicesByVendorAndYear(Number(year), vendor!);
      setInvoices(data.sort((a, b) => {
        const dateA = new Date(a.invoice_date || '');
        const dateB = new Date(b.invoice_date || '');
        return dateB.getTime() - dateA.getTime();
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
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

  const handleBack = () => {
    navigate(`/vendors/${year}`);
  };

  const handleEditClick = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    setEditingId(invoice._id || null);
    setEditingInvoice({ ...invoice });
  };

  const handleDeleteClick = async (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        setDeleting(true);
        await deleteInvoice(invoiceId);
        setInvoices(invoices.filter((inv) => inv._id !== invoiceId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingInvoice) return;
    try {
      setSaving(true);
      const updated = await updateInvoice(editingId, editingInvoice);
      setInvoices(invoices.map((inv) => (inv._id === editingId ? updated : inv)));
      setEditingId(null);
      setEditingInvoice(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseEdit = () => {
    setEditingId(null);
    setEditingInvoice(null);
  };

  const handleAddItem = () => {
    const emptyItem: Invoice['items'][0] = {
      barcode_number_hsn_sac: null,
      item_name: null,
      quantity: null,
      unit: null,
      rate_per_quantity: null,
      discount_percent: null,
      amount: null,
      sgst_percent: null,
      cgst_percent: null,
      igst_percent: null,
    };
    setEditingInvoice((prev) =>
      prev ? { ...prev, items: [...prev.items, emptyItem] } : prev
    );
  };

  const handleRemoveItem = (index: number) => {
    setEditingInvoice((prev) => {
      if (!prev || prev.items.length === 1) return prev;
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchInvoices}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totals.net_amount || 0), 0);

  return (
  <div>
    <div className="space-y-6">
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </button>
        <h2 className="text-3xl font-bold text-slate-800">{decodeURIComponent(vendor!)}</h2>
        <p className="text-slate-600 mt-1">Invoices for {year}</p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6" />
          <h3 className="text-lg font-medium">Total Purchase Amount</h3>
        </div>
        <p className="text-4xl font-bold">{formatCurrency(totalAmount)}</p>
        <p className="text-purple-100 mt-1">Across {invoices.length} invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Invoices Found</h3>
          <p className="text-slate-600">No records for this vendor in {year}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Invoice Number
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    onClick={() => handleInvoiceClick(invoice._id!)}
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
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(invoice.invoice_date)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-slate-800">
                      {formatCurrency(invoice.totals.net_amount || 0)}
                    </td>
                    <td className="py-4 px-6 flex justify-end gap-2">
                      <button
                        onClick={(e) => handleEditClick(e, invoice)}
                        className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                        title="Edit invoice"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, invoice._id!)}
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
      )}
    </div>

    {editingInvoice && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Edit Invoice</h2>
            <button
              onClick={handleCloseEdit}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={editingInvoice.invoice_number || ''}
                  onChange={(e) =>
                    updateEditingInvoice({ invoice_number: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={editingInvoice.invoice_date ? editingInvoice.invoice_date.split('T')[0] : ''}
                  onChange={(e) =>
                    updateEditingInvoice({ invoice_date: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={editingInvoice.vendor_name || ''}
                  onChange={(e) =>
                    updateEditingInvoice({ vendor_name: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  value={editingInvoice?.remarks || ''}
                  onChange={(e) =>
                    updateEditingInvoice({ remarks: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-800">Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {editingInvoice.items.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-700">Item {index + 1}</h4>
                      {editingInvoice.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.item_name || ''}
                          onChange={(e) => updateItem(index, { item_name: e.target.value || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          HSN/SAC Code
                        </label>
                        <input
                          type="text"
                          value={item.barcode_number_hsn_sac || ''}
                          onChange={(e) => updateItem(index, { barcode_number_hsn_sac: e.target.value || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, { quantity: parseFloat(e.target.value) || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Unit
                        </label>
                        <input
                          type="text"
                          value={item.unit || ''}
                          onChange={(e) => updateItem(index, { unit: e.target.value || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Rate per Quantity
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={item.rate_per_quantity || ''}
                          onChange={(e) => updateItem(index, { rate_per_quantity: parseFloat(e.target.value) || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Discount %
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={item.discount_percent || ''}
                          onChange={(e) => updateItem(index, { discount_percent: parseFloat(e.target.value) || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={item.amount || ''}
                          onChange={(e) => updateItem(index, { amount: parseFloat(e.target.value) || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          SGST %
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={item.sgst_percent || ''}
                          onChange={(e) => updateItem(index, { sgst_percent: parseFloat(e.target.value) || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          CGST %
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={item.cgst_percent || ''}
                          onChange={(e) => updateItem(index, { cgst_percent: parseFloat(e.target.value) || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          IGST %
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={item.igst_percent || ''}
                          onChange={(e) => updateItem(index, { igst_percent: parseFloat(e.target.value) || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Totals</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.total_quantity || ''}
                    onChange={(e) =>
                      updateTotals({ total_quantity: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.total_amount || ''}
                    onChange={(e) =>
                      updateTotals({ total_amount: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.total_discount_percent || ''}
                    onChange={(e) =>
                      updateTotals({ total_discount_percent: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.total_discount_amount || ''}
                    onChange={(e) =>
                      updateTotals({ total_discount_amount: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Freight Charges
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.freight_charges || ''}
                    onChange={(e) =>
                      updateTotals({ freight_charges: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Other Charges
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.total_other_charges || ''}
                    onChange={(e) =>
                      updateTotals({ total_other_charges: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Total SGST
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.total_sgst_amount || ''}
                    onChange={(e) =>
                      updateTotals({ total_sgst_amount: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Total CGST
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.total_cgst_amount || ''}
                    onChange={(e) =>
                      updateTotals({ total_cgst_amount: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Total IGST
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.total_igst_amount || ''}
                    onChange={(e) =>
                      updateTotals({ total_igst_amount: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Net Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingInvoice.totals.net_amount || ''}
                    onChange={(e) =>
                      updateTotals({ net_amount: parseFloat(e.target.value) || null })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 p-6">
            <button
              onClick={handleCloseEdit}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
