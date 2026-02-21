import { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Loader2 } from 'lucide-react';
import { uploadBill, createInvoice, Invoice, InvoiceItem } from '../services/api';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddInvoiceModal({ isOpen, onClose, onSuccess }: AddInvoiceModalProps) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Invoice>({
    invoice_number: null,
    invoice_date: null,
    vendor_name: null,
    remarks: null,
    items: [createEmptyItem()],
    totals: {
      total_quantity: null,
      total_amount: null,
      total_discount_percent: null,
      total_discount_amount: null,
      freight_charges: null,
      total_other_charges: null,
      total_sgst_amount: null,
      total_cgst_amount: null,
      total_igst_amount: null,
      net_amount: null,
    },
  });

  function createEmptyItem(): InvoiceItem {
    return {
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
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const data = await uploadBill(file);
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload bill');
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, createEmptyItem()],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value === '' ? null : value,
    };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await createInvoice(formData);
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_number: null,
      invoice_date: null,
      vendor_name: null,
      remarks: null,
      items: [createEmptyItem()],
      totals: {
        total_quantity: null,
        total_amount: null,
        total_discount_percent: null,
        total_discount_amount: null,
        freight_charges: null,
        total_other_charges: null,
        total_sgst_amount: null,
        total_cgst_amount: null,
        total_igst_amount: null,
        net_amount: null,
      },
    });
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Add Invoice</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Bill (Image/PDF)
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Choose File
                  </>
                )}
              </button>
              <span className="text-sm text-slate-600">
                Upload a bill to auto-fill the form
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoice_number || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_number: e.target.value || null })
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
                  value={formData.invoice_date || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_date: e.target.value || null })
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
                  value={formData.vendor_name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor_name: e.target.value || null })
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
                  value={formData.remarks || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value || null })
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
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-700">Item {index + 1}</h4>
                      {formData.items.length > 1 && (
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
                          onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
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
                          onChange={(e) =>
                            handleItemChange(index, 'barcode_number_hsn_sac', e.target.value)
                          }
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
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', parseFloat(e.target.value))
                          }
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
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
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
                          onChange={(e) =>
                            handleItemChange(index, 'rate_per_quantity', parseFloat(e.target.value))
                          }
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
                          onChange={(e) =>
                            handleItemChange(index, 'amount', parseFloat(e.target.value))
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
                          value={item.discount_percent || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'discount_percent', parseFloat(e.target.value))
                          }
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
                          onChange={(e) =>
                            handleItemChange(index, 'sgst_percent', parseFloat(e.target.value))
                          }
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
                          onChange={(e) =>
                            handleItemChange(index, 'cgst_percent', parseFloat(e.target.value))
                          }
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
                          onChange={(e) =>
                            handleItemChange(index, 'igst_percent', parseFloat(e.target.value))
                          }
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
                    value={formData.totals.total_quantity || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totals: {
                          ...formData.totals,
                          total_quantity: parseFloat(e.target.value) || null,
                        },
                      })
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
                    value={formData.totals.total_amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totals: {
                          ...formData.totals,
                          total_amount: parseFloat(e.target.value) || null,
                        },
                      })
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
                    value={formData.totals.total_discount_amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totals: {
                          ...formData.totals,
                          total_discount_amount: parseFloat(e.target.value) || null,
                        },
                      })
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
                    value={formData.totals.freight_charges || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totals: {
                          ...formData.totals,
                          freight_charges: parseFloat(e.target.value) || null,
                        },
                      })
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
                    value={formData.totals.total_other_charges || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totals: {
                          ...formData.totals,
                          total_other_charges: parseFloat(e.target.value) || null,
                        },
                      })
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
                    value={formData.totals.total_sgst_amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totals: {
                          ...formData.totals,
                          total_sgst_amount: parseFloat(e.target.value) || null,
                        },
                      })
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
                    value={formData.totals.total_cgst_amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totals: {
                          ...formData.totals,
                          total_cgst_amount: parseFloat(e.target.value) || null,
                        },
                      })
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
                    value={formData.totals.total_igst_amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totals: {
                          ...formData.totals,
                          total_igst_amount: parseFloat(e.target.value) || null,
                        },
                      })
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
                    value={formData.totals.net_amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totals: {
                          ...formData.totals,
                          net_amount: parseFloat(e.target.value) || null,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Invoice'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
