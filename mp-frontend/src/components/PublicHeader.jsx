import { Link } from 'react-router-dom';

export default function PublicHeader() {
  return (
    <header className="bg-white shadow-sm">
      {/* BANNER (flag-style diagonal stripe) */}
      <div
        className="relative overflow-hidden px-6 py-5"
        style={{
          background:
            'linear-gradient(115deg, #0a3d1f 0%, #0a3d1f 35%, #0b1224 45%, #f4c430 50%, #0b1224 55%, #0d3b66 65%, #0d3b66 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center text-lg shrink-0">
            🏛
          </div>

          <div>
            <p className="text-white/90 italic text-sm md:text-base leading-tight">
              JIMBO Portal
            </p>
          </div>

          <div className="flex-1 text-center px-4">
            <h1 className="text-white text-sm md:text-base font-bold tracking-wide leading-tight">
              THE CITY COUNCIL OF MBEYA
              <br />
              OFFICE OF THE MEMBER OF PARLIAMENT
              <br />
              CITIZENS&apos; REQUESTS MANAGEMENT SYSTEM
            </h1>
          </div>
        </div>
      </div>

      {/* NAV — everything aligned to the right */}
      <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-end gap-8">
        <Link
          to="/"
          className="text-sm font-medium text-gray-700 hover:text-[#0B2A4A] flex items-center gap-1"
        >
           HOME
        </Link>
        <Link
          to="/about"
          className="text-sm font-medium text-gray-700 hover:text-[#0B2A4A] flex items-center gap-1"
        >
           ABOUT
        </Link>
        <Link
          to="/contacts"
          className="text-sm font-medium text-gray-700 hover:text-[#0B2A4A] flex items-center gap-1"
        >
           CONTACTS
        </Link>

        <Link
          to="/login"
          className="bg-[#0B2A4A] hover:bg-[#123a63] text-white text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2"
        >
           LOGIN
        </Link>
      </nav>
    </header>
  );
}
