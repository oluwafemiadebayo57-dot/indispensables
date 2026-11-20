import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function TrackRegistration() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]); // Changed from single result to array
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      const snap = await getDocs(collection(db, 'events'));
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchEvents();
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const q = query(
        collection(db, 'registrations'),
        where('eventId', '==', selectedEventId),
        where('phone', '==', phone.trim())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("No registration found for this phone number and event.");
      } else {
        // Map all results found
        const data = snap.docs.map(doc => doc.data());
        setResults(data);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas min-h-screen py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="bg-brand-purple/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎟️</span>
          </div>
          <h1 className="text-4xl font-bold text-brand-purple mb-4">Track Registration</h1>
          <p className="text-gray-600">Check your payment and attendance status.</p>
        </div>

        <form onSubmit={handleTrack} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 space-y-5 mb-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Select Event</label>
            <select required value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none">
              <option value="">-- Choose an event --</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number Used</label>
            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="e.g. 08012345678" />
          </div>
          <button disabled={loading || !selectedEventId} type="submit" className="w-full bg-brand-purple text-white py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition disabled:opacity-50">
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {error && <p className="text-red-500 text-center font-medium bg-red-50 p-4 rounded-lg">{error}</p>}

        {/* Display all registrations found for this number */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 text-center">Found {results.length} Registration(s)</h2>
            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl border-t-8 border-brand-purple overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 bg-gray-50 text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Registered Name</p>
                  <h2 className="text-2xl font-bold text-brand-purple">{result.fullName}</h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <span className="font-bold text-gray-700">Attendance Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${result.attended ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {result.attended ? '✓ Attended' : 'Not Checked In'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <span className="font-bold text-gray-700">Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${result.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {result.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid / Pending'}
                    </span>
                  </div>

                  {result.paymentStatus !== 'paid' && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center mt-4">
                      <p className="text-sm text-gray-700 mb-2">If you have paid, please ensure you sent your receipt to the HOD on WhatsApp.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}