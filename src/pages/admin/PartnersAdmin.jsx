import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';

export default function PartnersAdmin() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const querySnapshot = await getDocs(collection(db, 'partners'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPartners(data);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand-purple mb-8">Partners & Supporters</h1>

        {loading ? (
          <p>Loading partners...</p>
        ) : partners.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm">No partners found.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 font-bold text-brand-purple">Name / Org</th>
                    <th className="p-4 font-bold text-brand-purple">Contact</th>
                    <th className="p-4 font-bold text-brand-purple">Type</th>
                    <th className="p-4 font-bold text-brand-purple">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.organization || '-'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-800">{p.email}</p>
                        <p className="text-sm text-gray-500">{p.phone}</p>
                      </td>
                      <td className="p-4">
                        <span className="bg-brand-purple/10 text-brand-purple text-xs font-bold px-2 py-1 rounded">
                          {p.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                        {p.message || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}