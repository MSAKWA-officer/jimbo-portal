import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function BudgetList() {
  const [list, setList] = useState([]);
  const [filterYear, setFilterYear] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (yearFilter = filterYear) => {
    setLoading(true);
    setError('');

    try {
      const params = yearFilter ? { fiscalYear: yearFilter } : {};
      const res = await api.get('/budgets', { params });
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch the list of budgets.');
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
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      await api.delete(`/budgets/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the budget.');
    }
  };

  const totalAllocated = list.reduce((sum, b) => sum + Number(b.allocatedAmount), 0);
  const totalSpent = list.reduce((sum, b) => sum + Number(b.spentAmount || 0), 0);

  return (
    <div className="font-serif max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Budgets</h1>
          <p className="text-sm text-black mt-1">
            Management of budgets allocated for each category and fiscal year.
          </p>
        </div>

        <Link
          to="/budgets/create"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + Allocate New Budget
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-black">Total Allocated</p>
          <p className="text-2xl font-bold text-black mt-1">TZS {currency(totalAllocated)}</p>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-black">Total Spent</p>
          <p className="text-2xl font-bold text-black mt-1">TZS {currency(totalSpent)}</p>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-black">Balance</p>
          <p className={`text-2xl font-bold mt-1 ${totalAllocated - totalSpent < 0 ? 'text-red-600' : 'text-green-700'}`}>
            TZS {currency(totalAllocated - totalSpent)}
          </p>
        </div>
      </div>

      {/* FISCAL YEAR FILTER */}
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
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Fiscal Year</th>
              <th className="px-4 py-3">Allocated</th>
              <th className="px-4 py-3">Spent</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Created By</th>
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
                <td className="px-4 py-4 text-black" colSpan={7}>No budgets allocated yet.</td>
              </tr>
            ) : (
              list.map((b) => {
                const allocated = Number(b.allocatedAmount);
                const spent = Number(b.spentAmount || 0);
                const remaining = allocated - spent;

                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-black">
                      <Link to={`/budgets/${b.id}`} className="text-black hover:underline">
                        {b.category?.name || '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-black">{b.fiscalYear}</td>
                    <td className="px-4 py-3 text-black">TZS {currency(allocated)}</td>
                    <td className="px-4 py-3 text-black">TZS {currency(spent)}</td>
                    <td className={`px-4 py-3 font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
                      TZS {currency(remaining)}
                    </td>
                    <td className="px-4 py-3 text-black">{b.createdBy?.fullName || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/budgets/${b.id}`} className="text-black hover:underline text-xs font-medium">
                          View
                        </Link>
                        <Link to={`/budgets/${b.id}/edit`} className="text-black hover:underline text-xs font-medium">
                          Edit
                        </Link>
                        <button
                          onClick={() => remove(b.id)}
                          className="text-red-600 hover:underline text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
