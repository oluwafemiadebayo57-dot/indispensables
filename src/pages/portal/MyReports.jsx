import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

export default function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPresidency = user?.role === 'presidency';
  const isPrayerHOD = user?.departmentId === 'Prayer' || isPresidency;
  const isRegHOD = user?.departmentId === 'Registration' || isPresidency;

  useEffect(() => {
    if (!user) return;
    async function fetchMyReports() {
      try {
        const q = query(collection(db, 'reports'), where('authorId', '==', user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReports(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyReports();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-purple">Executive Portal</h1>
            <p className="text-gray-500">Welcome, {user?.name || 'Executive'} ({user?.departmentId || 'No Department Set'})</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/portal/reports/new" className="bg-brand-purple text-white px-5 py-2.5 rounded-lg font-bold hover:bg-brand-purple/90 transition shadow-md text-sm">
              + New Report
            </Link>
            <Link to="/portal/plans/new" className="bg-brand-orange text-white px-5 py-2.5 rounded-lg font-bold hover:bg-orange-500 transition shadow-md text-sm">
              + Event Plan
            </Link>
            <Link to="/portal/applications" className="bg-gray-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-900 transition shadow-md text-sm">
              View Applications
            </Link>
          </div>
        </div>

        {/* DYNAMIC DEPARTMENT DASHBOARDS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          
          {isPrayerHOD && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-brand-orange">
              <h3 className="text-xl font-bold text-brand-purple mb-2">Prayer Department</h3>
              <p className="text-gray-500 text-sm mb-4">View and manage prayer requests submitted by the province.</p>
              <Link to="/portal/prayer-requests" className="inline-block bg-brand-orange text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-500">
                Open Prayer Dashboard
              </Link>
            </div>
          )}

          {isRegHOD && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-brand-purple">
              <h3 className="text-xl font-bold text-brand-purple mb-2">Registration Department</h3>
              <p className="text-gray-500 text-sm mb-4">Access the master bio-data list and event registrations.</p>
              <div className="flex gap-2">
                <Link to="/admin/registrations" className="bg-brand-purple text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-purple/90">Registrations</Link>
                <Link to="/admin/biodata" className="bg-brand-purple text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-purple/90">Bio-Data</Link>
              </div>
            </div>
          )}

        </div>

        {/* RECENT REPORTS LIST */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Recent Reports</h2>
        {loading ? <p>Loading...</p> : reports.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500">You haven't submitted any reports yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map(report => (
              <div key={report.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-brand-purple">{report.period} - {report.department}</h3>
                  <p className="text-sm text-gray-500">Type: {report.type.toUpperCase()} · Submitted on {new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    {report.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}