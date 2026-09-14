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

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-200 text-black',
};

export default function ApplicationList() {
  const [list, setList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/requests', {
        params: {
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });

      setList(data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load the list of applications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/requests/${id}/status`, { status });
      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to change the status of the application.'
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Applications
          </h1>
        </div>

        <Link
          to="/applications/create"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-base font-medium px-4 py-2 rounded-md"
        >
          + New Application
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* SEARCH */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex gap-2 mb-4"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or tracking number..."
          className="flex-1 border rounded-md px-3 py-2 text-base text-black"
        />

        <button
          type="submit"
          className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-4 py-2 rounded-md"
        >
          Search
        </button>
      </form>

      {/* STATUS FILTER */}
      <div className="flex gap-2 mb-4 flex-wrap">

        <button
          onClick={() => setStatusFilter('')}
          className={`text-base px-3 py-1.5 rounded-md ${
            !statusFilter
              ? 'bg-[#0B2A4A] text-white'
              : 'bg-gray-100 text-black'
          }`}
        >
          All
        </button>

        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`text-base px-3 py-1.5 rounded-md ${
              statusFilter === key
                ? 'bg-[#0B2A4A] text-white'
                : 'bg-gray-100 text-black'
            }`}
          >
            {label}
          </button>
        ))}

      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">

        <table className="w-full text-base">

          <thead className="bg-gray-50 text-black text-left">
            <tr>
              <th className="px-4 py-3">Tracking No.</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Constituent</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Letter</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {loading ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={7}>
                  No applications yet.
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr key={r.id}>

                  <td className="px-4 py-3 font-mono text-sm text-black">
                    {r.trackingNumber}
                  </td>

                  <td className="px-4 py-3 font-semibold text-black">
                    {r.title}
                  </td>

                  <td className="px-4 py-3 text-black">
                    {r.constituent?.fullName || '-'}
                  </td>

                  <td className="px-4 py-3 text-black">
                    {r.category?.name || '-'}
                  </td>

                  <td className="px-4 py-3">
                    {r.identificationLetterName ? (
                      <span className="text-green-700 text-sm font-medium">
                        📄 Present
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm">
                        Missing
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => changeStatus(r.id, e.target.value)}
                      className={`text-sm font-medium px-2 py-1 rounded-md border-0 ${
                        statusColors[r.status]
                      }`}
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      to={`/applications/${r.id}/edit`}
                      className="text-[#0B2A4A] hover:underline text-sm font-semibold"
                    >
                      Edit
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
