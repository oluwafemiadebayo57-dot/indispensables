import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function TeenRegistration() {
  const [formData, setFormData] = useState({
    fullName: '', gender: '', dob: '', phone: '', email: '', parish: '', guardianName: '', guardianPhone: '', medicalNotes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'provinceTeens'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      alert("Failed to submit registration. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-brand-purple">
          <div className="text-6xl mb-4">🙌</div>
          <h2 className="text-3xl font-bold text-brand-purple mb-2">Welcome to the Family!</h2>
          <p className="text-gray-600 mb-6">
            You have been officially registered under RCCG Ondo Province 11 Teen Affairs. We will contact you with updates.
          </p>
          <a href="#/" className="bg-brand-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition inline-block">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-purple mb-4">Join The Indispensables</h1>
          <p className="text-gray-600">Register officially as a teen in Ondo Province 11. This is not an event registration.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input required type="text" name="fullName" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select required name="gender" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input required type="date" name="dob" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input required type="tel" name="phone" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Parish (Province 11) *</label>
              <input required type="text" name="parish" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name *</label>
                <input required type="text" name="guardianName" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Phone *</label>
                <input required type="tel" name="guardianPhone" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Any Medical Conditions / Allergies? (Optional)</label>
              <textarea name="medicalNotes" onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none"></textarea>
            </div>
          </div>

          <button disabled={busy} type="submit" className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition shadow-lg mt-4 disabled:opacity-50">
            {busy ? 'Registering...' : 'Complete Official Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}