import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';

export default function DepartmentsAdmin() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', description: '', hodName: '', whatsappLink: ''
  });

  const fetchDepartments = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'departments'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDepartments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'departments'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      alert('Department created!');
      setFormData({ name: '', description: '', hodName: '', whatsappLink: '' });
      fetchDepartments();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    await deleteDoc(doc(db, 'departments', id));
    fetchDepartments();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        
        {/* CREATE FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-2xl font-bold text-brand-purple mb-6">Add Department</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2" placeholder="e.g. Media & ICT" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea required rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2" placeholder="What does this department do?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">HOD Name *</label>
              <input required type="text" value={formData.hodName} onChange={e => setFormData({...formData, hodName: e.target.value})} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">HOD WhatsApp Link (Optional)</label>
              <input type="text" value={formData.whatsappLink} onChange={e => setFormData({...formData, whatsappLink: e.target.value})} className="w-full border rounded-lg p-2" placeholder="https://wa.me/234..." />
            </div>
            <button disabled={busy} type="submit" className="w-full bg-brand-purple text-white py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition">
              {busy ? 'Saving...' : 'Add Department'}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div>
          <h2 className="text-2xl font-bold text-brand-purple mb-6">Active Departments</h2>
          <div className="space-y-3">
            {departments.map(dept => (
              <div key={dept.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">{dept.name}</h3>
                  <p className="text-sm text-gray-500">HOD: {dept.hodName}</p>
                </div>
                <button onClick={() => handleDelete(dept.id)} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1 rounded">Delete</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}