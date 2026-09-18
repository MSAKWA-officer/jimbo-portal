import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// This page is for PUBLIC REGISTRATION (no login required) - for
// CITIZENS who want to track their requests. All accounts registered here
// are automatically assigned the role: 'citizen'
// (enforced on the backend - see authController.js).
//
// Internal office staff (Staff, Secretary, Officers) do NOT register here -
// they are added by an admin only, through the "Users" page (UserCreate.jsx).
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold text-brand-700 mb-1">Register</h1>
        <p className="text-sm text-gray-500 mb-6">
          For citizens who want to track their requests online.
        </p>

        {error && (
          <div className="mb-4 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          This account will let you register your constituent profile and
          submit your own requests. If you are an office staff member
          (Staff/Secretary/Officer), your account will be created by the
          system Administrator.
        </p>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
