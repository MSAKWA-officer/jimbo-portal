import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const genderLabels = { me: 'Male', ke: 'Female' };

const empty = { total: 0, byGender: [], byRegion: [], byDistrict: [], topRequesters: [] };

export default function ConstituentsReport() {
  const [report, setReport] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/reports/constituents');
        setReport(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load constituents report.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <Link to="/reports" className="text-xs text-black hover:underline">&larr; Back to Reports</Link>
          <h1 className="text-2xl font-bold text-black mt-1">Constituents Report</h1>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          🖨️ Print Report
        </button>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black">Constituents Report</h1>
        <p className="text-sm text-black">Generated: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      {error && <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>}

      {loading ? (
        <p className="text-black py-6">Loading...</p>
      ) : (
        <div className="space-y-8">

          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-black">Total Constituents</p>
              <p className="text-3xl font-bold text-[#0B2A4A] mt-1">{report.total}</p>
            </div>
            {report.byGender.map((g) => (
              <div key={g.gender} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <p className="text-sm text-black">{genderLabels[g.gender] || g.gender}</p>
                <p className="text-3xl font-bold text-black mt-1">{g.count}</p>
              </div>
            ))}
          </div>

          {/* BY REGION */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">By Region</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-black text-left">
                  <tr>
                    <th className="px-4 py-3">Region</th>
                    <th className="px-4 py-3">Number of Constituents</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.byRegion.length === 0 ? (
                    <tr><td className="px-4 py-4 text-black" colSpan={2}>No data.</td></tr>
                  ) : (
                    report.byRegion.map((r) => (
                      <tr key={r.region}>
                        <td className="px-4 py-3 font-medium text-black">{r.region}</td>
                        <td className="px-4 py-3 text-black">{r.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BY DISTRICT */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">By District</h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-black text-left">
                  <tr>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Number of Constituents</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.byDistrict.length === 0 ? (
                    <tr><td className="px-4 py-4 text-black" colSpan={2}>No data.</td></tr>
                  ) : (
                    report.byDistrict.map((d) => (
                      <tr key={d.district}>
                        <td className="px-4 py-3 font-medium text-black">{d.district}</td>
                        <td className="px-4 py-3 text-black">{d.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOP REQUESTERS */}
          <div>
            <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-3">
              Frequent Requesters (Top 10)
            </h2>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-black text-left">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Number of Requests</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.topRequesters.length === 0 ? (
                    <tr><td className="px-4 py-4 text-black" colSpan={3}>No data.</td></tr>
                  ) : (
                    report.topRequesters.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-3 font-medium text-black">
                          <Link to={`/constituents/${c.id}/edit`} className="text-[#0B2A4A] hover:underline">
                            {c.fullName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-black">{c.phone || '—'}</td>
                        <td className="px-4 py-3 text-black">{c.requestCount}</td>
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
