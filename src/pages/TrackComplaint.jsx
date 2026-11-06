import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function TrackComplaint() {
  const [code, setCode] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setComplaint(null);

    try {
      // Because we used the tracking code as the Document ID when creating it
      const docRef = doc(db, 'complaints', code.trim().toUpperCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setComplaint(docSnap.data());
      } else {
        setError('No complaint found with that tracking code. Please check and try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again later.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-canvas min-h-screen py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-purple mb-4">Track Your Complaint</h1>
          <p className="text-gray-600">Enter the tracking code you received when you submitted your complaint.</p>
        </div>

        <form onSubmit={handleTrack} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex gap-4 mb-8">
          <input 
            type="text" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. OD11-2026-XXXX" 
            className="flex-grow border border-gray-300 rounded-lg p-3 font-mono uppercase focus:ring-2 focus:ring-brand-purple focus:outline-none" 
            required
          />
          <button disabled={busy} type="submit" className="bg-brand-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition disabled:opacity-50">
            {busy ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && <p className="text-red-500 text-center font-medium bg-red-50 p-4 rounded-lg">{error}</p>}

        {complaint && (
          <div className="bg-white rounded-2xl shadow-xl border-t-8 border-brand-purple overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Status</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                  complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {complaint.status.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Date Submitted</p>
                <p className="text-gray-800">{new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">Subject</p>
                <p className="text-lg font-semibold text-gray-800">{complaint.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">Details</p>
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.body}</p>
              </div>
              {complaint.status === 'resolved' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 mt-4">
                  <p className="text-sm text-green-800 font-bold mb-1">Resolution Note:</p>
                  <p className="text-green-700">{complaint.resolutionNote || "Your complaint has been marked as resolved by the admin team."}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}