import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const formatDateTime = (d) => (d ? new Date(d).toLocaleString('en-US') : '—');

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-black',
};

const statusLabels = {
  scheduled: 'Scheduled',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const attendeeStatusStyles = {
  registered: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  attended: 'bg-green-100 text-green-700',
  absent: 'bg-gray-100 text-black',
  cancelled: 'bg-red-100 text-red-700',
};

const attendeeStatusLabels = {
  registered: 'Registered',
  confirmed: 'Confirmed',
  attended: 'Attended',
  absent: 'Absent',
  cancelled: 'Cancelled',
};

const emptyAttendeeForm = {
  fullName: '',
  phone: '',
  email: '',
  organization: '',
  notes: '',
};

export default function EventView() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [attendeeForm, setAttendeeForm] = useState(emptyAttendeeForm);
  const [attendeeError, setAttendeeError] = useState('');
  const [addingAttendee, setAddingAttendee] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addAttendee = async (e) => {
    e.preventDefault();
    setAttendeeError('');
    setAddingAttendee(true);

    try {
      await api.post('/event-attendees', {
        eventId: id,
        fullName: attendeeForm.fullName,
        phone: attendeeForm.phone || undefined,
        email: attendeeForm.email || undefined,
        organization: attendeeForm.organization || undefined,
        notes: attendeeForm.notes || undefined,
      });

      setAttendeeForm(emptyAttendeeForm);
      load();
    } catch (err) {
      setAttendeeError(err.response?.data?.message || 'Failed to register the attendee.');
    } finally {
      setAddingAttendee(false);
    }
  };

  const setAttendeeStatus = async (attendeeId, attendanceStatus) => {
    try {
      await api.patch(`/event-attendees/${attendeeId}/status`, { attendanceStatus });
      load();
    } catch (err) {
      setAttendeeError(err.response?.data?.message || 'Failed to update the attendee status.');
    }
  };

  const removeAttendee = async (attendeeId) => {
    if (!confirm('Are you sure you want to remove this attendee?')) return;

    try {
      await api.delete(`/event-attendees/${attendeeId}`);
      load();
    } catch (err) {
      setAttendeeError(err.response?.data?.message || 'Failed to remove the attendee.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <p className="text-base text-black">Loading...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Event not found.'}
        </div>
        <Link to="/events" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  const attendees = event.attendees || [];
  const attendedCount = attendees.filter((a) => a.attendanceStatus === 'attended').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">{event.title}</h1>
          <p className="text-base text-black mt-1">
            {formatDate(event.eventDate)}
            {event.startTime ? ` • ${event.startTime.slice(0, 5)}` : ''}
            {event.endTime ? ` – ${event.endTime.slice(0, 5)}` : ''}
            {event.location ? ` • ${event.location}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/events/${event.id}/edit`}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-base font-medium px-4 py-2 rounded-md"
          >
            Edit
          </Link>
          <Link to="/events" className="text-base text-[#0B2A4A] hover:underline">
            &larr; Back
          </Link>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50/40 border border-[#0B2A4A]/20 rounded-xl p-4">
          <p className="text-sm text-black">Event Status</p>
          <span className={`inline-block mt-1 text-sm font-medium px-2 py-1 rounded-full ${statusStyles[event.status]}`}>
            {statusLabels[event.status]}
          </span>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-black">Registered</p>
          <p className="text-2xl font-bold text-[#0B2A4A] mt-1">
            {attendees.length}{event.capacity ? ` / ${event.capacity}` : ''}
          </p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-black">Actually Attended</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{attendedCount}</p>
        </div>
      </div>

      {event.description && (
        <div className="mb-6">
          <p className="text-sm font-medium text-black mb-1">Description</p>
          <p className="text-base text-black">{event.description}</p>
        </div>
      )}

      {event.organizer && (
        <div className="mb-6 text-base text-black">
          Organizer: <span className="font-semibold">{event.organizer.fullName}</span>
        </div>
      )}

      {/* ===================== EVENT ATTENDEES ===================== */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold text-black mb-4">Event Attendees</h2>

        {attendeeError && (
          <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{attendeeError}</div>
        )}

        {/* Add attendee form */}
        <form onSubmit={addAttendee} className="border rounded-xl p-4 bg-gray-50/60 mb-5 space-y-3">
          <p className="text-base font-medium text-black">Register New Attendee</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Full Name"
              required
              className="border rounded-md px-3 py-2 text-base text-black"
              value={attendeeForm.fullName}
              onChange={(e) => setAttendeeForm({ ...attendeeForm, fullName: e.target.value })}
            />
            <input
              placeholder="Phone Number (optional)"
              className="border rounded-md px-3 py-2 text-base text-black"
              value={attendeeForm.phone}
              onChange={(e) => setAttendeeForm({ ...attendeeForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="email"
              placeholder="Email (optional)"
              className="border rounded-md px-3 py-2 text-base text-black"
              value={attendeeForm.email}
              onChange={(e) => setAttendeeForm({ ...attendeeForm, email: e.target.value })}
            />
            <input
              placeholder="Organization/Group (optional)"
              className="border rounded-md px-3 py-2 text-base text-black"
              value={attendeeForm.organization}
              onChange={(e) => setAttendeeForm({ ...attendeeForm, organization: e.target.value })}
            />
          </div>

          <input
            placeholder="Notes (optional)"
            className="w-full border rounded-md px-3 py-2 text-base text-black"
            value={attendeeForm.notes}
            onChange={(e) => setAttendeeForm({ ...attendeeForm, notes: e.target.value })}
          />

          <button
            type="submit"
            disabled={addingAttendee}
            className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-base font-medium px-4 py-2 rounded-md"
          >
            {addingAttendee ? 'Registering...' : '+ Register Attendee'}
          </button>
        </form>

        {/* Attendees table */}
        <div className="border rounded-xl overflow-x-auto">
          <table className="w-full text-base">
            <thead className="bg-gray-50 text-black text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {attendees.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-black" colSpan={5}>
                    No one has registered for this event yet.
                  </td>
                </tr>
              ) : (
                attendees.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-black">
                      {a.fullName}
                      {a.organization && <div className="text-sm text-black">{a.organization}</div>}
                    </td>
                    <td className="px-4 py-3 text-black">
                      {a.phone && <div>{a.phone}</div>}
                      {a.email && <div className="text-sm text-black">{a.email}</div>}
                      {!a.phone && !a.email && '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">{formatDateTime(a.registeredAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${attendeeStatusStyles[a.attendanceStatus]}`}>
                        {attendeeStatusLabels[a.attendanceStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {a.attendanceStatus !== 'attended' && (
                          <button
                            onClick={() => setAttendeeStatus(a.id, 'attended')}
                            className="text-green-700 hover:underline text-sm font-medium"
                          >
                            Mark Attended
                          </button>
                        )}
                        {a.attendanceStatus === 'registered' && (
                          <button
                            onClick={() => setAttendeeStatus(a.id, 'confirmed')}
                            className="text-indigo-700 hover:underline text-sm font-medium"
                          >
                            Confirm
                          </button>
                        )}
                        {!['absent', 'cancelled'].includes(a.attendanceStatus) && (
                          <button
                            onClick={() => setAttendeeStatus(a.id, 'absent')}
                            className="text-black hover:underline text-sm font-medium"
                          >
                            Absent
                          </button>
                        )}
                        <button
                          onClick={() => removeAttendee(a.id)}
                          className="text-red-600 hover:underline text-sm font-medium"
                        >
                          Delete
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
    </div>
  );
}
