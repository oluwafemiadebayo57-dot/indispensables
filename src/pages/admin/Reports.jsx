import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';
import { generateReportPDF } from '../../utils/pdf';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const snap = await getDocs(collection(db, 'reports'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand-purple mb-8">Departmental Reports</h1>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500">No reports have been submitted yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-purple text-white">
                    <th className="p-4 font-medium">Department / Author</th>
                    <th className="p-4 font-medium">Type & Period</th>
                    <th className="p-4 font-medium">Date Submitted</th>
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
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => generateReportPDF(report)}
                          className="bg-brand-purple/10 text-brand-purple px-4 py-2 rounded-lg font-bold hover:bg-brand-purple hover:text-white transition flex items-center gap-2 ml-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          Download PDF
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