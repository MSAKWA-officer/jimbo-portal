import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function BudgetUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    categoryId: '',
    fiscalYear: '',
    allocatedAmount: '',
    notes: '',
  });

  const [spentAmount, setSpentAmount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [budgetRes, catRes] = await Promise.all([
        api.get(`/budgets/${id}`),
        api.get('/categories'),
      ]);

      const b = budgetRes.data;

      setForm({
        categoryId: b.categoryId || b.category?.id || '',
        fiscalYear: b.fiscalYear || '',
        allocatedAmount: b.allocatedAmount ?? '',
        notes: b.notes || '',
      });

      setSpentAmount(Number(b.spentAmount) || 0);
      setCategories(catRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the budget details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.put(`/budgets/${id}`, {
        categoryId: form.categoryId,
        fiscalYear: form.fiscalYear,
        allocatedAmount: Number(form.allocatedAmount),
        notes: form.notes || undefined,
      });

      navigate('/budgets');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = Number(form.allocatedAmount || 0) - spentAmount;

  return (
    <div className="font-serif max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Edit Budget</h1>

        <Link to="/budgets" className="text-sm text-black hover:underline">
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

          {/* Category */}
          <select
            required
            className="w-full border rounded-md px-3 py-2 text-sm text-black"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">-- Select Category --</option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Fiscal Year + Allocated Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Fiscal Year (e.g. 2025/2026)"
              required
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.fiscalYear}
              onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
            />

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Allocated Amount (TZS)"
              required
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.allocatedAmount}
              onChange={(e) => setForm({ ...form, allocatedAmount: e.target.value })}
            />
          </div>

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm text-black"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {/* SPENDING STATUS (READ ONLY) */}
          <div className="border border-[#0B2A4A]/20 rounded-lg p-4 bg-blue-50/40">
            <p className="text-sm font-semibold text-black mb-2">Spending Status</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-black">Spent</p>
                <p className="font-medium text-black">TZS {currency(spentAmount)}</p>
              </div>
              <div>
                <p className="text-black">Balance (with new amount)</p>
                <p className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
                  TZS {currency(remaining)}
                </p>
              </div>
            </div>

            <p className="text-xs text-black mt-3">
              To record new spending, do so from the budgets list (Record Spend).
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-sm font-medium px-5 py-2.5 rounded-md"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>

            <Link
              to="/budgets"
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
