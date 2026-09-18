import PublicHeader from '../components/PublicHeader.jsx';

export default function Contacts() {
  return (
    <div className="min-h-screen bg-gray-100">
      <PublicHeader />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h1 className="text-xl font-bold text-[#0B2A4A] mb-2">Get in Touch</h1>
          <p className="text-sm text-gray-500 mb-6">
            Reach out to the constituency office through any of the channels below.
          </p>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <span>📍</span>
              <span>Constituency Office — [Add office address here]</span>
            </div>

            <div className="flex items-center gap-3">
              <span>☎️</span>
              <span>[Add office phone number here]</span>
            </div>

            <div className="flex items-center gap-3">
              <span>✉️</span>
              <span>[Add office email address here]</span>
            </div>

            <div className="flex items-center gap-3">
              <span>🕒</span>
              <span>Office Hours: Monday – Friday, 8:00 AM – 4:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
