import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const statusLabels = {
  pending: 'Awaiting Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const typeLabels = {
  barua: 'Letter',
  ripoti: 'Report',
  hati: 'Document',
  nyingine: 'Other',
};

export default function DocumentList() {
  const [list, setList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/documents', {
        params: {
          status: statusFilter || undefined,
          documentType: typeFilter || undefined,
          search: search || undefined,
        },
      });

      setList(data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load the list of documents.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Documents for Approval
          </h1>

          <p className="text-base text-black mt-1">
            Letters, documents and reports shared for approval.
          </p>
        </div>

        <Link
          to="/documents/upload"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-base font-medium px-4 py-2 rounded-md"
        >
          + Share New Document
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* SEARCH */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or file name..."
          className="flex-1 border rounded-md px-3 py-2 text-base text-black"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-base text-black"
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

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
            !statusFilter ? 'bg-[#0B2A4A] text-white' : 'bg-gray-100 text-black'
          }`}
        >
          All
        </button>

        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`text-base px-3 py-1.5 rounded-md ${
              statusFilter === key ? 'bg-[#0B2A4A] text-white' : 'bg-gray-100 text-black'
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
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Shared By</th>
              <th className="px-4 py-3">Status</th>
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
                <td className="px-4 py-4 text-black" colSpan={6}>No documents yet.</td>
              </tr>
            ) : (
              list.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-4 py-3 font-semibold text-black">{doc.title}</td>

                  <td className="px-4 py-3 text-black">
                    {typeLabels[doc.documentType] || doc.documentType}
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-black text-sm">📎 {doc.fileName}</span>
                  </td>

                  <td className="px-4 py-3 text-black">
                    {doc.uploadedBy?.fullName || '-'}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium px-2 py-1 rounded-md ${statusColors[doc.status]}`}>
                      {statusLabels[doc.status]}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      to={`/documents/${doc.id}`}
                      className="text-[#0B2A4A] hover:underline text-sm font-semibold"
                    >
                      Open / Approve
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
