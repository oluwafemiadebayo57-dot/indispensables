import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadToImgBB } from '../../utils/imgbb';
import AdminNav from '../../components/layout/AdminNav';

export default function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', targetDate: '', displayDate: '', location: '', description: '', isRegistrationOpen: true,
    workerFee: '', nonWorkerFee: '', bankName: '', accountNumber: '', accountName: '', receiptWhatsApp: ''
  });
  
  const [flyer, setFlyer] = useState(null);
  const [existingFlyerUrl, setExistingFlyerUrl] = useState('');

  const fetchEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'events'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleEditClick = (event) => {
    setEditId(event.id);
    setFormData({
      title: event.title || '',
      targetDate: event.targetDate || '',
      displayDate: event.displayDate || '',
      location: event.location || '',
      description: event.description || '',
      isRegistrationOpen: event.isRegistrationOpen ?? true,
      workerFee: event.workerFee || '',
      nonWorkerFee: event.nonWorkerFee || '',
      bankName: event.bankName || '',
      accountNumber: event.accountNumber || '',
      accountName: event.accountName || '',
      receiptWhatsApp: event.receiptWhatsApp || ''
    });
    setExistingFlyerUrl(event.flyerUrl || '');
    setFlyer(null);
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ title: '', targetDate: '', displayDate: '', location: '', description: '', isRegistrationOpen: true, workerFee: '', nonWorkerFee: '', bankName: '', accountNumber: '', accountName: '', receiptWhatsApp: '' });
    setExistingFlyerUrl('');
    setFlyer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      let flyerUrl = existingFlyerUrl;
      if (flyer) flyerUrl = await uploadToImgBB(flyer);

      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = { ...formData, slug, flyerUrl };

      if (editId) {
        await updateDoc(doc(db, 'events', editId), payload);
        alert('Event updated successfully!');
      } else {
        await addDoc(collection(db, 'events'), { ...payload, createdAt: new Date().toISOString() });
        alert('Event created successfully!');
      }
      handleCancelEdit();
      fetchEvents();
    } catch (error) {
      alert(error.message || "Failed to save event.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    await deleteDoc(doc(db, 'events', id));
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-purple">{editId ? 'Edit Event' : 'Create New Event'}</h2>
            {editId && <button onClick={handleCancelEdit} className="text-sm text-red-500 font-bold hover:underline">Cancel Edit</button>}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date & Time *</label>
                <input required type="datetime-local" value={formData.targetDate} onChange={e => setFormData({...formData, targetDate: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Text *</label>
                <input required type="text" value={formData.displayDate} onChange={e => setFormData({...formData, displayDate: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="e.g. Dec 29 - 30, 2026" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Flyer {editId && <span className="text-gray-400 font-normal text-xs">(Leave blank to keep current)</span>}</label>
                <input type="file" accept="image/*" onChange={e => setFlyer(e.target.files[0])} className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-sm" />
              </div>
              <div className="flex items-center gap-3 bg-brand-purple/5 p-3 rounded-lg">
                <input type="checkbox" checked={formData.isRegistrationOpen} onChange={e => setFormData({...formData, isRegistrationOpen: e.target.checked})} className="w-5 h-5 accent-brand-purple" />
                <label className="text-sm font-bold text-brand-purple">Open Registration?</label>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 space-y-4 mt-6">
              <h3 className="font-bold text-brand-orange flex items-center gap-2">💰 Payment Details (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teen / Non-Worker Fee (₦)</label>
                  <input type="number" value={formData.nonWorkerFee} onChange={e => setFormData({...formData, nonWorkerFee: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-orange focus:outline-none" placeholder="e.g. 2000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Worker Fee (₦)</label>
                  <input type="number" value={formData.workerFee} onChange={e => setFormData({...formData, workerFee: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-orange focus:outline-none" placeholder="e.g. 1000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Receipt WhatsApp No.</label>
                <input type="text" value={formData.receiptWhatsApp} onChange={e => setFormData({...formData, receiptWhatsApp: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-orange focus:outline-none" placeholder="e.g. 08012345678" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bank Name</label>
                <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-orange focus:outline-none" placeholder="e.g. GTBank" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Account Number</label>
                  <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-orange focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Account Name</label>
                  <input type="text" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-orange focus:outline-none" />
                </div>
              </div>
            </div>

            <button disabled={busy} type="submit" className={`w-full text-white py-3 rounded-lg font-bold transition disabled:opacity-50 mt-4 ${editId ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-purple hover:bg-brand-purple/90'}`}>
              {busy ? 'Saving...' : editId ? 'Update Event Details' : 'Create Event'}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-purple mb-6">Manage Existing Events</h2>
          {loading ? <p>Loading events...</p> : events.length === 0 ? <p className="text-gray-500">No events created yet.</p> : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className={`bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-3 ${editId === event.id ? 'border-brand-orange ring-2 ring-brand-orange/20' : 'border-gray-100'}`}>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={event.flyerUrl || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{event.title}</h3>
                      <p className="text-sm text-gray-500 mb-1">{event.displayDate || event.date} · {event.location}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${event.isRegistrationOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {event.isRegistrationOpen ? 'Open' : 'Closed'}
                        </span>
                        {event.nonWorkerFee && (
                          <span className="text-xs font-bold px-2 py-1 rounded bg-brand-orange/10 text-brand-orange">
                            Teen: ₦{event.nonWorkerFee} | Worker: ₦{event.workerFee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
                    <button onClick={() => handleEditClick(event)} className="flex-1 text-blue-600 bg-blue-50 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition">Edit Details</button>
                    <button onClick={() => handleDelete(event.id)} className="flex-1 text-red-500 bg-red-50 py-2 rounded-lg font-bold text-sm hover:bg-red-100 transition">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}