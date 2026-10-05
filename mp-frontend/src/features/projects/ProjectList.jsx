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

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US') : '—');

const statusStyles = {
  planned: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const statusDots = {
  planned: 'bg-blue-500',
  ongoing: 'bg-amber-500',
  completed: 'bg-green-500',
  on_hold: 'bg-orange-500',
  cancelled: 'bg-gray-500',
};

const statusLabels = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

export default function ProjectList() {
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

        const res = await api.get('/projects', { params });
        if (!cancelled) setList(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to get the list of projects.');
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
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setDeletingId(id);
    setError('');

    try {
      await api.delete(`/projects/${id}`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the project.');
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
        title="Projects"
        subtitle={`${list.length} registered`}
        actionTo="/projects/create"
        actionLabel="Add Project"
      />

      <ErrorBanner>{error}</ErrorBanner>

      <FilterBar>
        <input
          placeholder="Search project name or location"
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

      <TableWrap>
        <thead>
          <tr>
            <Th>Project name</Th>
            <Th>Category</Th>
            <Th>Location</Th>
            <Th>Estimated cost</Th>
            <Th>Progress</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <EmptyRow colSpan={7}>Loading...</EmptyRow>
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={7}>No projects found.</EmptyRow>
          ) : (
            rows.map((p) => {
              const progress = Math.min(100, Number(p.progressPercentage) || 0);
              return (
                <tr key={p.id}>
                  <Td left>
                    <Link to={`/projects/${p.id}`} className="font-semibold text-gray-900 hover:text-[#0b6e4f] hover:underline">
                      {p.title}
                    </Link>
                    <div className="text-[13px] text-gray-500">
                      {formatDate(p.startDate)} — {formatDate(p.endDate)}
                    </div>
                  </Td>

                  <Td>{p.category?.name || '—'}</Td>
                  <Td>{p.location || '—'}</Td>
                  <Td className="whitespace-nowrap">
                    {p.estimatedCost ? `TZS ${currency(p.estimatedCost)}` : '—'}
                  </Td>

                  <Td>
                    <div className="mx-auto w-28 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#0b6e4f] h-2" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[13px] text-gray-600">{p.progressPercentage || 0}%</span>
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center gap-2 text-[13px] font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap ${
                        statusStyles[p.status] || ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusDots[p.status] || 'bg-gray-400'}`} />
                      {statusLabels[p.status] || p.status}
                    </span>
                  </Td>

                  <Td>
                    <ActionsCell>
                      <IconAction variant="view" title="View" to={`/projects/${p.id}`}>
                        <Eye size={16} />
                      </IconAction>
                      <IconAction variant="edit" title="Edit" to={`/projects/${p.id}/edit`}>
                        <Pencil size={16} />
                      </IconAction>
                      <IconAction
                        variant="danger"
                        title={deletingId === p.id ? 'Deleting...' : 'Delete'}
                        disabled={deletingId === p.id}
                        onClick={() => remove(p.id)}
                      >
                        <Trash2 size={16} />
                      </IconAction>
                    </ActionsCell>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </TableWrap>

      <Pagination page={currentPage} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} />
    </ListCard>
  );
}
