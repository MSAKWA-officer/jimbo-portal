import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import {
  ActionsCell,
  EmptyRow,
  ErrorBanner,
  FilterBar,
  IconAction,
  ListCard,
  ListHeader,
  Pagination,
  TableWrap,
  Td,
  Th,
  inputClass,
} from '../../components/ListUI.jsx';

const PAGE_SIZE = 10;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const statusDots = {
  scheduled: 'bg-blue-500',
  ongoing: 'bg-amber-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
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
  const [page, setPage] = useState(1);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Pakia orodha (search inachelewa 300ms). Kurasa zinafanyika kwenye browser.
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (search) params.search = search;

        const res = await api.get('/events', { params });
        if (!cancelled) setList(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to get the list of events.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, filterStatus, reloadKey]);

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? Its attendees will also be removed.')) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      await api.delete(`/events/${id}`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the event.');
    } finally {
      setDeletingId(null);
    }
  };

  const lastPage = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const rows = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <ListCard>
      <ListHeader
        title="Events"
        subtitle={`${list.length} registered`}
        actionTo="/events/create"
        actionLabel="Add Event"
      />

      <ErrorBanner>{error}</ErrorBanner>

      {/* FILTERS */}
      <FilterBar>
        <input
          placeholder="Search event name or location"
          className={`${inputClass} w-full sm:w-[320px]`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className={`${inputClass} pr-8`}
        >
          <option value="">All statuses</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </FilterBar>

      {/* TABLE */}
      <TableWrap>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Event name</Th>
            <Th>Location</Th>
            <Th>Attendees</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <EmptyRow colSpan={6}>Loading...</EmptyRow>
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={6}>No events found.</EmptyRow>
          ) : (
            rows.map((ev) => (
              <tr key={ev.id}>
                <Td className="whitespace-nowrap">{formatDate(ev.eventDate)}</Td>

                <Td left>
                  <Link to={`/events/${ev.id}`} className="font-semibold text-gray-900 hover:text-[#0b6e4f] hover:underline">
                    {ev.title}
                  </Link>
                  {ev.organizer?.fullName && (
                    <div className="text-[13px] text-gray-500">{ev.organizer.fullName}</div>
                  )}
                </Td>

                <Td>{ev.location || '—'}</Td>

                <Td>
                  {ev.attendees ? ev.attendees.length : (ev.attendeeCount ?? '—')}
                  {ev.capacity ? ` / ${ev.capacity}` : ''}
                </Td>

                <Td>
                  <span
                    className={`inline-flex items-center gap-2 text-[13px] font-medium px-2.5 py-1.5 rounded-md ${
                      statusStyles[ev.status] || ''
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDots[ev.status] || 'bg-gray-400'}`} />
                    {statusLabels[ev.status] || ev.status}
                  </span>
                </Td>

                <Td>
                  <ActionsCell>
                    <IconAction variant="view" title="View" to={`/events/${ev.id}`}>
                      <Eye size={16} />
                    </IconAction>

                    <IconAction variant="edit" title="Edit" to={`/events/${ev.id}/edit`}>
                      <Pencil size={16} />
                    </IconAction>

                    <IconAction
                      variant="danger"
                      title={deletingId === ev.id ? 'Deleting...' : 'Delete'}
                      disabled={deletingId === ev.id}
                      onClick={() => remove(ev.id)}
                    >
                      <Trash2 size={16} />
                    </IconAction>
                  </ActionsCell>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>

      <Pagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        total={list.length}
        onChange={setPage}
      />
    </ListCard>
  );
}
