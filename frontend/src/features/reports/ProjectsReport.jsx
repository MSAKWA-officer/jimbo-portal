import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const statusLabels = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

const activityStatusLabels = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const empty = { total: 0, byStatus: [], byCategory: [], totalActivities: 0, activitiesByStatus: [], projects: [] };

export default function ProjectsReport() {
  const [report, setReport] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (catId = categoryId) => {
    setLoading(true);
    setError('');
    try {
      const params = catId ? { categoryId: catId } : {};
      const res = await api.get('/reports/projects', { params });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    load(categoryId);
  };

  const findStatusCount = (arr, status) => {
    const found = arr.find((r) => r.status === status);
    return found ? found.count : 0;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <Link to="/reports" className="text-xs text-black hover:underline">&larr; Back to Reports</Link>
          <h1 className="text-2xl font-bold text-black mt-1">Projects Report</h1>
          <p className="text-sm text-black mt-1">Projects by status, category, and their activities.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          🖨️ Print Report
        </button>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black">Projects Report</h1>
        <p className="text-sm text-black">Generated: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      {error && <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>}

      {/* FILTER */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3 mb-6 no-print">
        <div>
          <label className="block text-xs text-black mb-1">Category</label>
          <select
            className="border rounded-md px-3 py-2 text-sm w-64 text-black"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-4 py-2 rounded-md">
          Filter
        </button>
      </form>

      {loading ? (
        <p className="text-black py-6">Loading...</p>
      ) : (
        <div className="space-y-8">

          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Total Projects</p>
              <p className="text-3xl font-bold text-[#0B2A4A] mt-1">{report.total}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Ongoing</p>
              <p className="text-3xl font-bold text-yellow-700 mt-1">{findStatusCount(report.byStatus, 'ongoing')}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Completed</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{findStatusCount(report.byStatus, 'completed')}</p>
            </div>
          </div>

          {/* BY STATUS */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">Projects by Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statusLabels).map(([key, label]) => (
                <div key={key} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <p className="text-sm text-black">{label}</p>
                  <p className="text-2xl font-bold text-black mt-1">{findStatusCount(report.byStatus, key)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BY CATEGORY */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">Projects by Category</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-black text-left">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Number of Projects</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.byCategory.length === 0 ? (
                    <tr><td className="px-4 py-4 text-black" colSpan={2}>No data.</td></tr>
                  ) : (
                    report.byCategory.map((c) => (
                      <tr key={c.categoryName}>
                        <td className="px-4 py-3 font-medium text-black">{c.categoryName}</td>
                        <td className="px-4 py-3 text-black">{c.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVITIES SUMMARY */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">
              Project Activities (Total: {report.totalActivities})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(activityStatusLabels).map(([key, label]) => (
                <div key={key} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <p className="text-sm text-black">{label}</p>
                  <p className="text-2xl font-bold text-black mt-1">
                    {findStatusCount(report.activitiesByStatus, key)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PROJECT LIST */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">List of Projects</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-black text-left">
                  <tr>
                    <th className="px-4 py-3">Project Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.projects.length === 0 ? (
                    <tr><td className="px-4 py-4 text-black" colSpan={6}>No projects.</td></tr>
                  ) : (
                    report.projects.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-medium text-black">
                          <Link to={`/projects/${p.id}`} className="text-[#0B2A4A] hover:underline no-print-link">
                            {p.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-black">{p.categoryName || '—'}</td>
                        <td className="px-4 py-3 text-black">{statusLabels[p.status] || p.status}</td>
                        <td className="px-4 py-3 text-black">{p.location || '—'}</td>
                        <td className="px-4 py-3 text-black">{p.startDate || '—'}</td>
                        <td className="px-4 py-3 text-black">{p.endDate || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
