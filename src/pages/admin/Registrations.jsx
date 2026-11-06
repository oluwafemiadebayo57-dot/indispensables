import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';

export default function Registrations() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all events on mount for the dropdown
  useEffect(() => {
    async function fetchEvents() {
      const snap = await getDocs(collection(db, 'events'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    }
    fetchEvents();
  }, []);

  // Fetch registrations when an event is selected
  useEffect(() => {
    if (!selectedEventId) {
      setRegistrations([]);
      return;
    }

    async function fetchRegistrations() {
      setLoading(true);
      try {
        const q = query(collection(db, 'registrations'), where('eventId', '==', selectedEventId));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRegistrations(data);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRegistrations();
  }, [selectedEventId]);

  // CSV Export Function
  const downloadCSV = () => {
    if (registrations.length === 0) return;
    
    // Define the columns we want in the CSV
    const headers = ['Full Name', 'Gender', 'DOB', 'Phone', 'Email', 'Parish', 'Guardian Name', 'Guardian Phone', 'Medical Notes'];
    
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add header row

    // Add data rows
    for (const reg of registrations) {
      const values = [
        reg.fullName, reg.gender, reg.dob, reg.phone, reg.email, 
        reg.parish, reg.guardianName, reg.guardianPhone, reg.medicalNotes
      ].map(val => `"${(val || '').toString().replace(/"/g, '""')}"`); // Escape quotes
      
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const eventName = events.find(e => e.id === selectedEventId)?.title || 'Event';
    link.setAttribute('download', `Registrations - ${eventName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-purple mb-2">Event Registrations</h1>
            <p className="text-gray-500">Select an event to view the bio-data of everyone registered.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
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
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              ⬇️ Download CSV
            </button>
          </div>
        </div>

        {!selectedEventId ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">Please select an event from the dropdown above.</p>
          </div>
        ) : loading ? (
          <p className="text-center font-bold text-brand-purple py-10">Loading registrations...</p>
        ) : registrations.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No registrations found for this event yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-purple text-white">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Contact</th>
                    <th className="p-4 font-medium">Parish</th>
                    <th className="p-4 font-medium">Guardian</th>
                    <th className="p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{reg.fullName}</p>
                        <p className="text-sm text-gray-500">{reg.gender} · {reg.dob}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-800">{reg.phone}</p>
                        <p className="text-sm text-gray-500">{reg.email || 'No email'}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-700">{reg.parish}</td>
                      <td className="p-4">
                        <p className="text-sm text-gray-800">{reg.guardianName}</p>
                        <p className="text-sm text-gray-500">{reg.guardianPhone}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(reg.createdAt).toLocaleDateString()}
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