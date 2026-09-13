import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const emptyForm = {
  categoryId: '',
  fiscalYear: '',
  allocatedAmount: '',
  notes: '',
};

export default function BudgetCreate() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/budgets', {
        categoryId: form.categoryId,
        fiscalYear: form.fiscalYear,
        allocatedAmount: Number(form.allocatedAmount),
        notes: form.notes || undefined,
      });

      navigate('/budgets');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add the budget.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-serif max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Create New Budget</h1>

        <Link to="/budgets" className="text-sm text-black hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* FORM */}
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

        {/* Fiscal Year + Amount */}
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

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-sm font-medium px-5 py-2.5 rounded-md"
          >
            {submitting ? 'Submitting...' : 'Allocate Budget'}
          </button>

          <Link
            to="/budgets"
            className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-5 py-2.5 rounded-md"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
