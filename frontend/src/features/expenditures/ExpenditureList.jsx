import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US') : '—');

export default function ExpenditureList() {
  const [list, setList] = useState([]);
  const [filterYear, setFilterYear] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (yearFilter = filterYear) => {
    setLoading(true);
    setError('');

    try {
      const params = yearFilter ? { fiscalYear: yearFilter } : {};
      const res = await api.get('/expenditures', { params });
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch the list of expenditures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    load(filterYear);
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this expenditure? The related budget balance will be restored.')) return;

    try {
      await api.delete(`/expenditures/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the expenditure.');
    }
  };

  const totalAmount = list.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="font-serif max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Expenditures</h1>
        </div>

        <Link
          to="/expenditures/create"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + Record New Expenditure
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* SUMMARY */}
      <div className="bg-white border rounded-xl p-5 shadow-sm mb-6 max-w-xs">
        <p className="text-sm text-black">Total Expenditures Shown</p>
        <p className="text-2xl font-bold text-black mt-1">TZS {currency(totalAmount)}</p>
      </div>

      {/* FISCAL YEAR FILTER (VIA BUDGET) */}
      <form onSubmit={handleFilter} className="flex items-center gap-3 mb-4">
        <input
          placeholder="Filter by Fiscal Year (e.g. 2025/2026)"
          className="border rounded-md px-3 py-2 text-sm w-72 text-black"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        />
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-4 py-2 rounded-md">
          Filter
        </button>
        {filterYear && (
          <button
            type="button"
            className="text-sm text-black hover:underline"
            onClick={() => {
              setFilterYear('');
              load('');
            }}
          >
            Clear Filter
          </button>
        )}
      </form>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-black text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Request (Tracking No.)</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Fiscal Year</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Recorded By</th>
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
                <td className="px-4 py-4 text-black" colSpan={7}>No expenditures recorded yet.</td>
              </tr>
            ) : (
              list.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-black">{formatDate(e.expenditureDate)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/expenditures/${e.id}`} className="text-black hover:underline font-medium">
                      {e.request?.trackingNumber || '—'}
                    </Link>
                    <div className="text-xs text-black">{e.request?.title}</div>
                  </td>
                  <td className="px-4 py-3 text-black">{e.budget?.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-black">{e.budget?.fiscalYear || '—'}</td>
                  <td className="px-4 py-3 font-medium text-black">TZS {currency(e.amount)}</td>
                  <td className="px-4 py-3 text-black">{e.recordedBy?.fullName || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link to={`/expenditures/${e.id}`} className="text-black hover:underline text-xs font-medium">
                        View
                      </Link>
                      <Link to={`/expenditures/${e.id}/edit`} className="text-black hover:underline text-xs font-medium">
                        Edit
                      </Link>
                      <button
                        onClick={() => remove(e.id)}
                        className="text-red-600 hover:underline text-xs font-medium"
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
