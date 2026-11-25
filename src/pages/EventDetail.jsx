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
    fullName: '', gender: '', dob: '', phone: '', email: '', parish: '', guardianName: '', guardianPhone: '', medicalNotes: '', consent: false,
    isWorker: 'false'
  });
  const [submitted, setSubmitted] = useState(false);
  const [regId, setRegId] = useState('');
  const [busy, setBusy] = useState(false);
  const [emailStatus, setEmailStatus] = useState(''); 
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchEvent() {
      if (!slug) { setLoading(false); return; }
      try {
        const q = query(collection(db, 'events'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) setEventData({ id: snap.docs[0].id, ...snap.docs[0].data() });
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
    setErrorMsg('');
    
    try {
      const q = query(
        collection(db, 'registrations'),
        where('eventId', '==', eventData.id),
        where('phone', '==', formData.phone.trim()),
        where('fullName', '==', formData.fullName.trim())
      );
      const existingSnap = await getDocs(q);
      if (!existingSnap.empty) {
        setErrorMsg("This exact name and phone number is already registered.");
        setBusy(false);
        return; 
      }

      const isWorkerBoolean = formData.isWorker === 'true';
      const feeAmount = isWorkerBoolean ? Number(eventData.workerFee || 0) : Number(eventData.nonWorkerFee || 0);

      const docRef = await addDoc(collection(db, 'registrations'), {
        ...formData,
        isWorker: isWorkerBoolean,
        feeAmount: feeAmount,
        eventId: eventData.id,
        eventTitle: eventData.title,
        attended: false,
        checkInTime: null,
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString()
      });
      
      const newRegId = docRef.id;
      setRegId(newRegId);
      const ticketBase64 = getTicketBase64({ id: newRegId, ...formData }, eventData);

      let paymentHtml = '';
      if (feeAmount > 0) {
        paymentHtml = `
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: left;">
            <h3 style="color: #F28C28; margin-top: 0;">Action Required: Payment</h3>
            <p>Please pay the registration fee of <strong>₦${feeAmount.toLocaleString()}</strong> to:</p>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Bank:</strong> ${eventData.bankName}</li>
              <li><strong>Account No:</strong> ${eventData.accountNumber}</li>
              <li><strong>Account Name:</strong> ${eventData.accountName}</li>
            </ul>
            <p>After paying, send your receipt on WhatsApp to <strong>${eventData.receiptWhatsApp}</strong> to confirm your payment.</p>
          </div>
        `;
      }

      setEmailStatus('Sending ticket to your email...');
      await sendEmail({
        to: formData.email,
        subject: `Your E-Ticket for ${eventData.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
            <h2 style="color: #6B2D91;">Registration Confirmed!</h2>
            <p>Hi <strong>${formData.fullName}</strong>,</p>
            <p>You are officially registered for <strong>${eventData.title}</strong> as a ${isWorkerBoolean ? 'Worker' : 'Teen'}.</p>
            ${paymentHtml}
          </div>
        `,
        attachments: [{ filename: `Ticket-${formData.fullName.replace(/\s+/g, '-')}.pdf`, content: ticketBase64 }]
      });
      setEmailStatus('Ticket sent to your email!');
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      setErrorMsg("Failed to submit registration.");
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-purple font-bold">Loading...</div>;
  if (!eventData) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Event not found.</div>;

  const eventDate = new Date(eventData.targetDate);
  const now = new Date();
  const isPast = eventDate < now && (now.getTime() - eventDate.getTime() > 24 * 60 * 60 * 1000);
  const isOngoing = !isPast && eventDate <= now;

  const getWaLink = () => {
    if (!eventData.receiptWhatsApp) return null;
    const clean = eventData.receiptWhatsApp.replace(/\D/g, '');
    const number = clean.startsWith('0') ? `234${clean.substring(1)}` : clean;
    const text = encodeURIComponent(`Hello, here is my payment receipt for ${eventData.title}. My name is ${formData.fullName}.`);
    return `https://wa.me/${number}?text=${text}`;
  };

  if (submitted) {
    const isWorkerBoolean = formData.isWorker === 'true';
    const feeAmount = isWorkerBoolean ? Number(eventData.workerFee || 0) : Number(eventData.nonWorkerFee || 0);
    
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border-t-8 border-green-500">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-brand-purple mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Thank you, <strong>{formData.fullName}</strong>. You are registered for <strong>{eventData.title}</strong> as a <strong>{isWorkerBoolean ? 'Worker' : 'Teen'}</strong>.
          </p>
          {emailStatus && <p className="text-sm font-bold text-brand-purple mb-6 bg-brand-purple/5 p-3 rounded-lg">{emailStatus}</p>}

          {feeAmount > 0 && eventData.accountNumber && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-bold text-brand-orange text-lg mb-2">Action Required: Payment</h3>
              <p className="text-sm text-gray-700 mb-4">Please pay the fee of <strong>₦{feeAmount.toLocaleString()}</strong> to:</p>
              <div className="bg-white p-4 rounded-lg border border-orange-100 space-y-1 mb-4">
                <p><span className="text-gray-500 text-sm">Bank:</span> <strong>{eventData.bankName}</strong></p>
                <p><span className="text-gray-500 text-sm">Acct No:</span> <strong className="text-lg tracking-wider">{eventData.accountNumber}</strong></p>
                <p><span className="text-gray-500 text-sm">Acct Name:</span> <strong>{eventData.accountName}</strong></p>
              </div>
              {getWaLink() && (
                <a href={getWaLink()} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#20BD5A] transition">
                  Send Receipt on WhatsApp
                </a>
              )}
            </div>
          )}
          <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-brand-purple mb-2">Your E-Ticket</h3>
            <button onClick={() => generateTicketPDF({ id: regId, ...formData }, eventData)} className="w-full bg-brand-purple text-white py-3 rounded-xl font-bold hover:bg-brand-purple/90 transition shadow-md">
              Download E-Ticket
            </button>
          </div>
          <Link to="/" className="text-brand-orange font-bold hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/events" className="text-brand-orange font-semibold hover:underline mb-6 inline-block">&larr; Back to all events</Link>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="bg-brand-purple p-8 md:p-12 text-white text-center flex flex-col items-center">
            {eventData.flyerUrl && (
              <div className="w-full max-w-sm mb-8 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gray-50 p-2">
                <img src={eventData.flyerUrl} alt={eventData.title} loading="lazy" decoding="async" className="w-full h-auto max-h-[400px] object-contain rounded-lg" />
              </div>
            )}
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
              <div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-400 mb-2">Event Completed</h2></div>
            ) : isOngoing ? (
              <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100"><h2 className="text-2xl font-bold text-green-700 mb-2">Event is Ongoing! 🎉</h2></div>
            ) : !eventData.isRegistrationOpen ? (
              <div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-500 mb-2">Registration Closed</h2></div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-brand-purple mb-2">Teen Registration Form</h2>
                <p className="text-gray-500 mb-8">Please fill out this bio-data form accurately.</p>
                {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-medium">⚠️ {errorMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">I am registering as a: *</label>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="isWorker" value="false" checked={formData.isWorker === 'false'} onChange={handleChange} className="w-5 h-5 accent-brand-purple" />
                        <span className="text-gray-800">Teen / Non-Worker {eventData.nonWorkerFee ? `(₦${Number(eventData.nonWorkerFee).toLocaleString()})` : ''}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="isWorker" value="true" checked={formData.isWorker === 'true'} onChange={handleChange} className="w-5 h-5 accent-brand-purple" />
                        <span className="text-gray-800">Worker {eventData.workerFee ? `(₦${Number(eventData.workerFee).toLocaleString()})` : ''}</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input required type="text" name="fullName" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label><select required name="gender" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none"><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label><input required type="date" name="dob" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><input required type="tel" name="phone" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" /></div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><input required type="email" name="email" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Home Parish (Province 11) *</label><input required type="text" name="parish" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" /></div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name *</label><input required type="text" name="guardianName" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Phone *</label><input required type="tel" name="guardianPhone" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Any Medical Conditions / Allergies? (Optional)</label><textarea name="medicalNotes" onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-purple focus:outline-none"></textarea></div>
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