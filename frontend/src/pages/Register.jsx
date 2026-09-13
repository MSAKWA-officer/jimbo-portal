import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Ukurasa huu ni wa USAJILI WA HADHARA (bila kuhitaji login) - kwa
// WANANCHI wanaotaka kufuatilia maombi yao na kwa VIEWERS wa nje pekee.
// Akaunti zote zinazosajiliwa hapa huwa na role: 'viewer' moja kwa moja
// (imefungwa upande wa backend - angalia authController.js).
//
// Watumiaji wa ndani wa ofisi (Staff, Secretary, Maafisa) HAWAJISAJILI hapa -
// huongezwa na admin pekee kupitia ukurasa wa "Watumiaji" (UserCreate.jsx).
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
      setError(err.response?.data?.message || 'Imeshindwa kujisajili.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold text-brand-700 mb-1">Jisajili</h1>
        <p className="text-sm text-gray-500 mb-6">
          Kwa wananchi wanaotaka kufuatilia maombi yao mtandaoni.
        </p>

        {error && (
          <div className="mb-4 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jina kamili</label>
            <input
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Simu</label>
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
            {loading ? 'Inasajili...' : 'Jisajili'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Akaunti hii itakuwa na ruhusa za kutazama (viewer) tu. Kama wewe ni
          mtumishi wa ofisi (Staff/Secretary/Afisa), akaunti yako itaongezwa
          na Msimamizi (Admin) wa mfumo.
        </p>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Una akaunti tayari?{' '}
          <Link to="/login" className="text-brand-600 font-medium">
            Ingia
          </Link>
        </p>
      </div>
    </div>
  );
}
