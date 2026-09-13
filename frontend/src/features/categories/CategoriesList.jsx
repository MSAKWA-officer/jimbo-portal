import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function CategoriesList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/categories');
      setList(data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load the list of categories.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the category "${name}"?`
    );
    if (!confirmed) return;

    setError('');
    setDeletingId(id);

    try {
      await api.delete(`/categories/${id}`);
      setList((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete the category.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Request Categories
          </h1>

          <p className="text-base text-black mt-1">
            Full list of registered categories.
          </p>
        </div>

        <Link
          to="/categories/create"
          className="bg-brand-600 hover:bg-brand-700 text-white text-base font-medium px-4 py-2 rounded-md"
        >
          + Add Category
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-base">
          <thead className="bg-gray-50 text-black text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={3}>
                  Loading...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={3}>
                  No categories yet.
                </td>
              </tr>
            ) : (
              list.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold text-black">{c.name}</td>
                  <td className="px-4 py-3 text-black">{c.description || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/categories/${c.id}/edit`}
                        className="text-brand-700 hover:underline text-sm font-semibold"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={deletingId === c.id}
                        className="text-red-600 hover:underline text-sm font-semibold disabled:text-gray-400"
                      >
                        {deletingId === c.id ? 'Deleting...' : 'Delete'}
                      </button>
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
