import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US') : '—');

const statusStyles = {
  planned: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-black',
};

const statusLabels = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function ProjectActivityList() {
  const [searchParams] = useSearchParams();
  const projectIdFilter = searchParams.get('projectId') || '';

  const [list, setList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProject, setFilterProject] = useState(projectIdFilter);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (statusFilter = filterStatus, projectId = filterProject) => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (projectId) params.projectId = projectId;

      const res = await api.get('/project-activities', { params });
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get the list of project activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch {
        // not necessary to stop the page if this fails
      }
    })();

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterStatus = (statusFilter) => {
    setFilterStatus(statusFilter);
    load(statusFilter, filterProject);
  };

  const handleFilterProject = (projectId) => {
    setFilterProject(projectId);
    load(filterStatus, projectId);
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this project activity?')) return;

    try {
      await api.delete(`/project-activities/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the activity.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Project Activities</h1>
          <p className="text-base text-black mt-1">
            Records of activities/events taking place within each project.
          </p>
        </div>

        <Link
          to="/project-activities/create"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-base font-medium px-4 py-2 rounded-md"
        >
          + Add Activity
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* PROJECT FILTER */}
      <div className="flex items-center gap-2 mb-4">
        <select
          className="border rounded-md px-3 py-2 text-base text-black"
          value={filterProject}
          onChange={(e) => handleFilterProject(e.target.value)}
        >
          <option value="">-- All Projects --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* STATUS FILTER */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['', 'planned', 'ongoing', 'completed', 'cancelled'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => handleFilterStatus(s)}
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
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={5}>Loading...</td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={5}>No activities registered yet.</td>
              </tr>
            ) : (
              list.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <Link to={`/project-activities/${a.id}`} className="text-[#0B2A4A] hover:underline font-semibold">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-black">{a.project?.title || '—'}</td>
                  <td className="px-4 py-3 text-black">{formatDate(a.activityDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${statusStyles[a.status]}`}>
                      {statusLabels[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link to={`/project-activities/${a.id}`} className="text-black hover:underline text-sm font-medium">
                        View
                      </Link>
                      <Link to={`/project-activities/${a.id}/edit`} className="text-[#0B2A4A] hover:underline text-sm font-medium">
                        Edit
                      </Link>
                      <button
                        onClick={() => remove(a.id)}
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
