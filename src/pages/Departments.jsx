import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedDept, setSelectedDept] = useState(null);
  const [appData, setAppData] = useState({ name: '', phone: '', parish: '', reason: '' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const snap = await getDocs(collection(db, 'departments'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setDepartments(data);
      } catch (err) {
        setError("Failed to load departments.");
      } finally {
        setLoading(false);
      }
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
      alert("Failed to submit application. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const closeModal = () => {
    setSelectedDept(null);
    setSubmitted(false);
    setAppData({ name: '', phone: '', parish: '', reason: '' });
  };

  // Helper: Format WhatsApp Link with the polite message
  const getHodWhatsAppLink = () => {
    if (!selectedDept?.whatsappLink) return null;
    
    const clean = selectedDept.whatsappLink.replace(/\D/g, '');
    const number = clean.startsWith('0') ? `234${clean.substring(1)}` : clean;
    
    // The polite message you requested
    const message = `Hello Ma/Sir, my name is ${appData.name} from ${appData.parish} parish. I just applied to join the ${selectedDept.name} department on the website. I would love to discuss my application with you. Thank you!`;
    
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  if (loading) return <div className="text-center py-32 text-brand-purple font-bold text-xl">Loading...</div>;

  return (
    <div className="bg-canvas min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-brand-purple mb-4">Serve in a Department</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            God has given you unique gifts. Use them to build His kingdom by joining one of our vibrant departments.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center max-w-2xl mx-auto border border-red-100">{error}</div>
        ) : departments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm max-w-2xl mx-auto border border-gray-100"><p className="text-gray-500 text-lg">No departments have been added yet.</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map(dept => (
              <div key={dept.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-brand-purple mb-2">{dept.name}</h3>
                <p className="text-sm text-brand-orange font-bold mb-4">HOD: {dept.hodName}</p>
                <p className="text-gray-600 mb-8 flex-grow">{dept.description}</p>
                
                <div className="space-y-3 mt-auto">
                  {/* ONLY APPLY BUTTON IS SHOWN HERE. NO CHAT BUTTON. */}
                  <button 
                    onClick={() => setSelectedDept(dept)}
                    className="w-full bg-brand-purple text-white py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition"
                  >
                    Apply to Join
                  </button>
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
                <div className="text-center py-6">
                  <div className="text-5xl mb-4">🎉</div>
                  <h4 className="text-2xl font-bold text-brand-purple mb-2">Application Sent!</h4>
                  <p className="text-gray-600 mb-6">Your application has been saved. Click the button below to send a message to the HOD so they can review it.</p>
                  
                  {/* THE CHAT BUTTON ONLY APPEARS HERE AFTER SUBMISSION */}
                  {selectedDept.whatsappLink && (
                    <a 
                      href={getHodWhatsAppLink()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#20BD5A] transition shadow-md mb-4"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      Chat with HOD on WhatsApp
                    </a>
                  )}
                  
                  <button onClick={closeModal} className="text-gray-500 font-bold hover:text-brand-purple transition">Close</button>
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