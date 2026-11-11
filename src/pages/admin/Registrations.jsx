import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';

export default function Registrations() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      const snap = await getDocs(collection(db, 'events'));
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setRegistrations([]);
      return;
    }
    async function fetchRegistrations() {
      setLoading(true);
      const q = query(collection(db, 'registrations'), where('eventId', '==', selectedEventId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRegistrations(data);
      setLoading(false);
    }
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

  const downloadCSV = () => {
    if (registrations.length === 0) return;
    const headers = ['fullName', 'gender', 'phone', 'email', 'parish', 'guardianName', 'guardianPhone', 'attended', 'checkInTime'];
    
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-purple mb-2">Event Check-In Desk</h1>
            <p className="text-gray-500">Search for a teen and check them in. The exact time will be recorded.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
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
              onClick={downloadCSV}
              disabled={registrations.length === 0}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap"
            >
              ⬇️ Export
            </button>
          </div>
        </div>

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
                className="w-full md:w-1/2 border-2 border-brand-purple/20 rounded-xl p-4 text-lg focus:ring-2 focus:ring-brand-purple focus:outline-none shadow-sm"
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
    </div>
  );
}