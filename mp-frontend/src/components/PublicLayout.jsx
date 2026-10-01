import { Link } from 'react-router-dom';
// Your existing header (banner + HOME / ABOUT / CONTACTS / LOGIN).
// Adjust the path if PublicHeader.jsx lives elsewhere.
   import PublicHeader from './PublicHeader.jsx';

const LOGIN_PATH = '/login';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <PublicHeader />

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#0B2A4A] to-[#0a2340] text-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-white font-bold text-lg">Citizens’ Requests Management System</h3>
            <p className="mt-3 text-sm text-blue-200 leading-relaxed">
              A single, secure platform for receiving, tracking and resolving citizens’ requests, and for
              reporting openly on projects, events and public funds.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Quick links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:text-white" to="/">Home</Link></li>
              <li><Link className="hover:text-white" to="/about">About the system</Link></li>
              <li><Link className="hover:text-white" to="/contacts">Contact the office</Link></li>
              <li><Link className="hover:text-white" to={LOGIN_PATH}>Staff sign in</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Office hours</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Monday – Friday: 8:00 AM – 5:00 PM</li>
              <li>Saturday: 9:00 AM – 1:00 PM</li>
              <li>Sunday &amp; public holidays: Closed</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-900/70 py-4 text-center text-xs text-blue-300">
          © {new Date().getFullYear()} The City Council of Mbeya · Office of the Member of Parliament. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
