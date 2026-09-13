import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US') : '—');

const statusStyles = {
  planned: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-black',
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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (statusFilter = filterStatus, searchTerm = search) => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/projects', { params });
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get the list of projects.');
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
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/projects/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the project.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Projects</h1>
      
        </div>

        <Link
          to="/projects/create"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-base font-medium px-4 py-2 rounded-md"
        >
          + Add Project
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <input
          placeholder="Search by project name or location..."
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
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['', 'planned', 'ongoing', 'completed', 'on_hold', 'cancelled'].map((s) => (
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
              <th className="px-4 py-3">Project Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Estimated Cost</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={7}>Loading...</td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={7}>No projects registered yet.</td>
              </tr>
            ) : (
              list.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <Link to={`/projects/${p.id}`} className="text-[#0B2A4A] hover:underline font-semibold">
                      {p.title}
                    </Link>
                    <div className="text-sm text-black">{formatDate(p.startDate)} — {formatDate(p.endDate)}</div>
                  </td>
                  <td className="px-4 py-3 text-black">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-black">{p.location || '—'}</td>
                  <td className="px-4 py-3 text-black">{p.estimatedCost ? `TZS ${currency(p.estimatedCost)}` : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="w-28 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0B2A4A] h-2"
                        style={{ width: `${Math.min(100, Number(p.progressPercentage) || 0)}%` }}
                      />
                    </div>
                    <span className="text-sm text-black">{p.progressPercentage || 0}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${statusStyles[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link to={`/projects/${p.id}`} className="text-black hover:underline text-sm font-medium">
                        View
                      </Link>
                      <Link to={`/projects/${p.id}/edit`} className="text-[#0B2A4A] hover:underline text-sm font-medium">
                        Edit
                      </Link>
                      <button
                        onClick={() => remove(p.id)}
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
