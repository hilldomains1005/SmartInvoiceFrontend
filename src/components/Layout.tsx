import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Download, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  onAddInvoice?: () => void;
  onExport?: () => void;
}

export function Layout({ children, onAddInvoice, onExport }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top nav bar */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-2 sm:py-0">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">Smart Invoice Manager</h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {onExport && (
                <button
                  onClick={onExport}
                  className="flex items-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Export</span>
                </button>
              )}
              {onAddInvoice && (
                <button
                  onClick={onAddInvoice}
                  className="flex items-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Invoice</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary nav bar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-8">
            <Link
              to="/"
              className={`py-2 sm:py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/all-invoices"
              className={`py-2 sm:py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                location.pathname === '/all-invoices'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              All Invoices
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
