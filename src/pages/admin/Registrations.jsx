import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'; 
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';
import { sendEmail } from '../../utils/sendEmail'; 

export default function Registrations() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmailing, setIsEmailing] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInData, setWalkInData] = useState({ fullName: '', phone: '', gender: '', parish: '', guardianName: '', guardianPhone: '', email: '' });
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
      await updateDoc(doc(db, 'registrations', id), { attended: true, checkInTime: time });
      setRegistrations(registrations.map(r => r.id === id ? { ...r, attended: true, checkInTime: time } : r));
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await updateDoc(doc(db, 'registrations', id), { paymentStatus: 'paid' });
      setRegistrations(registrations.map(r => r.id === id ? { ...r, paymentStatus: 'paid' } : r));
    } catch (error) {
      console.error("Error marking as paid:", error);
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    setWalkInBusy(true);
    try {
      const time = new Date().toISOString();
      await addDoc(collection(db, 'registrations'), {
        ...walkInData,
        eventId: selectedEventId,
        attended: true,
        checkInTime: time,
        paymentStatus: 'paid', // Assuming walk-ins pay at the door
        createdAt: time,
        isWalkIn: true
      });
      setShowWalkIn(false);
      setWalkInData({ fullName: '', phone: '', gender: '', parish: '', guardianName: '', guardianPhone: '', email: '' });
      fetchRegistrations();
    } catch (error) {
      alert("Failed to register walk-in: " + error.message);
    } finally {
      setWalkInBusy(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to completely DELETE ${name}'s registration?`)) return;
    try {
      await deleteDoc(doc(db, 'registrations', id));
      setRegistrations(registrations.filter(r => r.id !== id));
    } catch (error) {
      alert("Failed to delete registration.");
    }
  };

  const handleEmailAbsentees = async () => {
    const absentees = registrations.filter(r => !r.attended && r.email);
    if (absentees.length === 0) {
      alert("There are no absentees with valid emails to contact.");
      return;
    }
    if (!window.confirm(`Send a follow-up email to ${absentees.length} absentees?`)) return;

    setIsEmailing(true);
    const eventName = events.find(e => e.id === selectedEventId)?.title || "our recent event";

    try {
      for (const person of absentees) {
        await sendEmail({
          to: person.email,
          subject: `We missed you at ${eventName}!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #6B2D91;">RCCG Ondo Province 11 Teen Affairs</h2>
              <p>Hi <strong>${person.fullName}</strong>,</p>
              <p>We noticed you registered for <strong>${eventName}</strong> but couldn't make it. We missed having you there!</p>
              <p>If you need prayer or just want to talk, please reply to this email or reach out to your parish teen coordinator.</p>
              <p>We hope to see you at our next event!</p>
            </div>
          `
        });
      }
      alert(`Successfully sent follow-up emails to ${absentees.length} absentees.`);
    } catch (error) {
      alert("An error occurred while sending emails.");
    } finally {
      setIsEmailing(false);
    }
  };

  const downloadCSV = () => {
    if (registrations.length === 0) return;
    const headers = ['fullName', 'gender', 'phone', 'email', 'parish', 'guardianName', 'guardianPhone', 'paymentStatus', 'attended', 'checkInTime'];
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

  const totalReg = registrations.length;
  const totalAttended = registrations.filter(r => r.attended).length;
  const totalAbsent = totalReg - totalAttended;

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
            <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full md:w-64 focus:ring-2 focus:ring-brand-purple focus:outline-none">
              <option value="">-- Select an Event --</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>

            <button onClick={() => setShowWalkIn(true)} disabled={!selectedEventId} className="bg-brand-orange text-white px-5 py-3 rounded-lg font-bold hover:bg-orange-500 transition disabled:opacity-50 whitespace-nowrap">
              + Walk-In
            </button>

            <button onClick={handleEmailAbsentees} disabled={!selectedEventId || totalAbsent === 0 || isEmailing} className="bg-blue-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap flex items-center gap-2">
              {isEmailing ? 'Sending...' : `✉️ Email Absentees (${totalAbsent})`}
            </button>

            <button onClick={downloadCSV} disabled={registrations.length === 0} className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap">
              ⬇️ Export
            </button>
          </div>
        </div>

        {!selectedEventId ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-100"><p className="text-gray-500 text-lg">Please select an event.</p></div>
        ) : loading ? (
          <p className="text-center font-bold text-brand-purple py-10">Loading registrations...</p>
        ) : registrations.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-100"><p className="text-gray-500 text-lg">No registrations found.</p></div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input type="text" placeholder="🔍 Search by name or phone number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-1/2 border-2 border-brand-purple/20 rounded-xl p-4 text-lg focus:ring-2 focus:ring-brand-purple focus:outline-none shadow-sm bg-white" />
              <div className="flex gap-4 items-center bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100">
                <div className="text-center"><p className="text-xs text-gray-500 font-bold uppercase">Registered</p><p className="text-xl font-bold text-gray-800">{totalReg}</p></div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center"><p className="text-xs text-green-600 font-bold uppercase">Attended</p><p className="text-xl font-bold text-green-600">{totalAttended}</p></div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center"><p className="text-xs text-red-500 font-bold uppercase">Absent</p><p className="text-xl font-bold text-red-500">{totalAbsent}</p></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegs.map((reg) => (
                <div key={reg.id} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 transition-all relative group ${reg.attended ? 'border-green-500 bg-green-50/20' : 'border-brand-orange'}`}>
                  
                  <button onClick={() => handleDelete(reg.id, reg.fullName)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>

                  <div className="flex justify-between items-start mb-3 pr-6">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{reg.fullName}</h3>
                      <p className="text-sm text-gray-500">📞 {reg.phone}</p>
                      <p className="text-xs font-mono text-brand-purple mt-1">ID: {reg.id.substring(0,8)}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${reg.attended ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {reg.attended ? 'ATTENDED' : 'PENDING'}
                      </span>
                      {reg.paymentStatus === 'paid' ? (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">PAID</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500">UNPAID</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>⛪ {reg.parish}</p>
                    <p className="text-xs text-gray-400 mt-1">✉️ {reg.email}</p>
                    {reg.attended && reg.checkInTime && (
                      <p className="text-green-600 font-bold mt-2 text-xs">Checked in: {new Date(reg.checkInTime).toLocaleTimeString()}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleCheckIn(reg.id, reg.attended)} disabled={reg.attended} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${reg.attended ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-brand-purple text-white hover:bg-brand-purple/90'}`}>
                      {reg.attended ? 'Checked In' : 'Check In'}
                    </button>
                    {reg.paymentStatus !== 'paid' && (
                      <button onClick={() => handleMarkPaid(reg.id)} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors">
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* WALK-IN MODAL */}
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address (Optional)</label>
                  <input type="email" value={walkInData.email || ''} onChange={e => setWalkInData({...walkInData, email: e.target.value})} className="w-full border rounded-lg p-2 text-sm outline-none" />
                </div>
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