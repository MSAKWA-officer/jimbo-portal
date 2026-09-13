import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const emptyForm = {
  title: '',
  description: '',
  categoryId: '',
  constituentId: '',
  location: '',
  startDate: '',
  endDate: '',
  estimatedCost: '',
  notes: '',
};

export default function ProjectCreate() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [constituents, setConstituents] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/constituents', { params: { limit: 100 } })])
      .then(([catRes, conRes]) => {
        setCategories(catRes.data);
        setConstituents(conRes.data.data || conRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load initial data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/projects', {
        title: form.title,
        description: form.description || undefined,
        categoryId: form.categoryId || undefined,
        constituentId: form.constituentId || undefined,
        location: form.location || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
        notes: form.notes || undefined,
      });

      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add the project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">New Project</h1>

        <Link to="/projects" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {loading ? (
        <p className="text-base text-black">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Project Name"
            required
            className="w-full border rounded-md px-3 py-2 text-base text-black"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            placeholder="Project Description (optional)"
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-base text-black"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Category (optional)</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-base text-black"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Beneficiary Constituent (optional)</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-base text-black"
                value={form.constituentId}
                onChange={(e) => setForm({ ...form, constituentId: e.target.value })}
              >
                <option value="">-- Select Constituent --</option>
                {constituents.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <input
            placeholder="Location (optional)"
            className="w-full border rounded-md px-3 py-2 text-base text-black"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-base text-black"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">End Date</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-base text-black"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Estimated Cost (TZS)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border rounded-md px-3 py-2 text-base text-black"
                value={form.estimatedCost}
                onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
              />
            </div>
          </div>

          <textarea
            placeholder="Additional Notes (optional)"
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-base text-black"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-base font-medium px-5 py-2.5 rounded-md"
            >
              {submitting ? 'Submitting...' : 'Add Project'}
            </button>

            <Link
              to="/projects"
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
