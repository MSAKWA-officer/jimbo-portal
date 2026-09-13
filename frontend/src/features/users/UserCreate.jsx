import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'staff',
};

export default function UserCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // We call /auth/register directly (NOT AuthContext.register) to avoid
      // overwriting the logged-in admin's own session with the new user's.
      await api.post('/auth/register', form);
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add the user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="max-w-lg mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm [&_*]:!text-[16px]"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Add User</h1>

        <Link to="/users" className="text-sm text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-black mb-1">Full Name</label>
          <input
            required
            className="w-full border rounded-md px-4 py-3"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded-md px-4 py-3"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">Phone</label>
          <input
            className="w-full border rounded-md px-4 py-3"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">Role</label>
          <select
            className="w-full border rounded-md px-4 py-3"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="staff">Staff</option>
            <option value="secretary">Secretary</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">Initial Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full border rounded-md px-4 py-3"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="text-xs text-black mt-1">
            At least 6 characters. The user will be able to change it later.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-sm font-medium px-6 py-3 rounded-md"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>

          <Link
            to="/users"
            className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-6 py-3 rounded-md"
          >
            Cancel
          </Link>
        </div>

      </form>

    </div>
  );
}
