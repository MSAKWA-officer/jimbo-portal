import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const emptyForm = {
  requestId: '',
  budgetId: '',
  amount: '',
  expenditureDate: new Date().toISOString().slice(0, 10),
  description: '',
};

export default function ExpenditureCreate() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [reqRes, budgetRes] = await Promise.all([
          api.get('/requests', { params: { limit: 1000 } }),
          api.get('/budgets'),
        ]);

        // A request can only receive funds once it's approved or completed
        const approvable = (reqRes.data?.data || []).filter((r) =>
          ['approved', 'completed'].includes(r.status)
        );

        setRequests(approvable);
        setBudgets(budgetRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load the data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedRequest = useMemo(
    () => requests.find((r) => String(r.id) === String(form.requestId)),
    [requests, form.requestId]
  );

  // Budgets matching the category of the selected request
  const matchingBudgets = useMemo(() => {
    if (!selectedRequest) return [];
    return budgets.filter((b) => b.categoryId === selectedRequest.categoryId);
  }, [budgets, selectedRequest]);

  const selectedBudget = useMemo(
    () => budgets.find((b) => String(b.id) === String(form.budgetId)),
    [budgets, form.budgetId]
  );

  const remaining = selectedBudget
    ? Number(selectedBudget.allocatedAmount) - Number(selectedBudget.spentAmount)
    : null;

  const handleRequestChange = (requestId) => {
    // If the request changes, clear the selected budget since the category may change
    setForm({ ...form, requestId, budgetId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/expenditures', {
        requestId: form.requestId,
        budgetId: form.budgetId,
        amount: Number(form.amount),
        expenditureDate: form.expenditureDate,
        description: form.description || undefined,
      });

      navigate('/expenditures');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record the expenditure.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-serif max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Record New Expenditure</h1>

        <Link to="/expenditures" className="text-sm text-black hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-black">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Request */}
          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Approved Request
            </label>
            <select
              required
              className="w-full border rounded-md px-3 py-2 text-sm text-black"
              value={form.requestId}
              onChange={(e) => handleRequestChange(e.target.value)}
            >
              <option value="">-- Select Request --</option>
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.trackingNumber} — {r.title} ({r.category?.name})
                </option>
              ))}
            </select>
            {requests.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                There are no approved/completed requests at this time.
              </p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Related Budget (by Category/Fiscal Year)
            </label>
            <select
              required
              disabled={!selectedRequest}
              className="w-full border rounded-md px-3 py-2 text-sm text-black disabled:bg-gray-50"
              value={form.budgetId}
              onChange={(e) => setForm({ ...form, budgetId: e.target.value })}
            >
              <option value="">-- Select Budget --</option>
              {matchingBudgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.fiscalYear} — Balance: TZS {currency(Number(b.allocatedAmount) - Number(b.spentAmount))}
                </option>
              ))}
            </select>
            {selectedRequest && matchingBudgets.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No budget has been allocated for this request's category. Create a budget first.
              </p>
            )}
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount Spent (TZS)"
                required
                className="w-full border rounded-md px-3 py-2 text-sm text-black"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              {selectedBudget && (
                <p className={`text-xs mt-1 ${remaining < Number(form.amount || 0) ? 'text-red-600' : 'text-black'}`}>
                  Budget balance: TZS {currency(remaining)}
                </p>
              )}
            </div>

            <input
              type="date"
              required
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.expenditureDate}
              onChange={(e) => setForm({ ...form, expenditureDate: e.target.value })}
            />
          </div>

          {/* Description */}
          <textarea
            placeholder="Expenditure description (optional)"
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm text-black"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-sm font-medium px-5 py-2.5 rounded-md"
            >
              {submitting ? 'Submitting...' : 'Record Expenditure'}
            </button>

            <Link
              to="/expenditures"
              className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-5 py-2.5 rounded-md"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
