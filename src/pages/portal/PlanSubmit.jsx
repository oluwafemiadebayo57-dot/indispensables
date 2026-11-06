import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

export default function PlanSubmit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  
  const [formData, setFormData] = useState({
    eventName: '',
    targetDate: '',
    department: user?.departmentId || 'General',
    activities: '',
    totalBudget: '',
    budgetBreakdown: '',
    uniforms: '',
    otherNeeds: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'eventPlans'), {
        ...formData,
        authorId: user.uid,
        authorName: user.name || user.email,
        authorEmail: user.email,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert('Event Plan submitted successfully!');
      navigate('/portal/reports');
    } catch (error) {
      console.error("Error submitting plan:", error);
      alert("Failed to submit plan.");
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-purple">Submit Event Plan</h1>
            <p className="text-gray-500">Propose activities, budgets, and material needs for upcoming events.</p>
          </div>
          <Link to="/portal/reports" className="text-brand-orange font-bold hover:underline">&larr; Back</Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          
          <div className="grid md:grid-cols-3 gap-6 bg-brand-orange/5 p-6 rounded-xl border border-brand-orange/20">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-800 mb-1">Event Name *</label>
              <input required type="text" name="eventName" value={formData.eventName} onChange={handleChange} placeholder="e.g. LATS: Lillies Among Thorns" className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Target Date *</label>
              <input required type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-gray-800 mb-1">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Activities *</label>
            <textarea required rows="3" name="activities" value={formData.activities} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" placeholder="What exactly will happen at this event?"></textarea>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-brand-purple flex items-center gap-2">
              <span>💰</span> Budget & Finances
            </h3>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Total Estimated Budget (₦) *</label>
              <input required type="number" name="totalBudget" value={formData.totalBudget} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" placeholder="e.g. 50000" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Budget Breakdown *</label>
              <textarea required rows="3" name="budgetBreakdown" value={formData.budgetBreakdown} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" placeholder="e.g. 1. Flyers - ₦5,000&#10;2. Transport - ₦20,000&#10;3. Refreshments - ₦25,000"></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uniform / Material Requirements</label>
            <textarea rows="2" name="uniforms" value={formData.uniforms} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" placeholder="e.g. 20 Departmental Polos (Size M/L), 5 Banners..."></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Logistics / Needs</label>
            <textarea rows="2" name="otherNeeds" value={formData.otherNeeds} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" placeholder="e.g. Sound system rental, approval for venue..."></textarea>
          </div>

          <button disabled={busy} type="submit" className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition shadow-lg disabled:opacity-50">
            {busy ? 'Submitting Plan...' : 'Submit Event Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}