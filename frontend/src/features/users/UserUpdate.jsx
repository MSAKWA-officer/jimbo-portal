import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';

const emptyForm = {
  fullName: '',
  phone: '',
  role: 'staff',
  isActive: true,
};

export default function UserUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSelf = currentUser && Number(currentUser.id) === Number(id);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get(`/users/${id}`);

      setEmail(data.email || '');
      setForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        role: data.role || 'staff',
        isActive: data.isActive,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the user\'s information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.put(`/users/${id}`, form);
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the user.');
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
        <h1 className="text-2xl font-bold text-black">Edit User</h1>

        <Link to="/users" className="text-sm text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-black">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-black mb-1">Email</label>
            <input
              disabled
              className="w-full border rounded-md px-4 py-3 bg-gray-50 text-black"
              value={email}
            />
            <p className="text-xs text-black mt-1">Email cannot be changed here.</p>
          </div>

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
              disabled={isSelf}
              className="w-full border rounded-md px-4 py-3 disabled:bg-gray-50 disabled:text-black"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="staff">Staff</option>
              <option value="secretary">Secretary</option>
              <option value="officer">Officer</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            {isSelf && (
              <p className="text-xs text-black mt-1">You cannot change your own account's role.</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-black">
              <input
                type="checkbox"
                disabled={isSelf}
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active Account
            </label>
            {isSelf && (
              <p className="text-xs text-black mt-1">You cannot deactivate your own account.</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-sm font-medium px-6 py-3 rounded-md"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>

            <Link
              to="/users"
              className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-6 py-3 rounded-md"
            >
              Cancel
            </Link>
          </div>

        </form>
      )}

    </div>
  );
}
