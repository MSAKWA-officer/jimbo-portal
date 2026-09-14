import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const statusLabels = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

export default function ApplicationUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [constituents, setConstituents] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    constituentId: '',
    categoryId: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
  });

  const [trackingNumber, setTrackingNumber] = useState('');
  const [identificationLetterName, setIdentificationLetterName] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [reqRes, constRes, catRes] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get('/constituents', { params: { limit: 100 } }),
        api.get('/categories'),
      ]);

      const r = reqRes.data;

      setForm({
        constituentId: r.constituentId || r.constituent?.id || '',
        categoryId: r.categoryId || r.category?.id || '',
        title: r.title || '',
        description: r.description || '',
        priority: r.priority || 'medium',
        status: r.status || 'pending',
      });

      setTrackingNumber(r.trackingNumber || '');
      setIdentificationLetterName(r.identificationLetterName || '');

      setConstituents(constRes.data.data);
      setCategories(catRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load application details.'
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
      await api.put(`/requests/${id}`, {
        constituentId: form.constituentId,
        categoryId: form.categoryId,
        title: form.title,
        description: form.description,
        priority: form.priority,
      });

      await api.patch(`/requests/${id}/status`, {
        status: form.status,
      });

      navigate('/applications');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update the application.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Edit Application
          </h1>

          {trackingNumber && (
            <p className="text-sm font-mono text-black mt-1">
              {trackingNumber}
            </p>
          )}
        </div>

        <Link
          to="/applications"
          className="text-base text-[#0B2A4A] hover:underline"
        >
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

          {/* Constituent + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <select
              required
              className="border rounded-md px-3 py-2 text-base text-black"
              value={form.constituentId}
              onChange={(e) =>
                setForm({ ...form, constituentId: e.target.value })
              }
            >
              <option value="">-- Select Constituent --</option>

              {constituents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>

            <select
              required
              className="border rounded-md px-3 py-2 text-base text-black"
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
            >
              <option value="">-- Select Category --</option>

              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

          </div>

          {/* Title */}
          <input
            placeholder="Application title"
            required
            className="w-full border rounded-md px-3 py-2 text-base text-black"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {/* Description */}
          <textarea
            placeholder="Full description of the application"
            required
            rows={4}
            className="w-full border rounded-md px-3 py-2 text-base text-black"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* Priority + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <select
              className="border rounded-md px-3 py-2 text-base text-black"
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value })
              }
            >
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
              <option value="urgent">Priority: Urgent</option>
            </select>

            <select
              className="border rounded-md px-3 py-2 text-base text-black"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  Status: {label}
                </option>
              ))}
            </select>

          </div>

          {/* IDENTIFICATION LETTER (INFO ONLY) */}
          <div className="border border-[#0B2A4A]/20 rounded-lg p-4 bg-blue-50/40">

            <p className="block text-base font-semibold text-[#0B2A4A] mb-2">
              Identification Letter
            </p>

            {identificationLetterName ? (
              <p className="text-base text-green-700">
                📄 {identificationLetterName}
              </p>
            ) : (
              <p className="text-base text-red-600">
                No letter attached.
              </p>
            )}

            <p className="text-sm text-black mt-2">
              The identification letter cannot be changed here; submit a
              new application if you need to attach a different letter.
            </p>

          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-base font-medium px-5 py-2.5 rounded-md"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>

            <Link
              to="/applications"
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
