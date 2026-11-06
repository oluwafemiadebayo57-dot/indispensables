import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

export default function DepartmentApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // NOTE: For this to work, the user's 'departmentId' in Firestore must match the department name.
  const myDepartment = user?.departmentId || 'General';

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, 'departmentApplications'), where('departmentName', '==', myDepartment));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [myDepartment]);

  const markContacted = async (id) => {
    await updateDoc(doc(db, 'departmentApplications', id), { status: 'contacted' });
    setApplications(applications.map(a => a.id === id ? { ...a, status: 'contacted' } : a));
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-purple">Applications for {myDepartment}</h1>
        <p className="text-gray-500">Review teens who want to join your department.</p>
      </div>

      {loading ? <p>Loading...</p> : applications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-gray-500">
          No applications yet for this department.
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map(app => (
            <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-brand-purple">{app.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{app.phone} · {app.parish}</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded"><strong>Reason:</strong> {app.reason}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'contacted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {app.status.toUpperCase()}
                </span>
                {app.status !== 'contacted' && (
                  <button onClick={() => markContacted(app.id)} className="text-brand-purple font-bold text-sm hover:underline">
                    Mark as Contacted
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