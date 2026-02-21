import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, ChevronRight, ArrowLeft } from 'lucide-react';
import { getVendorReport, VendorReport } from '../services/api';

export function Vendors() {
  const { year } = useParams<{ year: string }>();
  const [vendors, setVendors] = useState<VendorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (year) {
      fetchVendorReport();
    }
  }, [year]);

  const fetchVendorReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVendorReport(Number(year));
      setVendors(data.sort((a, b) => b.purchaseAmount - a.purchaseAmount));
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

  const handleVendorClick = (vendorName: string) => {
    navigate(`/invoices/${year}/${encodeURIComponent(vendorName)}`);
  };

  const handleBack = () => {
    navigate('/');
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
          Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchVendorReport}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalPurchase = vendors.reduce((sum, item) => sum + item.purchaseAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-slate-800">Vendors - {year}</h2>
        <p className="text-slate-600 mt-1">Vendor-wise purchase breakdown for {year}</p>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Store className="w-6 h-6" />
          <h3 className="text-lg font-medium">Total Purchase Amount</h3>
        </div>
        <p className="text-4xl font-bold">{formatCurrency(totalPurchase)}</p>
        <p className="text-emerald-100 mt-1">Across {vendors.length} vendors</p>
      </div>

      {vendors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Vendors Found</h3>
          <p className="text-slate-600">No purchase records for this year</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Vendor Name
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                    Purchase Amount
                  </th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    onClick={() => handleVendorClick(vendor._id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Store className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-slate-800">{vendor._id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-slate-800">
                      {formatCurrency(vendor.purchaseAmount)}
                    </td>
                    <td className="py-4 px-6">
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
