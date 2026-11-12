import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { notifyPresidency } from '../utils/notifications';

export default function Partner() {
  const [formData, setFormData] = useState({ name: '', organization: '', email: '', phone: '', type: 'Financial', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'partners'), {
        ...formData,
        status: 'new',
        createdAt: new Date().toISOString()
      });

      // Notify Presidency
      await notifyPresidency(
        'New Partner Request', 
        `A new partnership request has been submitted by <strong>${formData.name}</strong> (${formData.type}).`
      );

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting partner form:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-green-500">
          <div className="text-6xl mb-4">🤝</div>
          <h2 className="text-3xl font-bold text-brand-purple mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-8">
            We have received your partnership request. A member of our executive team will reach out to you shortly.
          </p>
          <button onClick={() => window.location.hash = '/'} className="bg-brand-purple text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-purple/90 transition">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-purple mb-4">Partner With Us</h1>
          <p className="text-gray-600">Support the vision of raising indispensable teenagers for Christ through your resources and prayers.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input required type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization (Optional)</label>
              <input type="text" onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input required type="email" onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input required type="tel" onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How would you like to support? *</label>
            <select required onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none">
              <option value="Financial">Financial Support / Donation</option>
              <option value="Materials">Material / Resource Support</option>
              <option value="Venue">Venue / Logistics</option>
              <option value="Prayer">Prayer Partnership</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message / Details (Optional)</label>
            <textarea rows="3" onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="Tell us how you'd like to partner..."></textarea>
          </div>

          <button disabled={busy} type="submit" className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold text-lg hover:bg-orange-500 transition disabled:opacity-50">
            {busy ? 'Submitting...' : 'Submit Partnership Request'}
          </button>
        </form>
      </div>
    </div>
  );
}