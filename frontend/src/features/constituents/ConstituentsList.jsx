import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ConstituentsList() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/constituents', {
        params: { search: search || undefined },
      });
      setList(data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load the list of constituents.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );
    if (!confirmed) return;

    setError('');
    setDeletingId(id);

    try {
      await api.delete(`/constituents/${id}`);
      setList((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete the constituent.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Constituents</h1>
          <p className="text-base text-black mt-1">
            Full list of registered constituents.
          </p>
        </div>

        <Link
          to="/constituents/create"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + Add Constituent
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          placeholder="Search by name, phone, or National ID..."
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-xl overflow-x-auto bg-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-300 text-black text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Ward/Village</th>
              <th className="px-4 py-3 font-semibold">National ID</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-black bg-white" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-black bg-white" colSpan={5}>
                  No constituents yet.
                </td>
              </tr>
            ) : (
              list.map((c) => (
                <tr key={c.id} className="bg-white">
                  <td className="px-4 py-3 font-medium text-black">{c.fullName}</td>
                  <td className="px-4 py-3 text-black">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-black">
                    {[c.ward, c.village].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td className="px-4 py-3 text-black">{c.nationalId || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/constituents/${c.id}/edit`}
                        className="text-brand-700 hover:underline text-xs font-medium"
                      >
                        Edit
                      </Link>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(c.id, c.fullName)}
                          disabled={deletingId === c.id}
                          className="text-red-600 hover:underline text-xs font-medium disabled:text-gray-400"
                        >
                          {deletingId === c.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
