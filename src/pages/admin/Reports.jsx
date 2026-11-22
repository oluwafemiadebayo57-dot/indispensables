import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';
import { generateReportPDF, generatePlanPDF, generateCompiledPDF } from '../../utils/pdf';
import { useAuth } from '../../hooks/useAuth';

export default function Reports() {
  const { user } = useAuth();
  const isPresidency = user?.role === 'presidency';

  const [reports, setReports] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    async function fetchData() {
      try {
        const repSnap = await getDocs(collection(db, 'reports'));
        const repData = repSnap.docs.map(doc => ({ id: doc.id, type: 'report', ...doc.data() }));
        
        const planSnap = await getDocs(collection(db, 'eventPlans'));
        const planData = planSnap.docs.map(doc => ({ id: doc.id, type: 'plan', ...doc.data() }));
        
        repData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        planData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setReports(repData);
        setPlans(planData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCompile = () => {
    generateCompiledPDF(reports, plans);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-purple">Reports & Plans</h1>
            <p className="text-gray-500">View departmental reports and event proposals.</p>
          </div>
          
          {/* COMPILE BUTTON - ONLY FOR PRESIDENCY */}
          {isPresidency && (
            <button 
              onClick={handleCompile}
              className="bg-brand-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition shadow-sm flex items-center gap-2"
            >
              📄 Compile Master PDF
            </button>
          )}
        </div>

        <div className="flex gap-2 bg-gray-200 p-1 rounded-lg w-full md:w-max mb-6">
          <button onClick={() => setActiveTab('reports')} className={`flex-1 md:flex-none px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'reports' ? 'bg-white text-brand-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Department Reports ({reports.length})
          </button>
          <button onClick={() => setActiveTab('plans')} className={`flex-1 md:flex-none px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'plans' ? 'bg-white text-brand-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Event Plans ({plans.length})
          </button>
        </div>

        {loading ? <p>Loading...</p> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {activeTab === 'reports' ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-purple text-white">
                      <th className="p-4 font-medium">Department / Author</th>
                      <th className="p-4 font-medium">Type & Period</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{report.department}</p>
                          <p className="text-sm text-gray-500">{report.authorName}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-800">{report.period}</p>
                          <span className="text-xs font-bold text-brand-orange">{report.type.toUpperCase()}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => generateReportPDF(report)} className="bg-brand-purple/10 text-brand-purple px-4 py-2 rounded-lg font-bold hover:bg-brand-purple hover:text-white transition">
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-purple text-white">
                      <th className="p-4 font-medium">Event & Author</th>
                      <th className="p-4 font-medium">Budget</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{plan.eventName}</p>
                          <p className="text-sm text-gray-500">{plan.authorName} ({plan.department})</p>
                        </td>
                        <td className="p-4 font-bold text-gray-700">₦{Number(plan.totalBudget).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {plan.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => generatePlanPDF(plan)} className="bg-brand-purple/10 text-brand-purple px-4 py-2 rounded-lg font-bold hover:bg-brand-purple hover:text-white transition">
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}