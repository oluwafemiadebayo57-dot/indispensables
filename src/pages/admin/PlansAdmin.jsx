import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';
import { generatePlanPDF } from '../../utils/pdf';

export default function PlansAdmin() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const snap = await getDocs(collection(db, 'eventPlans'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const markApproved = async (id) => {
    try {
      await updateDoc(doc(db, 'eventPlans', id), {
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      setPlans(plans.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand-purple mb-8">Event Plans & Proposals</h1>

        {loading ? (
          <p>Loading plans...</p>
        ) : plans.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500">No event plans have been submitted yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-purple text-white">
                    <th className="p-4 font-medium">Event & Date</th>
                    <th className="p-4 font-medium">Budget (₦)</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{plan.eventName}</p>
                        <p className="text-sm text-gray-500">{plan.targetDate} · {plan.department}</p>
                      </td>
                      <td className="p-4 font-bold text-gray-700">
                        {Number(plan.totalBudget).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          plan.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {plan.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {plan.status !== 'approved' && (
                          <button 
                            onClick={() => markApproved(plan.id)}
                            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => generatePlanPDF(plan)}
                          className="bg-brand-purple/10 text-brand-purple px-4 py-2 rounded-lg font-bold hover:bg-brand-purple hover:text-white transition"
                        >
                          PDF
                        </button>
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