import { Link } from 'react-router-dom';

const reportCards = [
  {
    to: '/reports/requests',
    icon: '',
    title: 'Requests Report',
  },
  {
    to: '/reports/financial',
    icon: '',
    title: 'Financial Report',
  },
  {
    to: '/reports/projects',
    icon: '',
    title: 'Projects Report',
  },
  {
    to: '/reports/constituents',
    icon: '',
    title: 'Constituents Report',
  },
];

export default function ReportsHome() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Reports</h1>
  
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
