import { Link } from 'react-router-dom';
   import PublicLayout from '../components/PublicLayout.jsx';

const Icon = ({ d }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const features = [
  {
    title: 'Request management',
    text: 'Register every request, assign a category, follow it from Pending to Completed and attach supporting letters as PDF.',
    d: 'M9 12h6M9 16h6M7 3h7l5 5v13H7zM14 3v5h5',
  },
  {
    title: 'Constituent records',
    text: 'Keep a clean, searchable register of citizens and see the full history of requests linked to each person.',
    d: 'M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 10a4 4 0 100-8 4 4 0 000 8zM21 20v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8',
  },
  {
    title: 'Projects & activities',
    text: 'Plan development projects, break them into activities and monitor progress from planning to completion.',
    d: 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6',
  },
  {
    title: 'Events & attendance',
    text: 'Schedule community meetings and events, record attendees and keep a reliable attendance history.',
    d: 'M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
  },
  {
    title: 'Budgets & finance',
    text: 'Allocate budgets, record expenditures and payments, and see what is spent and what remains at a glance.',
    d: 'M12 2v20M17 6.5C17 4.6 14.8 3 12 3S7 4.6 7 6.5 9.2 10 12 10s5 1.6 5 3.5S14.8 17 12 17s-5-1.6-5-3.5',
  },
  {
    title: 'Audit trail',
    text: 'Every important action is logged with who did it and when, giving leadership full accountability.',
    d: 'M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4zM9 12l2 2 4-4',
  },
];

const steps = [
  { n: '01', title: 'Receive', text: 'A citizen request is registered with the constituent’s details and category.' },
  { n: '02', title: 'Review', text: 'Staff assess the request, attach documents and update its status.' },
  { n: '03', title: 'Act', text: 'Requests are linked to projects, events or funding and followed through.' },
  { n: '04', title: 'Report', text: 'Dashboards and audit logs show outcomes and how resources were used.' },
];

const roles = [
  { name: 'Admin', text: 'Full control of users, data, finances and audit records.' },
  { name: 'Staff', text: 'Daily work: registering requests, updating projects, events and payments.' },
  { name: 'Viewer', text: 'Read-only access for oversight, review and reporting.' },
];

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B2A4A] via-[#123B63] to-[#1c5490] text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-semibold tracking-wider uppercase bg-white/10 border border-white/20 rounded-full px-3 py-1">
              Transparent · Accountable · Responsive
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight">
              Serving citizens with a system that keeps every promise on record.
            </h1>
            <p className="mt-5 text-lg text-blue-100 leading-relaxed">
              Manage constituent requests, development projects, community events and public funds in one
              secure platform, from the first request to the final report.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="px-6 py-3 rounded-md bg-white text-[#123B63] font-semibold hover:bg-blue-50 transition">
                Sign in to the system
              </Link>
              <Link to="/contacts" className="px-6 py-3 rounded-md border border-white/40 font-semibold hover:bg-white/10 transition">
                Contact the office
              </Link>
            </div>
          </div>

          {/* Status preview card */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-2xl p-6 text-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#123B63]">Request overview</h3>
                <span className="text-xs text-gray-400">Live status flow</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ['Pending', 'bg-amber-100 text-amber-700', 'w-1/4'],
                  ['In review', 'bg-blue-100 text-blue-700', 'w-2/4'],
                  ['Approved', 'bg-emerald-100 text-emerald-700', 'w-3/4'],
                  ['Completed', 'bg-indigo-100 text-indigo-700', 'w-full'],
                ].map(([label, badge, w]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge}`}>{label}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className={`h-2 rounded-full bg-gradient-to-r from-[#123B63] to-[#1c5490] ${w}`} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs text-gray-500">
                Every request moves through a clear, trackable lifecycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#123B63]">Everything the office needs, in one place</h2>
          <p className="mt-3 text-gray-600">
            Six connected modules replace scattered files and spreadsheets with a single source of truth.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
              <span className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <Icon d={f.d} />
              </span>
              <h3 className="mt-4 font-semibold text-lg text-gray-800">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-3xl font-bold text-[#123B63] text-center">How it works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <span className="text-5xl font-extrabold text-brand-100">{s.n}</span>
                <h3 className="mt-1 font-semibold text-lg text-gray-800">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#123B63]">Secure, role-based access</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Each team member sees and does only what their role allows. Sign-in is protected, and sensitive
              actions are recorded in the audit log.
            </p>
          </div>
          <div className="space-y-4">
            {roles.map((r) => (
              <div key={r.name} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <span className="shrink-0 w-10 h-10 rounded-full bg-[#123B63] text-white flex items-center justify-center font-bold">
                  {r.name[0]}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-800">{r.name}</h3>
                  <p className="text-sm text-gray-600">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-2xl bg-gradient-to-r from-[#0B2A4A] to-[#1c5490] text-white px-8 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to work with a clearer picture?</h2>
          <p className="mt-3 text-blue-100 max-w-xl mx-auto">
            Sign in to manage requests and projects, or get in touch with the office to learn more.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link to="/login" className="px-6 py-3 rounded-md bg-white text-[#123B63] font-semibold hover:bg-blue-50">Sign in</Link>
            <Link to="/about" className="px-6 py-3 rounded-md border border-white/40 font-semibold hover:bg-white/10">Learn more</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
