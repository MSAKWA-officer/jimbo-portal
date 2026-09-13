import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function EventUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => {
        const ev = res.data;
        setForm({
          title: ev.title || '',
          description: ev.description || '',
          eventDate: ev.eventDate ? ev.eventDate.slice(0, 10) : '',
          startTime: ev.startTime || '',
          endTime: ev.endTime || '',
          location: ev.location || '',
          capacity: ev.capacity ?? '',
          status: ev.status || 'scheduled',
          notes: ev.notes || '',
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load event details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.put(`/events/${id}`, {
        title: form.title,
        description: form.description || undefined,
        eventDate: form.eventDate,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        location: form.location || undefined,
        capacity: form.capacity !== '' ? Number(form.capacity) : null,
        status: form.status,
        notes: form.notes || undefined,
      });

      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the event.');
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
          {error || 'Event not found.'}
        </div>
        <Link to="/events" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">Edit Event</h1>

        <Link to={`/events/${id}`} className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          placeholder="Event Name"
          required
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Event Description (optional)"
          rows={3}
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Event Date</label>
            <input
              type="date"
              required
              className="w-full border rounded-md px-3 py-2 text-base text-black"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Start Time</label>
            <input
              type="time"
              className="w-full border rounded-md px-3 py-2 text-base text-black"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">End Time</label>
            <input
              type="time"
              className="w-full border rounded-md px-3 py-2 text-base text-black"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            placeholder="Location (optional)"
            className="border rounded-md px-3 py-2 text-base text-black"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            type="number"
            min="1"
            placeholder="Attendee Limit (optional)"
            className="border rounded-md px-3 py-2 text-base text-black"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <select
            className="border rounded-md px-3 py-2 text-base text-black"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
            to={`/events/${id}`}
            className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-5 py-2.5 rounded-md"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
