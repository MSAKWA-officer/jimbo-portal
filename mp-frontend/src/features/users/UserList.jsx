import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';

const roleStyles = {
  admin: 'bg-purple-100 text-purple-700',
  staff: 'bg-blue-100 text-blue-700',
  secretary: 'bg-teal-100 text-teal-700',
  officer: 'bg-indigo-100 text-indigo-700',
  citizen: 'bg-gray-100 text-black',
};

const roleLabels = {
  admin: 'Admin',
  staff: 'Staff',
  secretary: 'Secretary',
  officer: 'Officer',
  citizen: 'Citizen',
};

export default function UserList() {
  const { user: currentUser } = useAuth();

  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');

    const params = {};
    if (search.trim()) params.search = search.trim();
    if (filterRole) params.role = filterRole;
    if (filterActive) params.isActive = filterActive;

    try {
      const res = await api.get('/users', { params });
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the list of users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterRole, filterActive]);

  // Deactivate account (DELETE /users/:id - does not delete, only sets isActive: false)
  const handleDeactivate = async (u) => {
    const confirmed = window.confirm(`Are you sure you want to deactivate "${u.fullName}"'s account?`);
    if (!confirmed) return;

    setError('');
    setBusyId(u.id);
    try {
      await api.delete(`/users/${u.id}`);
      setList((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: false } : x)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate the account.');
    } finally {
      setBusyId(null);
    }
  };

  // Reactivate a previously deactivated account
  const handleReactivate = async (u) => {
    setError('');
    setBusyId(u.id);
    try {
      await api.put(`/users/${u.id}`, { isActive: true });
      setList((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: true } : x)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reactivate the account.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm [&_*]:!text-[16px]"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">Users</h1>
        </div>

        <Link
          to="/users/create"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + Add User
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <input
          placeholder="Search by name or email..."
          className="border rounded-md px-4 py-2.5"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded-md px-4 py-2.5"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">-- All Roles --</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="secretary">Secretary</option>
          <option value="officer">Officer</option>
          <option value="citizen">Citizen</option>
        </select>

        <select
          className="border rounded-md px-4 py-2.5"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
        >
          <option value="">-- All Statuses --</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-black text-left">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={6}>Loading...</td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={6}>No users found.</td>
              </tr>
            ) : (
              list.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-4 font-medium text-black">
                    {u.fullName}
                    {currentUser?.id === u.id && (
                      <span className="ml-2 text-[11px] text-black">(You)</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-black">{u.email}</td>
                  <td className="px-5 py-4 text-black">{u.phone || '-'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleStyles[u.role] || 'bg-gray-100 text-black'}`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/users/${u.id}/edit`}
                        className="text-[#0B2A4A] hover:underline text-xs font-medium"
                      >
                        Edit
                      </Link>

                      {u.isActive ? (
                        <button
                          onClick={() => handleDeactivate(u)}
                          disabled={busyId === u.id || currentUser?.id === u.id}
                          title={currentUser?.id === u.id ? 'You cannot deactivate your own account' : ''}
                          className="text-red-600 hover:underline text-xs font-medium disabled:text-gray-300"
                        >
                          {busyId === u.id ? 'Deactivating...' : 'Delete/Deactivate'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(u)}
                          disabled={busyId === u.id}
                          className="text-green-600 hover:underline text-xs font-medium disabled:text-gray-300"
                        >
                          {busyId === u.id ? 'Reactivating...' : 'Reactivate'}
                        </button>
                      )}
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
