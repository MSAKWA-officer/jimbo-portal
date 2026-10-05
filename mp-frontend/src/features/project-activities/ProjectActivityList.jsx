import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US') : '—');

const statusStyles = {
  planned: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const statusDots = {
  planned: 'bg-blue-500',
  ongoing: 'bg-amber-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
};

const statusLabels = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function ProjectActivityList() {
  const [searchParams] = useSearchParams();

  const [list, setList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProject, setFilterProject] = useState(searchParams.get('projectId') || '');
  const [page, setPage] = useState(1);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Miradi kwa ajili ya kichujio
  useEffect(() => {
    api
      .get('/projects')
      .then((res) => setProjects(res.data))
      .catch(() => {
        /* kichujio tu - si lazima kisimamishe ukurasa */
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (filterProject) params.projectId = filterProject;

        const res = await api.get('/project-activities', { params });
        if (!cancelled) setList(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to get the list of project activities.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filterStatus, filterProject, reloadKey]);

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project activity?')) return;

    setDeletingId(id);
    setError('');

    try {
      await api.delete(`/project-activities/${id}`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the activity.');
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
        title="Project Activities"
        subtitle={`${list.length} registered`}
        actionTo="/project-activities/create"
        actionLabel="Add Activity"
      />

      <ErrorBanner>{error}</ErrorBanner>

      <FilterBar>
        <select
          value={filterProject}
          onChange={(e) => {
            setFilterProject(e.target.value);
            setPage(1);
          }}
          className={`${inputClass} pr-8 max-w-full sm:max-w-[320px]`}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

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
            <Th>Activity</Th>
            <Th>Project</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <EmptyRow colSpan={5}>Loading...</EmptyRow>
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={5}>No activities found.</EmptyRow>
          ) : (
            rows.map((a) => (
              <tr key={a.id}>
                <Td left>
                  <Link
                    to={`/project-activities/${a.id}`}
                    className="font-semibold text-gray-900 hover:text-[#0b6e4f] hover:underline"
                  >
                    {a.title}
                  </Link>
                </Td>

                <Td>{a.project?.title || '—'}</Td>
                <Td className="whitespace-nowrap">{formatDate(a.activityDate)}</Td>

                <Td>
                  <span
                    className={`inline-flex items-center gap-2 text-[13px] font-medium px-2.5 py-1.5 rounded-md ${
                      statusStyles[a.status] || ''
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDots[a.status] || 'bg-gray-400'}`} />
                    {statusLabels[a.status] || a.status}
                  </span>
                </Td>

                <Td>
                  <ActionsCell>
                    <IconAction variant="view" title="View" to={`/project-activities/${a.id}`}>
                      <Eye size={16} />
                    </IconAction>
                    <IconAction variant="edit" title="Edit" to={`/project-activities/${a.id}/edit`}>
                      <Pencil size={16} />
                    </IconAction>
                    <IconAction
                      variant="danger"
                      title={deletingId === a.id ? 'Deleting...' : 'Delete'}
                      disabled={deletingId === a.id}
                      onClick={() => remove(a.id)}
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

      <Pagination page={currentPage} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} />
    </ListCard>
  );
}
