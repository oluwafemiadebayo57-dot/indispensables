import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Application Modal State
  const [selectedDept, setSelectedDept] = useState(null);
  const [appData, setAppData] = useState({ name: '', phone: '', parish: '', reason: '' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function fetchDepartments() {
      const snap = await getDocs(collection(db, 'departments'));
      setDepartments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchDepartments();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'departmentApplications'), {
        ...appData,
        departmentName: selectedDept.name,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      alert("Failed to submit application.");
    } finally {
      setBusy(false);
    }
  };

  const closeModal = () => {
    setSelectedDept(null);
    setSubmitted(false);
    setAppData({ name: '', phone: '', parish: '', reason: '' });
  };

  return (
    <div className="bg-canvas min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-brand-purple mb-4">Serve in a Department</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            God has given you unique gifts. Use them to build His kingdom by joining one of our vibrant departments.
          </p>
        </div>

        {loading ? <p className="text-center">Loading departments...</p> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map(dept => (
              <div key={dept.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-brand-purple mb-2">{dept.name}</h3>
                <p className="text-sm text-brand-orange font-bold mb-4">HOD: {dept.hodName}</p>
                <p className="text-gray-600 mb-8 flex-grow">{dept.description}</p>
                
                <div className="space-y-3 mt-auto">
                  <button 
                    onClick={() => setSelectedDept(dept)}
                    className="w-full bg-brand-purple text-white py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition"
                  >
                    Apply to Join
                  </button>
                  {dept.whatsappLink && (
                    <a 
                      href={dept.whatsappLink} target="_blank" rel="noopener noreferrer"
                      className="w-full border-2 border-[#25D366] text-[#25D366] py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-colors"
                    >
                      Chat with HOD
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* APPLICATION MODAL */}
      {selectedDept && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-brand-purple p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Join {selectedDept.name}</h3>
              <button onClick={closeModal} className="text-white/70 hover:text-white text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🎉</div>
                  <h4 className="text-2xl font-bold text-brand-purple mb-2">Application Sent!</h4>
                  <p className="text-gray-600 mb-6">The HOD will review your application and contact you soon.</p>
                  <button onClick={closeModal} className="bg-brand-purple text-white px-6 py-2 rounded-lg font-bold">Close</button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input required type="text" onChange={e => setAppData({...appData, name: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <input required type="tel" onChange={e => setAppData({...appData, phone: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Home Parish *</label>
                    <input required type="text" onChange={e => setAppData({...appData, parish: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Why do you want to join? *</label>
                    <textarea required rows="2" onChange={e => setAppData({...appData, reason: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                  <button disabled={busy} type="submit" className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-500 transition">
                    {busy ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}