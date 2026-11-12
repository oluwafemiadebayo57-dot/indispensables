import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { notifyPresidency } from '../../utils/notifications';

export default function ReportSubmit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  
  const [formData, setFormData] = useState({
    department: user?.departmentId || 'General',
    type: 'monthly',
    period: '',
    meetingsAndActivities: '',
    financialIncome: '',
    financialExpenses: '',
    financialNotes: '',
    challenges: '',
    solutions: '',
    prayerPoints: '',
    extraNotes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'reports'), {
        ...formData,
        authorId: user.uid,
        authorName: user.name || user.email,
        authorEmail: user.email,
        status: 'submitted',
        createdAt: new Date().toISOString()
      });

      // Notify Presidency
      await notifyPresidency(
        'New Report Submitted', 
        `<strong>${user.name || user.email}</strong> from the <strong>${formData.department}</strong> department has submitted a ${formData.type} report for ${formData.period}.`
      );

      alert('Report submitted successfully!');
      navigate('/portal/reports');
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report.");
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
            <h1 className="text-3xl font-bold text-brand-purple">Submit Report</h1>
            <p className="text-gray-500">Fill in your departmental activities accurately.</p>
          </div>
          <Link to="/portal/reports" className="text-brand-orange font-bold hover:underline">&larr; Back to My Reports</Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          
          <div className="grid md:grid-cols-3 gap-6 bg-brand-purple/5 p-6 rounded-xl border border-brand-purple/10">
            <div>
              <label className="block text-sm font-bold text-brand-purple mb-1">Department *</label>
              <input required type="text" name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-purple mb-1">Report Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2">
                <option value="monthly">Monthly Report</option>
                <option value="event">Event Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-purple mb-1">Period / Event Name *</label>
              <input required type="text" name="period" value={formData.period} onChange={handleChange} placeholder="e.g. November 2026" className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meetings Held & Activities *</label>
            <textarea required rows="3" name="meetingsAndActivities" value={formData.meetingsAndActivities} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" placeholder="Summarize meetings held, attendance, and activities..."></textarea>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800">Financial Implications (Optional)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total Income (₦)</label>
                <input type="number" name="financialIncome" value={formData.financialIncome} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total Expenses (₦)</label>
                <input type="number" name="financialExpenses" value={formData.financialExpenses} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Financial Notes</label>
              <input type="text" name="financialNotes" value={formData.financialNotes} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" placeholder="e.g. Used for printing flyers..." />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Challenges Faced *</label>
              <textarea required rows="3" name="challenges" value={formData.challenges} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Solutions *</label>
              <textarea required rows="3" name="solutions" value={formData.solutions} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3"></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prayer Points</label>
            <textarea rows="2" name="prayerPoints" value={formData.prayerPoints} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" placeholder="What should the province pray about?"></textarea>
          </div>

          <button disabled={busy} type="submit" className="w-full bg-brand-purple text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-purple/90 transition shadow-lg disabled:opacity-50">
            {busy ? 'Submitting Report...' : 'Submit Official Report'}
          </button>
        </form>
      </div>
    </div>
  );
}