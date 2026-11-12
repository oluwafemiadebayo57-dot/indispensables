import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateTrackingCode } from '../utils/ids';
import { notifyPresidency } from '../utils/notifications';

export default function Complaints() {
  const [formData, setFormData] = useState({ name: '', contact: '', category: 'Welfare', subject: '', body: '' });
  const [trackingCode, setTrackingCode] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const code = generateTrackingCode();
    
    try {
      await setDoc(doc(db, 'complaints', code), {
        ...formData,
        trackingCode: code,
        status: 'open',
        createdAt: new Date().toISOString()
      });

      // Notify Presidency
      await notifyPresidency(
        'New Complaint Filed', 
        `A new complaint regarding "<strong>${formData.subject}</strong>" has been submitted. Tracking Code: ${code}`
      );

      setTrackingCode(code);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (trackingCode) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-brand-orange">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-3xl font-bold text-brand-purple mb-2">Complaint Submitted</h2>
          <p className="text-gray-600 mb-6">Please save your tracking code to check the status of your complaint.</p>
          
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Tracking Code</p>
            <p className="text-3xl font-mono font-bold text-brand-purple">{trackingCode}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.hash = '/complaints/track'} className="bg-brand-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition">
              Track This Complaint
            </button>
            <button onClick={() => { setTrackingCode(null); setFormData({ name: '', contact: '', category: 'Welfare', subject: '', body: '' }); }} className="text-gray-500 hover:text-brand-purple font-medium">
              Submit another complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-purple mb-4">Submit a Complaint</h1>
          <p className="text-gray-600">Your feedback is valuable to us. All complaints are handled with care and confidentiality.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Optional)</label>
              <input type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone/Email for Updates (Optional)</label>
              <input type="text" onChange={(e) => setFormData({...formData, contact: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="So we can notify you when resolved" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select required onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none">
              <option value="Welfare">Welfare / Welfare Issue</option>
              <option value="Conduct">Conduct / Behavior Issue</option>
              <option value="Event">Event / Program Issue</option>
              <option value="Department">Departmental Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input required type="text" onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="Brief summary of the issue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Details *</label>
            <textarea required rows="4" onChange={(e) => setFormData({...formData, body: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="Please provide as much detail as possible..."></textarea>
          </div>

          <button disabled={busy} type="submit" className="w-full bg-brand-purple text-white py-3 rounded-lg font-bold text-lg hover:bg-brand-purple/90 transition disabled:opacity-50">
            {busy ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}