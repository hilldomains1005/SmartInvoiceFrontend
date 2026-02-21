import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-50 p-6">
      <div className="max-w-3xl w-full flex flex-col items-center gap-6">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">Smart Invoice Manager</h1>
          <p className="mt-1 text-sm text-slate-500">Manage purchases, invoices and exports effortlessly</p>
        </header>

        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-lg font-bold shadow-md">SI</div>
          </div>

          <h2 className="text-xl font-semibold text-center text-slate-800 mb-6">Sign in to your account</h2>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                placeholder="your.username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg shadow-md transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Need help? Contact your administrator.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
