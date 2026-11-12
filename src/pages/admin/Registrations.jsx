import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';

export default function Registrations() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Walk-in Modal State
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInData, setWalkInData] = useState({
    fullName: '', phone: '', gender: '', parish: '', guardianName: '', guardianPhone: ''
  });
  const [walkInBusy, setWalkInBusy] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const snap = await getDocs(collection(db, 'events'));
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchEvents();
  }, []);

  const fetchRegistrations = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    const q = query(collection(db, 'registrations'), where('eventId', '==', selectedEventId));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRegistrations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, [selectedEventId]);

  const handleCheckIn = async (id, currentStatus) => {
    try {
      if (currentStatus) return; 
      const time = new Date().toISOString();
      await updateDoc(doc(db, 'registrations', id), {
        attended: true,
        checkInTime: time
      });
      setRegistrations(registrations.map(r => r.id === id ? { ...r, attended: true, checkInTime: time } : r));
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    setWalkInBusy(true);
    try {
      const time = new Date().toISOString();
      // Create the registration AND mark them as attended immediately
      await addDoc(collection(db, 'registrations'), {
        ...walkInData,
        eventId: selectedEventId,
        attended: true,
        checkInTime: time,
        createdAt: time,
        isWalkIn: true // Flag to know they registered at the venue
      });
      
      setShowWalkIn(false);
      setWalkInData({ fullName: '', phone: '', gender: '', parish: '', guardianName: '', guardianPhone: '' });
      fetchRegistrations(); // Refresh list
    } catch (error) {
      alert("Failed to register walk-in: " + error.message);
    } finally {
      setWalkInBusy(false);
    }
  };

  const downloadCSV = () => {
    if (registrations.length === 0) return;
    const headers = ['fullName', 'gender', 'phone', 'email', 'parish', 'guardianName', 'guardianPhone', 'attended', 'checkInTime', 'isWalkIn'];
    
    const csvRows = [headers.join(',')];
    for (const reg of registrations) {
      const values = headers.map(h => `"${(reg[h] || '').toString().replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Attendance - ${events.find(e => e.id === selectedEventId)?.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegs = registrations.filter(r => 
    r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.phone?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-purple mb-2">Event Check-In Desk</h1>
            <p className="text-gray-500">Search for a teen and check them in, or register a walk-in.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select 
              value={selectedEventId} 
              onChange={e => setSelectedEventId(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full md:w-64 focus:ring-2 focus:ring-brand-purple focus:outline-none"
            >
              <option value="">-- Select an Event --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>

            <button 
              onClick={() => setShowWalkIn(true)}
              disabled={!selectedEventId}
              className="bg-brand-orange text-white px-5 py-3 rounded-lg font-bold hover:bg-orange-500 transition disabled:opacity-50 whitespace-nowrap"
            >
              + Walk-In
            </button>

            <button 
              onClick={downloadCSV}
              disabled={registrations.length === 0}
              className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap"
            >
              ⬇️ Export
            </button>
          </div>
        </div>

        {/* SEARCH & LIST */}
        {!selectedEventId ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">Please select an event to begin check-in.</p>
          </div>
        ) : loading ? (
          <p className="text-center font-bold text-brand-purple py-10">Loading registrations...</p>
        ) : registrations.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No registrations found for this event yet.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <input 
                type="text"
                placeholder="🔍 Search by name or phone number to check in..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/2 border-2 border-brand-purple/20 rounded-xl p-4 text-lg focus:ring-2 focus:ring-brand-purple focus:outline-none shadow-sm bg-white"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegs.map((reg) => (
                <div key={reg.id} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 transition-all ${reg.attended ? 'border-green-500 bg-green-50/20' : 'border-brand-orange'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{reg.fullName}</h3>
                      <p className="text-sm text-gray-500">📞 {reg.phone}</p>
                      <p className="text-xs font-mono text-brand-purple mt-1">ID: {reg.id.substring(0,8)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${reg.attended ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {reg.attended ? 'ATTENDED' : 'PENDING'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>⛪ {reg.parish}</p>
                    {reg.attended && reg.checkInTime && (
                      <p className="text-green-600 font-bold mt-2 text-xs">
                        Checked in at: {new Date(reg.checkInTime).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => handleCheckIn(reg.id, reg.attended)}
                    disabled={reg.attended}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${
                      reg.attended 
                        ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                        : 'bg-brand-purple text-white hover:bg-brand-purple/90'
                    }`}
                  >
                    {reg.attended ? 'Successfully Checked In' : 'Click to Check In'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* WALK-IN REGISTRATION MODAL */}
      {showWalkIn && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-brand-orange p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Walk-In Registration</h3>
                <p className="text-orange-100 text-xs mt-1">Register & Check-In at the same time</p>
              </div>
              <button onClick={() => setShowWalkIn(false)} className="text-white/80 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleWalkInSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                <input required type="text" value={walkInData.fullName} onChange={e => setWalkInData({...walkInData, fullName: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-brand-orange outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input required type="tel" value={walkInData.phone} onChange={e => setWalkInData({...walkInData, phone: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-brand-orange outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gender *</label>
                  <select required value={walkInData.gender} onChange={e => setWalkInData({...walkInData, gender: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-brand-orange outline-none">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Parish *</label>
                <input required type="text" value={walkInData.parish} onChange={e => setWalkInData({...walkInData, parish: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-brand-orange outline-none" />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Guardian Name</label>
                  <input type="text" value={walkInData.guardianName} onChange={e => setWalkInData({...walkInData, guardianName: e.target.value})} className="w-full border rounded-lg p-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Guardian Phone</label>
                  <input type="tel" value={walkInData.guardianPhone} onChange={e => setWalkInData({...walkInData, guardianPhone: e.target.value})} className="w-full border rounded-lg p-2 text-sm outline-none" />
                </div>
              </div>
              
              <button disabled={walkInBusy} type="submit" className="w-full bg-brand-orange text-white py-3.5 rounded-xl font-bold hover:bg-orange-500 transition shadow-md mt-2">
                {walkInBusy ? 'Registering...' : 'Register & Check-In Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}