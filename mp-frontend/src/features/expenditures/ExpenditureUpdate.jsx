import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function ExpenditureUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expenditure, setExpenditure] = useState(null);

  const [form, setForm] = useState({
    amount: '',
    expenditureDate: '',
    description: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/expenditures/${id}`);
      const e = res.data;

      setExpenditure(e);
      setForm({
        amount: e.amount ?? '',
        expenditureDate: e.expenditureDate ? e.expenditureDate.slice(0, 10) : '',
        description: e.description || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the expenditure details.');
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
      await api.put(`/expenditures/${id}`, {
        amount: Number(form.amount),
        expenditureDate: form.expenditureDate,
        description: form.description || undefined,
      });

      navigate('/expenditures');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the expenditure.');
    } finally {
      setSubmitting(false);
    }
  };

  const allocated = expenditure?.budget ? Number(expenditure.budget.allocatedAmount) : 0;
  const spent = expenditure?.budget ? Number(expenditure.budget.spentAmount) : 0;
  // Balance excluding this expenditure itself (so the user sees the real room to change the amount)
  const remainingExcludingThis = allocated - (spent - Number(expenditure?.amount || 0));

  return (
    <div className="font-serif max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Edit Expenditure</h1>

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

          {/* REQUEST/BUDGET INFO (READ ONLY) */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-xs text-black mb-1">Request</p>
            <p className="text-sm font-medium text-black mb-3">
              {expenditure?.request?.trackingNumber} — {expenditure?.request?.title}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-black">Category / Fiscal Year</p>
                <p className="font-medium text-black">
                  {expenditure?.budget?.category?.name} — {expenditure?.budget?.fiscalYear}
                </p>
              </div>
              <div>
                <p className="text-xs text-black">Remaining Balance (with new amount)</p>
                <p
                  className={`font-medium ${
                    remainingExcludingThis - Number(form.amount || 0) < 0 ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  TZS {currency(remainingExcludingThis - Number(form.amount || 0))}
                </p>
              </div>
            </div>

            <p className="text-xs text-black mt-3">
              The request and budget cannot be changed here. To change them, delete this expenditure and record a new one.
            </p>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount Spent (TZS)"
              required
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />

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
              {submitting ? 'Updating...' : 'Save Changes'}
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
