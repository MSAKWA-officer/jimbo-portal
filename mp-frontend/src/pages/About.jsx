import PublicHeader from '../components/PublicHeader.jsx';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100">
      <PublicHeader />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h1 className="text-xl font-bold text-[#0B2A4A] mb-4">About This System</h1>

          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            The Citizens' Requests Management System is a digital platform
            that enables the Member of Parliament's constituency office to
            receive, track and manage requests submitted by residents of the
            constituency — including requests for assistance, participation
            in development projects, and other community services.
          </p>

          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            The system aims to improve transparency, speed and efficiency in
            service delivery to citizens, while also enabling the office to
            monitor projects, budgets, expenditures and reports with ease.
          </p>

          <h2 className="text-base font-semibold text-[#0B2A4A] mt-6 mb-2">
            Available Services
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Submission and tracking of citizens' requests</li>
            <li>Management of constituency development projects</li>
            <li>Monitoring of budgets and expenditures</li>
            <li>Transparent performance reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
