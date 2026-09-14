import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const statusLabels = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const empty = { total: 0, byStatus: [], byPriority: [], byCategory: [], byMonth: [], avgResolutionDays: null };

export default function RequestsReport() {
  const [report, setReport] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', categoryId: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (f = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (f.startDate) params.startDate = f.startDate;
      if (f.endDate) params.endDate = f.endDate;
      if (f.categoryId) params.categoryId = f.categoryId;
      if (f.status) params.status = f.status;

      const res = await api.get('/reports/requests', { params });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findCount = (arr, key, value) => {
    const found = arr.find((r) => r[key] === value);
    return found ? found.count : 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    load(filters);
  };

  const clearFilters = () => {
    const cleared = { startDate: '', endDate: '', categoryId: '', status: '' };
    setFilters(cleared);
    load(cleared);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <Link to="/reports" className="text-xs text-black hover:underline">&larr; Back to Reports</Link>
          <h1 className="text-2xl font-bold text-black mt-1">Requests Report</h1>
          <p className="text-sm text-black mt-1">Summary of requests by status, priority, category, and time.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          🖨️ Print Report
        </button>
      </div>

      {/* PRINT-ONLY TITLE */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black">Requests Report</h1>
        <p className="text-sm text-black">Generated: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      {error && <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>}

      {/* FILTERS */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 no-print">
        <div>
          <label className="block text-xs text-black mb-1">Start Date</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 text-sm w-full text-black"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-black mb-1">End Date</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 text-sm w-full text-black"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-black mb-1">Category</label>
          <select
            className="border rounded-md px-3 py-2 text-sm w-full text-black"
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-black mb-1">Status</label>
          <select
            className="border rounded-md px-3 py-2 text-sm w-full text-black"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-4 py-2 rounded-md w-full">
            Filter
          </button>
          <button type="button" onClick={clearFilters} className="text-sm text-black hover:underline whitespace-nowrap">
            Clear
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-black py-6">Loading...</p>
      ) : (
        <div className="space-y-8">

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Total Requests</p>
              <p className="text-3xl font-bold text-[#0B2A4A] mt-1">{report.total}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Completed</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{findCount(report.byStatus, 'status', 'completed')}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Pending/In Review</p>
              <p className="text-3xl font-bold text-yellow-700 mt-1">
                {findCount(report.byStatus, 'status', 'pending') + findCount(report.byStatus, 'status', 'in_review')}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Average Days to Resolve</p>
              <p className="text-3xl font-bold text-black mt-1">
                {report.avgResolutionDays !== null ? report.avgResolutionDays : '—'}
              </p>
            </div>
          </div>

          {/* BY STATUS */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">By Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statusLabels).map(([key, label]) => (
                <div key={key} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <p className="text-sm text-black">{label}</p>
                  <p className="text-2xl font-bold text-black mt-1">{findCount(report.byStatus, 'status', key)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BY PRIORITY */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">By Priority</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(priorityLabels).map(([key, label]) => (
                <div key={key} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <p className="text-sm text-black">{label}</p>
                  <p className="text-2xl font-bold text-black mt-1">{findCount(report.byPriority, 'priority', key)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BY CATEGORY TABLE */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">By Category</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-black text-left">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Number of Requests</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.byCategory.length === 0 ? (
                    <tr><td className="px-4 py-4 text-black" colSpan={2}>No data.</td></tr>
                  ) : (
                    report.byCategory.map((c) => (
                      <tr key={c.categoryId ?? c.categoryName}>
                        <td className="px-4 py-3 font-medium text-black">{c.categoryName}</td>
                        <td className="px-4 py-3 text-black">{c.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BY MONTH TABLE */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">Monthly Trend</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-black text-left">
                  <tr>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Number of Requests</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.byMonth.length === 0 ? (
                    <tr><td className="px-4 py-4 text-black" colSpan={2}>No data.</td></tr>
                  ) : (
                    report.byMonth.map((m) => (
                      <tr key={m.month}>
                        <td className="px-4 py-3 font-medium text-black">{m.month}</td>
                        <td className="px-4 py-3 text-black">{m.count}</td>
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
