import { useState } from 'react';
import api from '../api/axios';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Password mpya na uthibitisho wake havifanani.');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Password mpya lazima iwe na herufi/namba angalau 6.');
      return;
    }

    setSubmitting(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setSuccess('Password imebadilishwa kwa mafanikio.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Imeshindwa kubadilisha password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Badilisha Password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Weka password yako ya sasa kisha password mpya unayotaka.
        </p>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {success && (
        <div className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-md mb-4">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Password ya Sasa</label>
          <input
            type="password"
            required
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Password Mpya</label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Thibitisha Password Mpya</label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-sm font-medium px-5 py-2.5 rounded-md"
        >
          {submitting ? 'Inabadilisha...' : 'Badilisha Password'}
        </button>
      </form>
    </div>
  );
}
