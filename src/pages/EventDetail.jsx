import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Countdown from '../components/ui/Countdown';
import { generateTicketPDF, getTicketBase64 } from '../utils/pdf';
import { sendEmail } from '../utils/sendEmail';

export default function EventDetail() {
  const { slug } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '', gender: '', dob: '', phone: '', email: '', parish: '', guardianName: '', guardianPhone: '', medicalNotes: '', consent: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [regId, setRegId] = useState('');
  const [busy, setBusy] = useState(false);
  const [emailStatus, setEmailStatus] = useState(''); // To show if email is sending

  useEffect(() => {
    async function fetchEvent() {
      try {
        const q = query(collection(db, 'events'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setEventData({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    
    try {
      // 1. Save to Firestore
      const docRef = await addDoc(collection(db, 'registrations'), {
        ...formData,
        eventId: eventData.id,
        eventTitle: eventData.title,
        attended: false,
        checkInTime: null,
        createdAt: new Date().toISOString()
      });
      
      const newRegId = docRef.id;
      setRegId(newRegId);
      
      // 2. Generate PDF Base64
      const ticketBase64 = getTicketBase64({ id: newRegId, ...formData }, eventData);

      // 3. Send Email (if they provided an email address)
      if (formData.email) {
        setEmailStatus('Sending ticket to your email...');
        await sendEmail({
          to: formData.email,
          subject: `Your E-Ticket for ${eventData.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
              <h2 style="color: #6B2D91;">Registration Confirmed!</h2>
              <p>Hi <strong>${formData.fullName}</strong>,</p>
              <p>You are officially registered for <strong>${eventData.title}</strong>.</p>
              <p>Please find your official E-Ticket attached to this email. You can print it or show the PDF on your phone at the venue for check-in.</p>
              <br/>
              <p style="color: #F28C28; font-weight: bold;">The Indispensables Team</p>
            </div>
          `,
          attachments: [
            {
              filename: `Ticket-${formData.fullName.replace(/\s+/g, '-')}.pdf`,
              content: ticketBase64,
            }
          ]
        });
        setEmailStatus('Ticket sent to your email!');
      }

      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to submit registration. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-purple font-bold">Loading event...</div>;
  if (!eventData) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Event not found.</div>;

  const eventDate = new Date(eventData.targetDate);
  const now = new Date();
  const isPast = eventDate < now && (now.getTime() - eventDate.getTime() > 24 * 60 * 60 * 1000);
  const isOngoing = !isPast && eventDate <= now;

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border-t-8 border-green-500">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-brand-purple mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Thank you, <strong>{formData.fullName}</strong>. You are officially registered for <strong>{eventData.title}</strong>.
          </p>
          
          {emailStatus && (
            <p className="text-sm font-bold text-brand-purple mb-6 bg-brand-purple/5 p-3 rounded-lg">{emailStatus}</p>
          )}

          <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-brand-purple mb-2">Your E-Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">You can also download it directly here.</p>
            <button 
              onClick={() => generateTicketPDF({ id: regId, ...formData }, eventData)} 
              className="w-full bg-brand-purple text-white py-3 rounded-xl font-bold hover:bg-brand-purple/90 transition shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download E-Ticket
            </button>
          </div>

          <Link to="/" className="text-brand-orange font-bold hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/events" className="text-brand-orange font-semibold hover:underline mb-6 inline-block">
          &larr; Back to all events
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="bg-brand-purple p-8 md:p-12 text-white text-center flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{eventData.title}</h1>
            <div className="flex flex-wrap justify-center gap-6 text-brand-orange font-bold mb-8">
              <span>📅 {eventData.displayDate || eventData.date}</span>
              <span>📍 {eventData.location}</span>
            </div>

            {eventData.targetDate && (
              <div className="border-t border-white/20 pt-6 w-full flex flex-col items-center">
                <p className="text-sm uppercase tracking-widest text-brand-orange font-bold mb-3">Event Starts In:</p>
                <Countdown targetDate={eventData.targetDate} colorTheme="orange" />
              </div>
            )}
          </div>

          <div className="p-8 md:p-12">
            {isPast ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-400 mb-2">Event Completed</h2>
                <p className="text-gray-500">Thank you to everyone who attended!</p>
              </div>
            ) : isOngoing ? (
              <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
                <h2 className="text-2xl font-bold text-green-700 mb-2">Event is Currently Ongoing! 🎉</h2>
                <p className="text-green-600">Registration is closed. Please proceed to the registration desk for check-in.</p>
              </div>
            ) : !eventData.isRegistrationOpen ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-500 mb-2">Registration Closed</h2>
                <p className="text-gray-500">Registration for this event is currently closed.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-brand-purple mb-2">Teen Registration Form</h2>
                <p className="text-gray-500 mb-8">Please fill out this bio-data form accurately to secure your spot.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
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

                  <div className="flex items-start gap-3 bg-brand-purple/5 p-4 rounded-lg">
                    <input required type="checkbox" name="consent" onChange={handleChange} className="mt-1 w-5 h-5 accent-brand-purple" />
                    <label className="text-sm text-gray-700">I confirm that the information provided is accurate and I have my parent/guardian's permission to attend.</label>
                  </div>

                  <button disabled={busy} type="submit" className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition shadow-lg mt-4 disabled:opacity-50">
                    {busy ? 'Processing Registration...' : 'Complete Registration'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}