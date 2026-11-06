import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function PrayerRequestsHOD() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'prayerRequests'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const markPrayed = async (id) => {
    try {
      await updateDoc(doc(db, 'prayerRequests', id), { status: 'prayed' });
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'prayed' } : r));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-purple">Prayer Requests Dashboard</h1>
        <p className="text-gray-500">Review confidential requests submitted by teens and workers.</p>
      </div>

      {loading ? <p>Loading...</p> : requests.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-gray-500">
          No prayer requests submitted yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req.id} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${req.status === 'prayed' ? 'border-green-500' : 'border-brand-orange'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div>
                <p className="text-sm font-bold text-gray-500 mb-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                <h3 className="text-lg font-bold text-brand-purple">{req.name || 'Anonymous'}</h3>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{req.request}</p>
                {req.contact && <p className="text-sm text-gray-500 mt-2">Contact: {req.contact}</p>}
              </div>
              <div className="flex flex-col items-end">
                {req.status === 'prayed' ? (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm">✓ Prayed For</span>
                ) : (
                  <button onClick={() => markPrayed(req.id)} className="bg-brand-orange text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-500 transition shadow-sm">
                    Mark as Prayed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}