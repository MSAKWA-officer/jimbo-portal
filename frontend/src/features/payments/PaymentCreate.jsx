import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const emptyForm = {
  expenditureId: '',
  payeeName: '',
  payeePhone: '',
  amount: '',
  paymentMethod: 'bank_transfer',
  referenceNumber: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function PaymentCreate() {
  const navigate = useNavigate();

  const [expenditures, setExpenditures] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [existingPayments, setExistingPayments] = useState([]);
  const [checkingBalance, setCheckingBalance] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/expenditures')
      .then((res) => setExpenditures(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load expenditures.'))
      .finally(() => setLoading(false));
  }, []);

  const selectedExpenditure = useMemo(
    () => expenditures.find((e) => String(e.id) === String(form.expenditureId)),
    [expenditures, form.expenditureId]
  );

  useEffect(() => {
    if (!form.expenditureId) {
      setExistingPayments([]);
      return;
    }

    setCheckingBalance(true);
    api
      .get('/payments', { params: { expenditureId: form.expenditureId } })
      .then((res) => setExistingPayments(res.data))
      .catch(() => setExistingPayments([]))
      .finally(() => setCheckingBalance(false));
  }, [form.expenditureId]);

  const alreadyAllocated = existingPayments
    .filter((p) => ['pending', 'completed'].includes(p.status))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const remaining = selectedExpenditure
    ? Number(selectedExpenditure.amount) - alreadyAllocated
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/payments', {
        expenditureId: form.expenditureId,
        payeeName: form.payeeName,
        payeePhone: form.payeePhone || undefined,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        referenceNumber: form.referenceNumber || undefined,
        paymentDate: form.paymentDate,
        notes: form.notes || undefined,
      });

      navigate('/payments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record the payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Record New Payment</h1>

        <Link to="/payments" className="text-sm text-black hover:underline">
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

          {/* Expenditure */}
          <div>
            <label className="block text-xs font-medium text-black mb-1">Related Expenditure</label>
            <select
              required
              className="w-full border rounded-md px-3 py-2 text-sm text-black"
              value={form.expenditureId}
              onChange={(e) => setForm({ ...form, expenditureId: e.target.value })}
            >
              <option value="">-- Select Expenditure --</option>
              {expenditures.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.request?.trackingNumber} — TZS {currency(exp.amount)} ({exp.budget?.fiscalYear})
                </option>
              ))}
            </select>
            {expenditures.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No expenditures have been recorded yet.</p>
            )}
          </div>

          {selectedExpenditure && (
            <div className="border rounded-lg p-3 bg-blue-50/40 text-sm">
              <p className="text-black">
                Expenditure Amount: <span className="font-medium">TZS {currency(selectedExpenditure.amount)}</span>
              </p>
              <p className="text-black">
                Already Allocated to Payments: <span className="font-medium">TZS {currency(alreadyAllocated)}</span>
              </p>
              <p className={remaining < 0 ? 'text-red-600 font-medium' : 'text-green-700 font-medium'}>
                Remaining to be Paid: TZS {currency(remaining)}
                {checkingBalance && ' (updating...)'}
              </p>
            </div>
          )}

          {/* Payee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Payee Name"
              required
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.payeeName}
              onChange={(e) => setForm({ ...form, payeeName: e.target.value })}
            />
            <input
              placeholder="Payee Phone Number (optional)"
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.payeePhone}
              onChange={(e) => setForm({ ...form, payeePhone: e.target.value })}
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount (TZS)"
              required
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <input
              type="date"
              required
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.paymentDate}
              onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
            />
          </div>

          {/* Payment Method + Reference Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>

            <input
              placeholder="Reference Number (optional)"
              className="border rounded-md px-3 py-2 text-sm text-black"
              value={form.referenceNumber}
              onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
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
              {submitting ? 'Submitting...' : 'Record Payment'}
            </button>

            <Link
              to="/payments"
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
