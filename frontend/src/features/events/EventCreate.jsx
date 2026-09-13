import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const emptyForm = {
  title: '',
  description: '',
  eventDate: new Date().toISOString().slice(0, 10),
  startTime: '',
  endTime: '',
  location: '',
  capacity: '',
  notes: '',
};

export default function EventCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/events', {
        title: form.title,
        description: form.description || undefined,
        eventDate: form.eventDate,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        location: form.location || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        notes: form.notes || undefined,
      });

      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add the event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">New Event</h1>

        <Link to="/events" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {submitting ? 'Submitting...' : 'Add Event'}
          </button>

          <Link
            to="/events"
            className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-5 py-2.5 rounded-md"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
