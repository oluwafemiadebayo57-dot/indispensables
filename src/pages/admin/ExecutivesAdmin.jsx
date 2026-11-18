import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadToImgBB } from '../../utils/imgbb';
import AdminNav from '../../components/layout/AdminNav';

export default function ExecutivesAdmin() {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  
  const [editId, setEditId] = useState(null); // Tracks if we are editing
  const [formData, setFormData] = useState({
    name: '', office: '', zone: '', phone: '', whatsapp: '', instagram: '', order: 1, photoUrl: ''
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

  const handleEditClick = (exec) => {
    setEditId(exec.id);
    setFormData({
      name: exec.name || '', 
      office: exec.office || '', 
      zone: exec.zone || '', 
      phone: exec.phone || '', 
      whatsapp: exec.whatsapp || '', 
      instagram: exec.instagram || '', 
      order: exec.order || 1,
      photoUrl: exec.photoUrl || ''
    });
    setPhoto(null);
    window.scrollTo(0, 0); // Scroll to form
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ name: '', office: '', zone: '', phone: '', whatsapp: '', instagram: '', order: executives.length + 2, photoUrl: '' });
    setPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      let finalPhotoUrl = formData.photoUrl;
      
      // If a new photo was selected, upload it to ImgBB
      if (photo) {
        finalPhotoUrl = await uploadToImgBB(photo);
      }

      const payload = {
        ...formData,
        order: Number(formData.order),
        photoUrl: finalPhotoUrl
      };

      if (editId) {
        // UPDATE existing
        await updateDoc(doc(db, 'executives', editId), payload);
        alert('Executive updated successfully!');
      } else {
        // CREATE new
        await addDoc(collection(db, 'executives'), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        alert('Executive added successfully!');
      }

      handleCancelEdit(); // Reset form
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-purple">
              {editId ? 'Edit Executive' : 'Add Executive'}
            </h2>
            {editId && (
              <button onClick={handleCancelEdit} className="text-sm text-red-500 font-bold hover:underline">
                Cancel Edit
              </button>
            )}
          </div>
          
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
                <label className="block text-sm font-medium mb-1">WhatsApp (Link or Number)</label>
                <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full border rounded-lg p-2" placeholder="e.g. 08012345678" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram (Link or @handle)</label>
              <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full border rounded-lg p-2" placeholder="e.g. @username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Photo {editId && <span className="text-gray-400 font-normal">(Leave blank to keep current photo)</span>}
              </label>
              {formData.photoUrl && !photo && (
                <div className="mb-2">
                  <img src={formData.photoUrl} alt="Current" className="h-16 w-16 object-cover rounded-full border" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="w-full border rounded-lg p-2 bg-gray-50 text-sm" />
            </div>
            
            <button disabled={busy} type="submit" className={`w-full text-white py-3 rounded-lg font-bold transition ${editId ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-purple hover:bg-brand-purple/90'}`}>
              {busy ? 'Saving...' : editId ? 'Update Executive' : 'Add Executive'}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div>
          <h2 className="text-2xl font-bold text-brand-purple mb-6">Current Executives ({executives.length})</h2>
          <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
            {executives.map(exec => (
              <div key={exec.id} className={`bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4 ${editId === exec.id ? 'border-brand-orange ring-2 ring-brand-orange/20' : 'border-gray-100'}`}>
                <img src={exec.photoUrl || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-800">{exec.name}</h3>
                  <p className="text-sm text-brand-orange font-medium">{exec.office}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(exec)} className="text-blue-500 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition font-bold text-sm">Edit</button>
                  <button onClick={() => handleDelete(exec.id)} className="text-red-500 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition font-bold text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}