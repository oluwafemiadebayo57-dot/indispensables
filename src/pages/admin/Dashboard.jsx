import { useState, useEffect } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';

export default function Dashboard() {
  const [stats, setStats] = useState({ registrations: 0, complaints: 0, partners: 0, prayers: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const regSnap = await getCountFromServer(collection(db, 'registrations'));
        const compSnap = await getCountFromServer(collection(db, 'complaints'));
        const partSnap = await getCountFromServer(collection(db, 'partners'));
        const praySnap = await getCountFromServer(collection(db, 'prayerRequests'));

        setStats({
          registrations: regSnap.data().count,
          complaints: compSnap.data().count,
          partners: partSnap.data().count,
          prayers: praySnap.data().count
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand-purple mb-8">Presidency Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-brand-purple">
            <p className="text-gray-500 text-sm font-medium mb-1">Total Registrations</p>
            <h3 className="text-4xl font-bold text-brand-purple">{stats.registrations}</h3>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
            <p className="text-gray-500 text-sm font-medium mb-1">Open Complaints</p>
            <h3 className="text-4xl font-bold text-red-500">{stats.complaints}</h3>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-brand-orange">
            <p className="text-gray-500 text-sm font-medium mb-1">Partners / Supporters</p>
            <h3 className="text-4xl font-bold text-brand-orange">{stats.partners}</h3>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
            <p className="text-gray-500 text-sm font-medium mb-1">Prayer Requests</p>
            <h3 className="text-4xl font-bold text-green-500">{stats.prayers}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}