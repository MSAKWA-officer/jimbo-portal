import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const actionStyles = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-blue-100 text-blue-700',
  logout: 'bg-gray-100 text-gray-500',
};

const actionLabels = {
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  login: 'Login',
  logout: 'Logout',
};

const entityLabels = {
  Request: 'Request',
  Project: 'Project',
  ProjectActivity: 'Project Activity',
  Budget: 'Budget',
  Expenditure: 'Expenditure',
  Payment: 'Payment',
  Event: 'Event',
  Constituent: 'Constituent',
  RequestCategory: 'Category',
  User: 'User',
};

export default function AuditLogList() {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);

  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (overrides = {}) => {
    setLoading(true);
    setError('');

    const params = {
      action: overrides.action ?? filterAction,
      entityType: overrides.entityType ?? filterEntity,
      userId: overrides.userId ?? filterUser,
      dateFrom: overrides.dateFrom ?? dateFrom,
      dateTo: overrides.dateTo ?? dateTo,
    };

    Object.keys(params).forEach((k) => {
      if (!params[k]) delete params[k];
    });

    try {
      const res = await api.get('/audit-logs', { params });
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch {
        // not critical if this fails; don't block the page
      }
    })();

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterAction = (action) => {
    setFilterAction(action);
    load({ action });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    load();
  };

  const handleReset = () => {
    setFilterAction('');
    setFilterEntity('');
    setFilterUser('');
    setDateFrom('');
    setDateTo('');
    load({ action: '', entityType: '', userId: '', dateFrom: '', dateTo: '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Audit Logs</h1>
          <p className="text-sm text-black mt-1">
            History of all actions performed by users within the system.
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* FILTERS */}
      <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <select
          className="border rounded-md px-3 py-2 text-sm text-black"
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
        >
          <option value="">-- All Entities --</option>
          {Object.entries(entityLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          className="border rounded-md px-3 py-2 text-sm text-black"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        >
          <option value="">-- All Users --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.fullName}</option>
          ))}
        </select>

        <input
          type="date"
          className="border rounded-md px-3 py-2 text-sm text-black"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="From"
        />

        <input
          type="date"
          className="border rounded-md px-3 py-2 text-sm text-black"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="To"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md flex-1"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-3 py-2 rounded-md"
          >
            Clear
          </button>
        </div>
      </form>

      {/* ACTION FILTER */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['', 'create', 'update', 'delete', 'login', 'logout'].map((a) => (
          <button
            key={a || 'all'}
            onClick={() => handleFilterAction(a)}
            className={`text-sm px-3 py-1.5 rounded-md font-medium ${
              filterAction === a
                ? 'bg-[#0B2A4A] text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            {a ? actionLabels[a] : 'All Actions'}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-black text-left">
            <tr>
              <th className="px-4 py-3">Date/Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Description</th>
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
                <td className="px-4 py-4 text-black" colSpan={6}>No logs found.</td>
              </tr>
            ) : (
              list.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-black">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 text-black">{log.user?.fullName || 'System'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${actionStyles[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black">
                    {entityLabels[log.entityType] || log.entityType}
                    {log.entityId ? ` #${log.entityId}` : ''}
                  </td>
                  <td className="px-4 py-3 text-black max-w-xs truncate">{log.description || '—'}</td>
                  <td className="px-4 py-3">
                    <Link to={`/audit-logs/${log.id}`} className="text-[#0B2A4A] hover:underline text-xs font-medium">
                      View
                    </Link>
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
