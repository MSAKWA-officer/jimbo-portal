import { useEffect, useState } from 'react';
import api from '../api/axios';

const statusLabels = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

const projectStatusLabels = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

const currency = (n) =>
  `TZS ${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const emptyRequestStats = { total: 0, byStatus: [] };
const emptyBudgetStats = { totalAllocated: 0, totalSpent: 0, totalRemaining: 0 };

export default function Dashboard() {
  const [requestStats, setRequestStats] = useState(emptyRequestStats);
  const [budgetStats, setBudgetStats] = useState(emptyBudgetStats);
  const [constituentsTotal, setConstituentsTotal] = useState(0);
  const [categoriesTotal, setCategoriesTotal] = useState(0);
  const [projects, setProjects] = useState([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [expendituresTotal, setExpendituresTotal] = useState(0);
  const [paymentsTotal, setPaymentsTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      const results = await Promise.allSettled([
        api.get('/requests/stats/summary'),
        api.get('/budgets/stats/summary'),
        api.get('/constituents', { params: { limit: 1 } }),
        api.get('/categories'),
        api.get('/projects'),
        api.get('/events'),
        api.get('/expenditures'),
        api.get('/payments'),
      ]);

      const [
        requestsRes,
        budgetRes,
        constituentsRes,
        categoriesRes,
        projectsRes,
        eventsRes,
        expendituresRes,
        paymentsRes,
      ] = results;

      if (requestsRes.status === 'fulfilled') setRequestStats(requestsRes.value.data);
      if (budgetRes.status === 'fulfilled') setBudgetStats(budgetRes.value.data);
      if (constituentsRes.status === 'fulfilled') setConstituentsTotal(constituentsRes.value.data.total || 0);
      if (categoriesRes.status === 'fulfilled') setCategoriesTotal(categoriesRes.value.data.length || 0);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data || []);
      if (eventsRes.status === 'fulfilled') setEventsTotal(eventsRes.value.data.length || 0);
      if (expendituresRes.status === 'fulfilled') setExpendituresTotal(expendituresRes.value.data.length || 0);
      if (paymentsRes.status === 'fulfilled') setPaymentsTotal(paymentsRes.value.data.length || 0);

      if (results.some((r) => r.status === 'rejected')) {
        setError('Some dashboard information failed to load completely.');
      }

      setLoading(false);
    };

    load();
  }, []);

  const countRequestsFor = (status) => {
    const found = requestStats.byStatus.find((s) => s.status === status);
    return found ? found.count : 0;
  };

  const countProjectsFor = (status) =>
    projects.filter((p) => p.status === status).length;

  const percentBudgetUsed =
    budgetStats.totalAllocated > 0
      ? Math.min(
          100,
          Math.round((budgetStats.totalSpent / budgetStats.totalAllocated) * 100)
        )
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 bg-white border rounded-xl shadow-sm">

      {/* SYSTEM OVERVIEW */}
      <div className="px-2 pt-4 pb-6 border-b">
        <p className="text-sm font-semibold text-black uppercase tracking-wide mb-3">
          System Overview
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-black">
          Citizen Applications System
        </h1>
        <p className="text-base text-black mt-3">
          Current Year: {new Date().getFullYear()}
        </p>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mx-2 mt-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-black px-2 py-6">Loading...</p>
      ) : (
        <div className="px-2 py-6 space-y-8">

          {/* KPI OVERVIEW */}
          <div>
            <h2 className="text-base font-semibold text-black uppercase tracking-wide mb-3">
              Key Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Total Applications</p>
                <p className="text-3xl font-bold text-black mt-1">{requestStats.total}</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Constituents</p>
                <p className="text-3xl font-bold text-black mt-1">{constituentsTotal}</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Categories</p>
                <p className="text-3xl font-bold text-black mt-1">{categoriesTotal}</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Projects</p>
                <p className="text-3xl font-bold text-black mt-1">{projects.length}</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Events</p>
                <p className="text-3xl font-bold text-black mt-1">{eventsTotal}</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Expenditures</p>
                <p className="text-3xl font-bold text-black mt-1">{expendituresTotal}</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Payments</p>
                <p className="text-3xl font-bold text-black mt-1">{paymentsTotal}</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Budget Allocated</p>
                <p className="text-xl font-bold text-black mt-1">{currency(budgetStats.totalAllocated)}</p>
              </div>
            </div>
          </div>

          {/* APPLICATIONS BY STATUS */}
          <div>
            <h2 className="text-base font-semibold text-black uppercase tracking-wide mb-3">
              Applications by Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statusLabels).map(([key, label]) => (
                <div key={key} className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                  <p className="text-base font-medium text-black">{label}</p>
                  <p className="text-3xl font-bold text-black mt-1">{countRequestsFor(key)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BUDGET SUMMARY */}
          <div>
            <h2 className="text-base font-semibold text-black uppercase tracking-wide mb-3">
              Budget Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Allocated</p>
                <p className="text-2xl font-bold text-black mt-1">{currency(budgetStats.totalAllocated)}</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Spent</p>
                <p className="text-2xl font-bold text-black mt-1">{currency(budgetStats.totalSpent)}</p>
              </div>
              <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                <p className="text-base font-medium text-black">Remaining</p>
                <p className="text-2xl font-bold text-black mt-1">{currency(budgetStats.totalRemaining)}</p>
              </div>
            </div>
            <div className="bg-gray-200 border border-gray-300 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-black">Percentage of Budget Used</p>
                <p className="text-base font-semibold text-black">{percentBudgetUsed}%</p>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2.5">
                <div
                  className="bg-brand-600 h-2.5 rounded-full"
                  style={{ width: `${percentBudgetUsed}%` }}
                />
              </div>
            </div>
          </div>

          {/* PROJECTS BY STATUS */}
          <div>
            <h2 className="text-base font-semibold text-black uppercase tracking-wide mb-3">
              Projects by Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(projectStatusLabels).map(([key, label]) => (
                <div key={key} className="bg-gray-200 border border-gray-300 rounded-xl p-5">
                  <p className="text-base font-medium text-black">{label}</p>
                  <p className="text-3xl font-bold text-black mt-1">{countProjectsFor(key)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
