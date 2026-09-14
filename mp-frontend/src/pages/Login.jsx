import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Imeshindwa kuingia. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold text-brand-700 mb-1">Karibu</h1>
        <p className="text-sm text-gray-500 mb-6">Ingia kwenye Mfumo wa Maombi ya Wananchi</p>

        {error && (
          <div className="mb-4 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barua pepe</label>
            <input
              type="email"
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-md text-sm disabled:opacity-60"
          >
            {loading ? 'Inaingia...' : 'Ingia'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Huna akaunti?{' '}
          <Link to="/register" className="text-brand-600 font-medium">
            Jisajili
          </Link>
        </p>
      </div>
    </div>
  );
}
