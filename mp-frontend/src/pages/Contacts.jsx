import { useState } from 'react';
import { Link } from 'react-router-dom';
   import PublicLayout from '../components/PublicLayout.jsx';

// TODO: replace these placeholders with the office's real details.
const CONTACT = {
  phone: '+255 000 000 000',
  email: 'office@example.go.tz',
  address: 'Office of the Member of Parliament, City Council of Mbeya, Tanzania',
  hours: 'Mon – Fri, 8:00 AM – 5:00 PM',
};

const topics = ['General enquiry', 'Submit a request', 'Follow up on a request', 'Projects & events', 'Technical support'];

const faqs = [
  ['How do I submit a request?', 'Visit the constituency office or send a message using the form on this page. Staff will register your request in the system.'],
  ['How can I check the status of my request?', 'Contact the office with your name and the date you applied. Staff can look up your request and give you its current status.'],
  ['How long does a request take?', 'It depends on the type of request. Each request is reviewed and its status is updated as it moves forward.'],
];

const Info = ({ title, value, d }) => (
  <div className="flex gap-4 bg-white border border-gray-200 rounded-xl p-5">
    <span className="shrink-0 w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </span>
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{title}</p>
      <p className="mt-0.5 text-gray-800 font-medium">{value}</p>
    </div>
  </div>
);

export default function Contacts() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: topics[0], message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 10) e.message = 'Please write a message of at least 10 characters.';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    // TODO: connect to a backend endpoint (e.g. POST /api/messages) when available.
    setSent(true);
  };

  const field = (err) =>
    `w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 ${
      err ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#0B2A4A] via-[#123B63] to-[#1c5490] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <p className="text-sm text-blue-200">
            <Link to="/" className="hover:text-white">Home</Link> <span className="mx-2">›</span> Contacts
          </p>
          <h1 className="mt-3 text-4xl font-extrabold">Contact the office</h1>
          <p className="mt-4 max-w-2xl text-blue-100 text-lg leading-relaxed">
            Have a question, a request or feedback? Reach out and our team will respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-5 gap-10">
        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          <Info title="Phone" value={CONTACT.phone} d="M3 5a2 2 0 012-2h2.3a1 1 0 011 .8l.7 3.2a1 1 0 01-.3.9L7.5 9.5a11 11 0 007 7l1.6-1.2a1 1 0 011-.1l3.2.7a1 1 0 01.8 1V19a2 2 0 01-2 2A16 16 0 013 5z" />
          <Info title="Email" value={CONTACT.email} d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
          <Info title="Office address" value={CONTACT.address} d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z" />
          <Info title="Office hours" value={CONTACT.hours} d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

          <div className="rounded-xl bg-gradient-to-br from-[#0B2A4A] to-[#1c5490] text-white p-6">
            <h3 className="font-bold">Staff or administrator?</h3>
            <p className="mt-2 text-sm text-blue-100">Sign in to manage requests, projects and finances.</p>
            <Link to="/login" className="mt-4 inline-block px-5 py-2 rounded-md bg-white text-[#123B63] text-sm font-semibold hover:bg-blue-50">
              Sign in
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-12">
              <span className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <h2 className="mt-4 text-2xl font-bold text-[#123B63]">Message sent</h2>
              <p className="mt-2 text-gray-600">Thank you, {form.name.split(' ')[0]}. We will get back to you shortly.</p>
              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', topic: topics[0], message: '' }); }}
                className="mt-6 px-5 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <h2 className="text-2xl font-bold text-[#123B63]">Send us a message</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                  <input className={field(errors.name)} value={form.name} onChange={set('name')} />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" className={field(errors.email)} value={form.email} onChange={set('email')} />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className={field()} value={form.phone} onChange={set('phone')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select className={field()} value={form.topic} onChange={set('topic')}>
                    {topics.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea rows="5" className={field(errors.message)} value={form.message} onChange={set('message')} />
                {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
              </div>
              <button type="submit" className="w-full sm:w-auto px-8 py-2.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition">
                Send message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-[#123B63] text-center">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([q, a], i) => (
            <div key={q} className="bg-white border border-gray-200 rounded-xl">
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full flex items-center justify-between text-left px-5 py-4 font-medium text-gray-800"
              >
                {q}
                <span className="text-brand-600 text-xl">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>}
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
