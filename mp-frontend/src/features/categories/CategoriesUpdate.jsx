import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function CategoriesUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/categories');
      const category = data.find((c) => String(c.id) === String(id));

      if (!category) {
        setError('Category not found.');
        return;
      }

      setName(category.name || '');
      setDescription(category.description || '');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load category details.'
      );
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
      await api.put(`/categories/${id}`, { name, description });
      navigate('/categories');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update the category.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">Edit Category</h1>

        <Link to="/categories" className="text-base text-brand-700 hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-base text-black">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-base font-semibold text-black mb-1">
              Category name
            </label>
            <input
              placeholder="Example: Education"
              required
              className="w-64 border rounded-md px-3 py-2 text-base text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-black mb-1">
              Description
            </label>
            <textarea
              placeholder="Short description (optional)"
              rows={3}
              className="w-64 border rounded-md px-3 py-2 text-base text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white text-base font-medium px-5 py-2.5 rounded-md"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>

            <Link
              to="/categories"
              className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-5 py-2.5 rounded-md"
            >
              Cancel
            </Link>
          </div>

        </form>
      )}

    </div>
  );
}
