import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function PrayerRequest() {
  const [formData, setFormData] = useState({ name: '', request: '', confidential: true });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'prayerRequests'), {
        ...formData,
        status: 'new',
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting prayer request:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-brand-orange">
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-3xl font-bold text-brand-purple mb-4">Prayer Received</h2>
          <p className="text-gray-600 mb-8">
            Your request has been securely submitted to our prayer team. We are standing with you in faith.
          </p>
          <button onClick={() => { setSubmitted(false); setFormData({ name: '', request: '', confidential: true }); }} className="bg-brand-purple text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-purple/90 transition">
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-purple mb-4">Submit a Prayer Request</h1>
          <p className="text-gray-600">"The effectual fervent prayer of a righteous man availeth much." - James 5:16</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Optional)</label>
            <input type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="Leave blank to remain anonymous" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prayer Request *</label>
            <textarea required rows="5" onChange={(e) => setFormData({...formData, request: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="How can we pray for you?"></textarea>
          </div>
          
          <div className="flex items-center gap-3 bg-brand-purple/5 p-4 rounded-lg">
            <input type="checkbox" checked={formData.confidential} onChange={(e) => setFormData({...formData, confidential: e.target.checked})} className="w-5 h-5 accent-brand-purple" />
            <label className="text-sm text-gray-700">Keep this strictly confidential (Only visible to Pastors/Presidency)</label>
          </div>

          <button disabled={busy} type="submit" className="w-full bg-brand-purple text-white py-3 rounded-lg font-bold text-lg hover:bg-brand-purple/90 transition disabled:opacity-50">
            {busy ? 'Submitting...' : 'Submit Prayer Request'}
          </button>
        </form>
      </div>
    </div>
  );
}