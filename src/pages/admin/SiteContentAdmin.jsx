import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';

export default function SiteContentAdmin() {
  const [formData, setFormData] = useState({ history: '', instagramLink: '', whatsappLink: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      const aboutSnap = await getDoc(doc(db, 'siteContent', 'about'));
      const settingsSnap = await getDoc(doc(db, 'siteContent', 'settings'));

      setFormData({
        history: aboutSnap.exists() ? aboutSnap.data().history : '',
        instagramLink: settingsSnap.exists() ? settingsSnap.data().instagramLink : '',
        whatsappLink: settingsSnap.exists() ? settingsSnap.data().whatsappLink : ''
      });
      setLoading(false);
    }
    fetchContent();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Save History separately
      await setDoc(doc(db, 'siteContent', 'about'), { history: formData.history });
      // Save Settings separately
      await setDoc(doc(db, 'siteContent', 'settings'), { 
        instagramLink: formData.instagramLink,
        whatsappLink: formData.whatsappLink 
      });
      alert('Site content and settings updated successfully!');
    } catch (error) {
      alert("Error saving data");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4">
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* HISTORY SECTION */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-brand-purple mb-6">Edit About History</h1>
            <textarea 
              rows="8" 
              value={formData.history} 
              onChange={e => setFormData({...formData, history: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-brand-purple focus:outline-none"
              placeholder="Enter the history of RCCG Ondo Province 11 Teen Affairs..."
            />
          </div>

          {/* SOCIAL LINKS SECTION */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-brand-purple mb-6">Social Media & Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Province Instagram Link</label>
                <input 
                  type="url" 
                  value={formData.instagramLink} 
                  onChange={e => setFormData({...formData, instagramLink: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" 
                  placeholder="https://instagram.com/your_page"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp Community Link</label>
                <input 
                  type="url" 
                  value={formData.whatsappLink} 
                  onChange={e => setFormData({...formData, whatsappLink: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" 
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
            </div>
          </div>

          <button disabled={busy} type="submit" className="w-full bg-brand-purple text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-purple/90 transition shadow-lg">
            {busy ? 'Saving...' : 'Save All Settings'}
          </button>
        </form>

      </div>
    </div>
  );
}