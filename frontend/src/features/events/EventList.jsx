import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

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

export default function EventList() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (statusFilter = filterStatus, searchTerm = search) => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/events', { params });
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get the list of events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (statusFilter) => {
    setFilterStatus(statusFilter);
    load(statusFilter, search);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load(filterStatus, search);
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this event? Its attendees will also be removed.')) return;

    try {
      await api.delete(`/events/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the event.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Events</h1>
        
        </div>

        <Link
          to="/events/create"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-base font-medium px-4 py-2 rounded-md"
        >
          + Add Event
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <input
          placeholder="Search by event name or location..."
          className="border rounded-md px-3 py-2 text-base text-black flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-4 py-2 rounded-md"
        >
          Search
        </button>
      </form>

      {/* STATUS FILTER */}
      <div className="flex items-center gap-2 mb-4">
        {['', 'scheduled', 'ongoing', 'completed', 'cancelled'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => handleFilter(s)}
            className={`text-base px-3 py-1.5 rounded-md font-medium ${
              filterStatus === s
                ? 'bg-[#0B2A4A] text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            {s ? statusLabels[s] : 'All'}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-base">
          <thead className="bg-gray-50 text-black text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Event Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Attendees</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={6}>Loading...</td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={6}>No events organized yet.</td>
              </tr>
            ) : (
              list.map((ev) => (
                <tr key={ev.id}>
                  <td className="px-4 py-3 text-black">{formatDate(ev.eventDate)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/events/${ev.id}`} className="text-[#0B2A4A] hover:underline font-semibold">
                      {ev.title}
                    </Link>
                    <div className="text-sm text-black">{ev.organizer?.fullName}</div>
                  </td>
                  <td className="px-4 py-3 text-black">{ev.location || '—'}</td>
                  <td className="px-4 py-3 text-black">
                    {ev.attendees ? ev.attendees.length : (ev.attendeeCount ?? '—')}
                    {ev.capacity ? ` / ${ev.capacity}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${statusStyles[ev.status]}`}>
                      {statusLabels[ev.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link to={`/events/${ev.id}`} className="text-black hover:underline text-sm font-medium">
                        View
                      </Link>
                      <Link to={`/events/${ev.id}/edit`} className="text-[#0B2A4A] hover:underline text-sm font-medium">
                        Edit
                      </Link>
                      <button
                        onClick={() => remove(ev.id)}
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
  );
}
