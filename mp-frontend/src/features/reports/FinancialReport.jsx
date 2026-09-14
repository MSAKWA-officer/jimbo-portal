import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const methodLabels = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  cheque: 'Cheque',
};

const empty = {
  totalAllocated: 0,
  totalSpent: 0,
  totalRemaining: 0,
  totalExpenditures: 0,
  totalPaymentsRecorded: 0,
  expenditureCount: 0,
  paymentCount: 0,
  byCategory: [],
  paymentsByMethod: [],
  availableFiscalYears: [],
};

export default function FinancialReport() {
  const [report, setReport] = useState(empty);
  const [fiscalYear, setFiscalYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (year = fiscalYear) => {
    setLoading(true);
    setError('');
    try {
      const params = year ? { fiscalYear: year } : {};
      const res = await api.get('/reports/financial', { params });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load financial report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    load(fiscalYear);
  };

  const percentUsed =
    report.totalAllocated > 0
      ? Math.min(100, Math.round((report.totalSpent / report.totalAllocated) * 100))
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <Link to="/reports" className="text-xs text-black hover:underline">&larr; Back to Reports</Link>
          <h1 className="text-2xl font-bold text-black mt-1">Financial Report</h1>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          🖨️ Print Report
        </button>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black">Financial Report {fiscalYear ? `— ${fiscalYear}` : ''}</h1>
        <p className="text-sm text-black">Generated: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      {error && <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>}

      {/* FILTER */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3 mb-6 no-print">
        <div>
          <label className="block text-xs text-black mb-1">Fiscal Year</label>
          <select
            className="border rounded-md px-3 py-2 text-sm w-64 text-black"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
          >
            <option value="">All Years</option>
            {report.availableFiscalYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-4 py-2 rounded-md">
          Filter
        </button>
      </form>

      {loading ? (
        <p className="text-black py-6">Loading...</p>
      ) : (
        <div className="space-y-8">

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Allocated</p>
              <p className="text-2xl font-bold text-[#0B2A4A] mt-1">TZS {currency(report.totalAllocated)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Spent</p>
              <p className="text-2xl font-bold text-black mt-1">TZS {currency(report.totalSpent)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Balance</p>
              <p className={`text-2xl font-bold mt-1 ${report.totalRemaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
                TZS {currency(report.totalRemaining)}
              </p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-black">Percentage of Budget Used</p>
              <p className="text-sm font-medium text-black">{percentUsed}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-[#0B2A4A] h-2.5 rounded-full" style={{ width: `${percentUsed}%` }} />
            </div>
          </div>

          {/* EXPENDITURE / PAYMENT COUNTS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Number of Expenditures</p>
              <p className="text-2xl font-bold text-black mt-1">{report.expenditureCount}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Total Expenditures</p>
              <p className="text-2xl font-bold text-black mt-1">TZS {currency(report.totalExpenditures)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Number of Payments</p>
              <p className="text-2xl font-bold text-black mt-1">{report.paymentCount}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Total Payments</p>
              <p className="text-2xl font-bold text-black mt-1">TZS {currency(report.totalPaymentsRecorded)}</p>
            </div>
          </div>

          {/* BY CATEGORY TABLE */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">Budget by Category</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-black text-left">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Fiscal Year</th>
                    <th className="px-4 py-3">Allocated</th>
                    <th className="px-4 py-3">Spent</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">% Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.byCategory.length === 0 ? (
                    <tr><td className="px-4 py-4 text-black" colSpan={6}>No data.</td></tr>
                  ) : (
                    report.byCategory.map((b, idx) => (
                      <tr key={`${b.categoryId}-${b.fiscalYear}-${idx}`}>
                        <td className="px-4 py-3 font-medium text-black">{b.categoryName}</td>
                        <td className="px-4 py-3 text-black">{b.fiscalYear}</td>
                        <td className="px-4 py-3 text-black">TZS {currency(b.allocatedAmount)}</td>
                        <td className="px-4 py-3 text-black">TZS {currency(b.spentAmount)}</td>
                        <td className={`px-4 py-3 font-medium ${b.remainingAmount < 0 ? 'text-red-600' : 'text-green-700'}`}>
                          TZS {currency(b.remainingAmount)}
                        </td>
                        <td className="px-4 py-3 text-black">{b.percentUsed}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAYMENTS BY METHOD */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">Payments by Method</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-black text-left">
                  <tr>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Count</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.paymentsByMethod.length === 0 ? (
                    <tr><td className="px-4 py-4 text-black" colSpan={3}>No data.</td></tr>
                  ) : (
                    report.paymentsByMethod.map((p) => (
                      <tr key={p.method}>
                        <td className="px-4 py-3 font-medium text-black">{methodLabels[p.method] || p.method}</td>
                        <td className="px-4 py-3 text-black">{p.count}</td>
                        <td className="px-4 py-3 text-black">TZS {currency(p.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
