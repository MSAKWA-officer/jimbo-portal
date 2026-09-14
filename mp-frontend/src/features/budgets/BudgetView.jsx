import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const formatDateTime = (d) => (d ? new Date(d).toLocaleString('en-US') : '—');

export default function BudgetView() {
  const { id } = useParams();

  const [budget, setBudget] = useState(null);
  const [records, setRecords] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [recordsError, setRecordsError] = useState('');
  const [recordsLoading, setRecordsLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/budgets/${id}`);
      setBudget(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budget details.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    setRecordsLoading(true);
    setRecordsError('');

    try {
      // All expenditures recorded against this budget -
      // shows the amount spent and what it was for (description/request).
      const res = await api.get('/expenditures', { params: { budgetId: id } });
      setRecords(res.data);
    } catch (err) {
      setRecordsError(err.response?.data?.message || 'Failed to load expenditure records.');
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const removeRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this expenditure record? The budget balance will be restored.')) return;

    try {
      await api.delete(`/expenditures/${recordId}`);
      await Promise.all([load(), loadRecords()]);
    } catch (err) {
      setRecordsError(err.response?.data?.message || 'Failed to delete the record.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Budget not found.'}
        </div>
        <Link to="/budgets" className="text-sm text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  const allocated = Number(budget.allocatedAmount);
  const spent = Number(budget.spentAmount);
  const remaining = allocated - spent;
  const percent = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
  const recordsTotal = records.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Budget for {budget.category?.name || '—'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fiscal Year: {budget.fiscalYear}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/budgets/${budget.id}/edit`}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Edit Budget
          </Link>
          <Link to="/budgets" className="text-sm text-[#0B2A4A] hover:underline">
            &larr; Back
          </Link>
        </div>
      </div>

      {/* FINANCIAL SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Allocated</p>
          <p className="text-2xl font-bold text-[#0B2A4A] mt-1">TZS {currency(allocated)}</p>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Spent</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">TZS {currency(spent)}</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
            <div
              className={`h-1.5 rounded-full ${percent >= 100 ? 'bg-red-500' : 'bg-[#0B2A4A]'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Remaining Balance</p>
          <p className={`text-2xl font-bold mt-1 ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
            TZS {currency(remaining)}
          </p>
        </div>
      </div>

      {budget.notes && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Budget Notes</h2>
          <p className="text-sm text-gray-700 border rounded-lg p-4 whitespace-pre-wrap">{budget.notes}</p>
        </div>
      )}

      {/* EXPENDITURE RECORDS SECTION - shows the amount spent and what it was for */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Expenditure Records</h2>
            <p className="text-sm text-gray-500 mt-1">
              Every amount spent under the{' '}
              <span className="font-medium">{budget.category?.name || 'this'}</span> category and what it was used for.
            </p>
          </div>

          <Link
            to="/expenditures/create"
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md whitespace-nowrap"
          >
            + Record New Expenditure
          </Link>
        </div>

        {recordsError && (
          <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{recordsError}</div>
        )}

        <div className="bg-gray-50 border rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Number of Records: {records.length}</span>
          <span className="text-sm font-semibold text-gray-800">
            Total Recorded: TZS {currency(recordsTotal)}
          </span>
        </div>

        <div className="border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Item / Description</th>
                <th className="px-4 py-3">Request (Tracking No.)</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Recorded By</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {recordsLoading ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={6}>Loading records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={6}>
                    No expenditure records yet for this budget.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.expenditureDate)}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">
                        {r.description || <span className="text-gray-400">No description</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Recorded: {formatDateTime(r.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/expenditures/${r.id}`}
                        className="text-[#0B2A4A] hover:underline font-medium"
                      >
                        {r.request?.trackingNumber || '—'}
                      </Link>
                      <div className="text-xs text-gray-500">{r.request?.title}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      TZS {currency(r.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.recordedBy?.fullName || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/expenditures/${r.id}`}
                          className="text-gray-600 hover:underline text-xs font-medium"
                        >
                          View
                        </Link>
                        <Link
                          to={`/expenditures/${r.id}/edit`}
                          className="text-[#0B2A4A] hover:underline text-xs font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => removeRecord(r.id)}
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
    </div>
  );
}
