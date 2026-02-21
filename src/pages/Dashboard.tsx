import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { getYearlyReport, YearlyReport } from '../services/api';

export function Dashboard() {
  const [yearlyData, setYearlyData] = useState<YearlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchYearlyReport();
  }, []);

  const fetchYearlyReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getYearlyReport();
      setYearlyData(data.sort((a, b) => b._id - a._id));
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

  const handleYearClick = (year: number) => {
    navigate(`/vendors/${year}`);
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchYearlyReport}
          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalPurchase = yearlyData.reduce((sum, item) => sum + item.purchaseAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-600 mt-1">Overview of your purchase records</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6" />
          <h3 className="text-lg font-medium">Total Purchase Amount</h3>
        </div>
        <p className="text-4xl font-bold">{formatCurrency(totalPurchase)}</p>
        <p className="text-blue-100 mt-1">Across {yearlyData.length} years</p>
      </div>

      {yearlyData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Records Found</h3>
          <p className="text-slate-600">Start by adding your first invoice</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Year
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                    Purchase Amount
                  </th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearlyData.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => handleYearClick(item._id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-800">{item._id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-slate-800">
                      {formatCurrency(item.purchaseAmount)}
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
