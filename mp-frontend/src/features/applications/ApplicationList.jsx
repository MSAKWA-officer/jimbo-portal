import { useEffect, useState } from 'react';
import { Eye, Paperclip, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import LetterViewer from './LetterViewer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
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

// Who can delete applications (the backend should enforce this too)
const CAN_DELETE_ROLES = ['admin'];

const statusLabels = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-200 text-gray-800',
};

const statusDots = {
  pending: 'bg-yellow-500',
  in_review: 'bg-blue-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  completed: 'bg-gray-500',
};

// ---------------------------------------------------------------
// Delete confirmation dialog
// ---------------------------------------------------------------
function ConfirmDelete({ target, deleting, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !deleting && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4"
      onClick={() => !deleting && onCancel()}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800">Delete application?</h2>
        <p className="mt-2 text-sm text-gray-600">
          You are about to delete <span className="font-semibold">{target.trackingNumber}</span>
          {target.title ? <> — “{target.title}”</> : null}. This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationList() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewLetter, setViewLetter] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { user } = useAuth();
  const canDelete = CAN_DELETE_ROLES.includes(user?.role);

  const reload = () => setReloadKey((k) => k + 1);

  // Kategoria kwa ajili ya kichujio
  useEffect(() => {
    api
      .get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {
        /* kichujio tu - si lazima kisimamishe ukurasa */
      });
  }, []);

  // Pakia orodha (search inachelewa 300ms)
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/requests', {
          params: {
            status: statusFilter || undefined,
            categoryId: categoryFilter || undefined,
            search: search || undefined,
            page,
            limit: PAGE_SIZE,
          },
        });
        if (cancelled) return;
        setList(data.data);
        setTotal(data.total ?? data.data.length);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load the applications list.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, statusFilter, categoryFilter, page, reloadKey]);

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/requests/${id}/status`, { status });
      reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the application status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/requests/${deleteTarget.id}`);
      setDeleteTarget(null);
      // Kama ulifuta mwisho wa ukurasa, rudi ukurasa uliotangulia
      if (list.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      setDeleteTarget(null);
      setError(err.response?.data?.message || 'Failed to delete the application.');
    } finally {
      setDeleting(false);
    }
  };

  const openLetter = (r) =>
    setViewLetter({
      requestId: r.id,
      name: r.identificationLetterName,
      trackingNumber: r.trackingNumber,
      title: r.title,
    });

  const selectClass = `${inputClass} pr-8`;

  return (
    <ListCard>
      <ListHeader
        title="Applications"
        subtitle={`${total} registered`}
        actionTo="/applications/create"
        actionLabel="New Application"
      />

      <ErrorBanner>{error}</ErrorBanner>

      {/* FILTERS */}
      <FilterBar>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search title or tracking no."
          className={`${inputClass} w-full sm:w-[300px]`}
        />

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={selectClass}
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
            <Th>Tracking No.</Th>
            <Th>Title</Th>
            <Th>Constituent</Th>
            <Th>Category</Th>
            <Th>Letter</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <EmptyRow colSpan={7}>Loading...</EmptyRow>
          ) : list.length === 0 ? (
            <EmptyRow colSpan={7}>No applications found.</EmptyRow>
          ) : (
            list.map((r) => (
              <tr key={r.id}>
                <Td className="font-mono text-[13px] whitespace-nowrap">{r.trackingNumber}</Td>

                <Td left className="font-semibold">{r.title}</Td>

                <Td>{r.constituent?.fullName || '-'}</Td>

                <Td>{r.category?.name || '-'}</Td>

                <Td>
                  {r.identificationLetterName ? (
                    <button
                      type="button"
                      onClick={() => openLetter(r)}
                      title={`Open ${r.identificationLetterName}`}
                      className="inline-flex items-center gap-1.5 text-green-700 font-medium hover:text-green-900 hover:underline"
                    >
                      <Paperclip size={14} />
                      Attached
                    </button>
                  ) : (
                    <span className="text-red-600">None</span>
                  )}
                </Td>

                <Td>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 text-[13px] font-medium px-2.5 py-1 rounded-md ${
                        statusColors[r.status] || ''
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          statusDots[r.status] || 'bg-gray-400'
                        }`}
                      />
                      {statusLabels[r.status] || r.status}
                    </span>

                    {r.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => changeStatus(r.id, 'completed')}
                        className="text-[12px] text-blue-700 hover:underline"
                      >
                        Mark completed
                      </button>
                    )}
                  </span>
                </Td>

                <Td>
                  <ActionsCell>
                    <IconAction variant="view" title="View application" to={`/applications/${r.id}`}>
                      <Eye size={16} />
                    </IconAction>

                    <IconAction variant="edit" title="Edit" to={`/applications/${r.id}/edit`}>
                      <Pencil size={16} />
                    </IconAction>

                    {canDelete && (
                      <IconAction variant="danger" title="Delete" onClick={() => setDeleteTarget(r)}>
                        <Trash2 size={16} />
                      </IconAction>
                    )}
                  </ActionsCell>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />

      {viewLetter && <LetterViewer letter={viewLetter} onClose={() => setViewLetter(null)} />}

      {deleteTarget && (
        <ConfirmDelete
          target={deleteTarget}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </ListCard>
  );
}
