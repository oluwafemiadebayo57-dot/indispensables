import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';
import { sendEmail } from '../../utils/sendEmail'; // <-- Import the new Vercel email utility

export default function ComplaintsAdmin() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchComplaints = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'complaints'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComplaints(data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (complaint) => {
    if (!resolutionNote.trim()) {
      alert("Please enter a resolution note before resolving.");
      return;
    }

    setIsSending(true);

    try {
      // 1. Update the complaint document in Firestore
      await updateDoc(doc(db, 'complaints', complaint.id), {
        status: 'resolved',
        resolutionNote: resolutionNote,
        updatedAt: new Date().toISOString()
      });

      // 2. If they provided an email, send them the update via Vercel API
      if (complaint.contact && complaint.contact.includes('@')) {
        await sendEmail({
          to: complaint.contact,
          subject: `Complaint Update: ${complaint.subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #6B2D91;">RCCG Ondo Province 11 Teen Affairs</h2>
              <p>Hello,</p>
              <p>Your complaint regarding "<strong>${complaint.subject}</strong>" has been marked as resolved.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #F28C28; margin: 20px 0;">
                <p style="margin: 0;"><strong>Resolution Note:</strong></p>
                <p style="margin: 5px 0 0 0;">${resolutionNote}</p>
              </div>
              <p>You can verify this update on our website by tracking your complaint with this code: <strong>${complaint.trackingCode}</strong></p>
              <br/>
              <p>God bless you,</p>
              <p>The Indispensables Team</p>
            </div>
          `
        });
      }

      // 3. Update the local UI state
      setComplaints(complaints.map(c => c.id === complaint.id ? { ...c, status: 'resolved', resolutionNote } : c));
      setResolvingId(null);
      setResolutionNote('');
    } catch (error) {
      console.error("Error resolving complaint:", error);
      alert("There was an error resolving the complaint. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand-purple mb-8">Manage Complaints</h1>

        {loading ? (
          <p>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm">No complaints found.</div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                
                {/* Status Badge */}
                <div className="md:w-48 flex-shrink-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {complaint.status.toUpperCase()}
                  </span>
                  <p className="text-sm font-bold text-gray-400 mt-2 mb-1">Tracking Code:</p>
                  <p className="font-mono text-brand-purple font-bold">{complaint.trackingCode}</p>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{complaint.subject}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Category: {complaint.category} | From: {complaint.name || 'Anonymous'}
                  </p>
                  <p className="text-gray-700 mb-4">{complaint.body}</p>
                  
                  {complaint.contact && <p className="text-sm text-gray-500">Contact: {complaint.contact}</p>}

                  {/* Show resolution note if resolved */}
                  {complaint.status === 'resolved' && complaint.resolutionNote && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm font-bold text-green-800 mb-1">Resolution Note:</p>
                      <p className="text-green-700">{complaint.resolutionNote}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 min-w-[200px]">
                  {complaint.status !== 'resolved' && (
                    <>
                      {resolvingId === complaint.id ? (
                        <div className="space-y-3">
                          <textarea
                            placeholder="What was done to resolve this?"
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-purple outline-none"
                            rows="2"
                          />
                          <button 
                            onClick={() => handleResolve(complaint)}
                            disabled={isSending}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {isSending ? 'Sending...' : 'Save & Email'}
                          </button>
                          <button 
                            onClick={() => { setResolvingId(null); setResolutionNote(''); }} 
                            className="w-full text-gray-500 text-xs hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setResolvingId(complaint.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}