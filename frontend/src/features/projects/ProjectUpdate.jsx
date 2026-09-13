import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ProjectUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [constituents, setConstituents] = useState([]);
  const [form, setForm] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/constituents', { params: { limit: 100 } }),
      api.get(`/projects/${id}`),
    ])
      .then(([catRes, conRes, projRes]) => {
        setCategories(catRes.data);
        setConstituents(conRes.data.data || conRes.data);

        const p = projRes.data;
        setForm({
          title: p.title || '',
          description: p.description || '',
          categoryId: p.categoryId || '',
          constituentId: p.constituentId || '',
          location: p.location || '',
          status: p.status || 'planned',
          startDate: p.startDate ? p.startDate.slice(0, 10) : '',
          endDate: p.endDate ? p.endDate.slice(0, 10) : '',
          estimatedCost: p.estimatedCost ?? '',
          actualCost: p.actualCost ?? '',
          progressPercentage: p.progressPercentage ?? 0,
          notes: p.notes || '',
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load project details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.put(`/projects/${id}`, {
        title: form.title,
        description: form.description || undefined,
        categoryId: form.categoryId || null,
        constituentId: form.constituentId || null,
        location: form.location || undefined,
        status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        estimatedCost: form.estimatedCost !== '' ? Number(form.estimatedCost) : null,
        actualCost: form.actualCost !== '' ? Number(form.actualCost) : 0,
        progressPercentage: Number(form.progressPercentage) || 0,
        notes: form.notes || undefined,
      });

      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the project.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <p className="text-base text-black">Loading...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Project not found.'}
        </div>
        <Link to="/projects" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">Edit Project</h1>

        <Link to={`/projects/${id}`} className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

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
            <label className="block text-sm font-medium text-black mb-1">Status</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-base text-black"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="planned">Planned</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-black mb-1">Actual Cost (TZS)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border rounded-md px-3 py-2 text-base text-black"
              value={form.actualCost}
              onChange={(e) => setForm({ ...form, actualCost: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full border rounded-md px-3 py-2 text-base text-black"
              value={form.progressPercentage}
              onChange={(e) => setForm({ ...form, progressPercentage: e.target.value })}
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
            {submitting ? 'Submitting...' : 'Save Changes'}
          </button>

          <Link
            to={`/projects/${id}`}
            className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-5 py-2.5 rounded-md"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
