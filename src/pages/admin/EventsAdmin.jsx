import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadToImgBB } from '../../utils/imgbb';
import AdminNav from '../../components/layout/AdminNav';

export default function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', targetDate: '', displayDate: '', location: '', description: '', isRegistrationOpen: true
  });
  const [flyer, setFlyer] = useState(null);

  const fetchEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'events'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort newest first
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      let flyerUrl = '';
      // 1. Upload to ImgBB if a file was selected
      if (flyer) {
        flyerUrl = await uploadToImgBB(flyer);
      }

      // 2. Generate URL slug from Title
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // 3. Save to Firestore
      await addDoc(collection(db, 'events'), {
        ...formData,
        slug,
        flyerUrl,
        createdAt: new Date().toISOString()
      });

      alert('Event created successfully!');
      setFormData({ title: '', targetDate: '', displayDate: '', location: '', description: '', isRegistrationOpen: true });
      setFlyer(null);
      fetchEvents(); // Refresh list
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to create event.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'events', id));
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        
        {/* LEFT: CREATE EVENT FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-2xl font-bold text-brand-purple mb-6">Create New Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="e.g. Annual December Program" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Real Date & Time (For Countdown) *</label>
                <input required type="datetime-local" value={formData.targetDate} onChange={e => setFormData({...formData, targetDate: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Text *</label>
                <input required type="text" value={formData.displayDate} onChange={e => setFormData({...formData, displayDate: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="e.g. Dec 29 - 30, 2026" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="e.g. Province HQ" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="What is this event about?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Flyer (Uploads to ImgBB)</label>
              <input type="file" accept="image/*" onChange={e => setFlyer(e.target.files[0])} className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-sm" />
            </div>

            <div className="flex items-center gap-3 bg-brand-purple/5 p-3 rounded-lg">
              <input type="checkbox" checked={formData.isRegistrationOpen} onChange={e => setFormData({...formData, isRegistrationOpen: e.target.checked})} className="w-5 h-5 accent-brand-purple" />
              <label className="text-sm font-bold text-brand-purple">Open Registration for this Event?</label>
            </div>

            <button disabled={busy} type="submit" className="w-full bg-brand-purple text-white py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition disabled:opacity-50">
              {busy ? 'Uploading to ImgBB & Saving...' : 'Create Event'}
            </button>
          </form>
        </div>

        {/* RIGHT: EXISTING EVENTS LIST */}
        <div>
          <h2 className="text-2xl font-bold text-brand-purple mb-6">Manage Existing Events</h2>
          {loading ? <p>Loading events...</p> : events.length === 0 ? <p className="text-gray-500">No events created yet.</p> : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                     <img src={event.flyerUrl || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-800 text-lg">{event.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">{event.displayDate || event.date} · {event.location}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${event.isRegistrationOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {event.isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg font-bold text-sm transition-colors">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}