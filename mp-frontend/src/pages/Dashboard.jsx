import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const roleLabels = {
  admin: 'Admin',
  staff: 'Staff',
  citizen: 'Citizen',
  secretary: 'Secretary',
  officer: 'Officer',
  viewer: 'Viewer',
};

// Kisanduku kimoja cha takwimu (label ndogo + namba kubwa)
function StatBox({ label, value, tone, small }) {
  return (
    <div className="border border-[#dfe3e8] bg-white px-4 py-3">
      <p className="text-[13px] text-gray-600">{label}</p>
      <p
        className={`font-bold mt-1 ${small ? 'text-[22px]' : 'text-[30px]'} leading-tight ${
          tone === 'danger' ? 'text-red-700' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-7">
      <h2 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

const GRID = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3';

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
  const { user } = useAuth();
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

  const pending = countRequestsFor('pending');
  const roleLabel = roleLabels[user?.role] || user?.role || '';

  return (
    <div>
      {/* ALERT BANNERS */}
      {error && (
        <div className="mb-4 border border-red-400 bg-[#f2dede] text-[#a94442] px-4 py-3 text-[14px] font-bold uppercase">
          {error}
        </div>
      )}
      {!loading && pending > 0 && (
        <div className="mb-4 border border-red-400 bg-[#f2dede] text-[#a94442] px-4 py-3 text-[14px] font-bold uppercase leading-relaxed">
          <p>Applications status</p>
          <p>
            Attention needed: {pending} pending application{pending === 1 ? '' : 's'}
          </p>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] px-5 py-5">
        <h1 className="text-[24px] font-light text-gray-700">Dashboard</h1>

        <p className="mt-4 text-[15px] text-gray-800">
          Welcome, <strong>{user?.fullName || 'User'}</strong>
        </p>
        <p className="text-[14px] text-gray-500">
          {roleLabel} · Citizen Applications System · {new Date().getFullYear()}
        </p>

        {loading ? (
          <p className="text-gray-500 py-6">Loading...</p>
        ) : (
          <>
            <div className={`${GRID} mt-5`}>
              <StatBox label="Total applications" value={requestStats.total} />
              <StatBox label="Constituents" value={constituentsTotal} />
              <StatBox label="Categories" value={categoriesTotal} />
              <StatBox label="Projects" value={projects.length} />
              <StatBox label="Events" value={eventsTotal} />
              <StatBox label="Expenditures" value={expendituresTotal} />
              <StatBox label="Payments" value={paymentsTotal} />
              <StatBox label="Budget allocated" value={currency(budgetStats.totalAllocated)} small />
            </div>

            <Section title="Applications by status">
              <div className={GRID}>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <StatBox
                    key={key}
                    label={label}
                    value={countRequestsFor(key)}
                    tone={key === 'pending' && countRequestsFor(key) > 0 ? 'danger' : undefined}
                  />
                ))}
              </div>
            </Section>

            <Section title="Budget summary">
              <div className={GRID}>
                <StatBox label="Allocated" value={currency(budgetStats.totalAllocated)} small />
                <StatBox label="Spent" value={currency(budgetStats.totalSpent)} small />
                <StatBox label="Remaining" value={currency(budgetStats.totalRemaining)} small />
              </div>

              <div className="border border-[#dfe3e8] px-4 py-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] text-gray-600">Percentage of budget used</p>
                  <p className="text-[14px] font-bold text-gray-900">{percentBudgetUsed}%</p>
                </div>
                <div className="w-full bg-gray-200 h-2.5">
                  <div className="bg-navy h-2.5" style={{ width: `${percentBudgetUsed}%` }} />
                </div>
              </div>
            </Section>

            <Section title="Projects by status">
              <div className={GRID}>
                {Object.entries(projectStatusLabels).map(([key, label]) => (
                  <StatBox key={key} label={label} value={countProjectsFor(key)} />
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
