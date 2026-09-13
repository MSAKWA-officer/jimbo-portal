import { Link } from 'react-router-dom';

const reportCards = [
  {
    to: '/reports/requests',
    icon: '📝',
    title: 'Requests Report',
    description: 'Summary of requests by status, priority, category, and completion time.',
  },
  {
    to: '/reports/financial',
    icon: '💰',
    title: 'Financial Report',
    description: 'Allocated budget, expenditures, and payments by category and fiscal year.',
  },
  {
    to: '/reports/projects',
    icon: '🏗️',
    title: 'Projects Report',
    description: 'Projects by status, category, and their recorded activities.',
  },
  {
    to: '/reports/constituents',
    icon: '👥',
    title: 'Constituents Report',
    description: 'Breakdown of constituents by gender, region/district, and frequent requesters.',
  },
];

export default function ReportsHome() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Reports</h1>
        <p className="text-sm text-black mt-1">
          Select the report you want to view. Each report can be filtered and printed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="border rounded-xl p-5 hover:border-[#0B2A4A] hover:shadow-md transition bg-gray-50"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{card.icon}</span>
              <div>
                <h2 className="font-semibold text-black">{card.title}</h2>
                <p className="text-sm text-black mt-1">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
