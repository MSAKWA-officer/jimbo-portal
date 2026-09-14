import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ProjectActivityUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');

      try {
        const [projectsRes, activityRes] = await Promise.all([
          api.get('/projects'),
          api.get(`/project-activities/${id}`),
        ]);

        setProjects(projectsRes.data);

        const a = activityRes.data;
        setForm({
          projectId: a.projectId || '',
          title: a.title || '',
          description: a.description || '',
          activityDate: a.activityDate ? a.activityDate.slice(0, 10) : '',
          status: a.status || 'planned',
          notes: a.notes || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load activity details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.put(`/project-activities/${id}`, {
        projectId: form.projectId,
        title: form.title,
        description: form.description || undefined,
        activityDate: form.activityDate,
        status: form.status,
        notes: form.notes || undefined,
      });

      navigate('/project-activities');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the project activity.');
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

  if (error && !form) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
        <Link to="/project-activities" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">Edit Project Activity</h1>

        <Link to="/project-activities" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">Project</label>
          <select
            required
            className="w-full border rounded-md px-3 py-2 text-base text-black"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          >
            <option value="">-- Select Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Title */}
        <input
          type="text"
          placeholder="Activity Name"
          required
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* Date + Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            required
            className="border rounded-md px-3 py-2 text-base text-black"
            value={form.activityDate}
            onChange={(e) => setForm({ ...form, activityDate: e.target.value })}
          />

          <select
            className="border rounded-md px-3 py-2 text-base text-black"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="planned">Planned</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Description */}
        <textarea
          placeholder="Activity description (optional)"
          rows={3}
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Additional notes */}
        <textarea
          placeholder="Comments/Additional notes (optional)"
          rows={2}
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-base font-medium px-5 py-2.5 rounded-md"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>

          <Link
            to="/project-activities"
            className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-5 py-2.5 rounded-md"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
