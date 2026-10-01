import { Link } from 'react-router-dom';
   import PublicLayout from '../components/PublicLayout.jsx';

const values = [
  { title: 'Transparency', text: 'Requests, projects and spending are recorded openly so progress can always be explained.' },
  { title: 'Accountability', text: 'An audit trail shows who did what and when, building trust inside and outside the office.' },
  { title: 'Responsiveness', text: 'Clear statuses and categories help the team answer citizens faster and prioritise well.' },
  { title: 'Integrity of data', text: 'One central, secure database replaces duplicated files and lost paperwork.' },
];

const modules = [
  ['Constituents', 'Citizen register and contact details'],
  ['Request categories', 'Education, health, water, infrastructure and more'],
  ['Requests', 'Status tracking with PDF letter attachments'],
  ['Projects & activities', 'Planning, progress and delivery'],
  ['Events & attendees', 'Meetings, rallies and community forums'],
  ['Budgets', 'Allocations per project or programme'],
  ['Expenditures & payments', 'Spending records and payment history'],
  ['Audit logs', 'Complete activity history for oversight'],
];

const timeline = [
  { t: 'Capture', d: 'Citizen concerns are registered the moment they arrive.' },
  { t: 'Organise', d: 'Each request is categorised, assigned and tracked.' },
  { t: 'Deliver', d: 'Requests connect to projects, events and funding.' },
  { t: 'Account', d: 'Reports and audit logs show results and use of funds.' },
];

export default function About() {
  return (
    <PublicLayout>
      {/* Page header */}
      <section className="bg-gradient-to-br from-[#0B2A4A] via-[#123B63] to-[#1c5490] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <p className="text-sm text-blue-200">
            <Link to="/" className="hover:text-white">Home</Link> <span className="mx-2">›</span> About
          </p>
          <h1 className="mt-3 text-4xl font-extrabold">About the system</h1>
          <p className="mt-4 max-w-2xl text-blue-100 text-lg leading-relaxed">
            A purpose-built platform that helps a Member of Parliament’s office listen to citizens, deliver
            on their needs and account for every shilling.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#123B63]">Our purpose</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Constituency offices handle hundreds of requests, from school desks and clean water to
            health services and roads. Without a proper system, requests get lost, follow-up is slow and
            reporting is difficult.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The Constituent Request System brings requests, people, projects, events and finances together,
            so the office can respond with confidence and show citizens exactly what has been done.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-3xl font-extrabold text-brand-600">8+</p>
              <p className="text-sm text-gray-600 mt-1">Integrated modules</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-3xl font-extrabold text-brand-600">3</p>
              <p className="text-sm text-gray-600 mt-1">Access roles</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h3 className="font-bold text-[#123B63] mb-6">From request to result</h3>
          <ol className="space-y-6">
            {timeline.map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#123B63] to-[#1c5490] text-white flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">{s.t}</p>
                  <p className="text-sm text-gray-600">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl font-bold text-[#123B63] text-center">What we stand for</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl bg-[#f5f7fb] border border-gray-200 p-6">
                <div className="w-10 h-1 rounded bg-brand-600 mb-4" />
                <h3 className="font-semibold text-gray-800">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-[#123B63] text-center">What the system covers</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {modules.map(([name, desc]) => (
            <div key={name} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
              <span className="mt-1 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-gradient-to-r from-[#0B2A4A] to-[#1c5490] text-white p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold">Built with security in mind</h2>
            <p className="mt-3 text-blue-100 leading-relaxed">
              Citizens’ information is sensitive. Access is limited by role, passwords are stored securely,
              sessions are token-based and every key action is written to the audit log.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {['Role-based permissions (Admin, Staff, Viewer)', 'Encrypted passwords and token authentication', 'Full audit trail of system activity', 'Centralised PostgreSQL database'].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10 text-center">
          <Link to="/contacts" className="inline-block px-6 py-3 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-semibold transition">
            Get in touch with the office
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
