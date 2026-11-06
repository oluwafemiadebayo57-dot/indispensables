import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadToImgBB } from '../../utils/imgbb';
import AdminNav from '../../components/layout/AdminNav';

export default function ExecutivesAdmin() {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', office: '', zone: '', phone: '', whatsapp: '', instagram: '', order: 1
  });
  const [photo, setPhoto] = useState(null);

  const fetchExecutives = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'executives'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => a.order - b.order);
      setExecutives(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExecutives(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      let photoUrl = '';
      if (photo) photoUrl = await uploadToImgBB(photo);

      await addDoc(collection(db, 'executives'), {
        ...formData,
        order: Number(formData.order),
        photoUrl,
        createdAt: new Date().toISOString()
      });

      alert('Executive added successfully!');
      setFormData({ name: '', office: '', zone: '', phone: '', whatsapp: '', instagram: '', order: executives.length + 2 });
      setPhoto(null);
      fetchExecutives();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this executive?")) return;
    await deleteDoc(doc(db, 'executives', id));
    fetchExecutives();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        
        {/* FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-2xl font-bold text-brand-purple mb-6">Add Executive</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Office/Role *</label>
                <input required type="text" value={formData.office} onChange={e => setFormData({...formData, office: e.target.value})} className="w-full border rounded-lg p-2" placeholder="e.g. Teens President" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Zone *</label>
                <input required type="text" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order *</label>
                <input required type="number" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp Link (Optional)</label>
                <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full border rounded-lg p-2" placeholder="https://wa.me/234..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram Link (Optional)</label>
              <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full border rounded-lg p-2" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo (Uploads to ImgBB)</label>
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="w-full border rounded-lg p-2 bg-gray-50 text-sm" />
            </div>
            <button disabled={busy} type="submit" className="w-full bg-brand-purple text-white py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition">
              {busy ? 'Saving...' : 'Add Executive'}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div>
          <h2 className="text-2xl font-bold text-brand-purple mb-6">Current Executives ({executives.length})</h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {executives.map(exec => (
              <div key={exec.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
                <img src={exec.photoUrl || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-800">{exec.name}</h3>
                  <p className="text-sm text-brand-orange font-medium">{exec.office}</p>
                </div>
                <button onClick={() => handleDelete(exec.id)} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1 rounded">Delete</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}