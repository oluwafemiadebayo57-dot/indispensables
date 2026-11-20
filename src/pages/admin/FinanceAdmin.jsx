import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';
import { useAuth } from '../../hooks/useAuth';

export default function FinanceAdmin() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  const [registrations, setRegistrations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0]
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const snap = await getDocs(collection(db, 'events'));
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchEvents();
  }, []);

  const fetchFinanceData = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    
    try {
      // 1. Fetch Registrations for this event
      const regQ = query(collection(db, 'registrations'), where('eventId', '==', selectedEventId));
      const regSnap = await getDocs(regQ);
      setRegistrations(regSnap.docs.map(doc => doc.data()));

      // 2. Fetch Manual Transactions for this event
      const txQ = query(collection(db, 'transactions'), where('eventId', '==', selectedEventId));
      const txSnap = await getDocs(txQ);
      const txData = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      txData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(txData);

    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [selectedEventId]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        ...formData,
        amount: Number(formData.amount),
        eventId: selectedEventId,
        recordedBy: user.name || user.email,
        createdAt: new Date().toISOString()
      });
      setFormData({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchFinanceData();
    } catch (error) {
      alert("Failed to add transaction: " + error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await deleteDoc(doc(db, 'transactions', id));
    fetchFinanceData();
  };

  // --- CALCULATIONS ---
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const fee = Number(selectedEvent?.registrationFee || 0);

  const totalExpected = registrations.length * fee;
  const totalCollected = registrations.filter(r => r.paymentStatus === 'paid').length * fee;
  
  const manualIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const manualExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = totalCollected + manualIncome;
  const netBalance = totalIncome - manualExpenses;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-purple mb-2">Event Finance Manager</h1>
          <p className="text-gray-500">Track registrations, record expenses, and monitor event profitability.</p>
        </div>

        <div className="mb-8">
          <select 
            value={selectedEventId} 
            onChange={e => setSelectedEventId(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full md:w-96 focus:ring-2 focus:ring-brand-purple focus:outline-none shadow-sm font-medium"
          >
            <option value="">-- Select an Event to Manage --</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>

        {!selectedEventId ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">Select an event above to view its financial summary.</p>
          </div>
        ) : loading ? (
          <p className="text-center font-bold text-brand-purple py-10">Loading financial data...</p>
        ) : (
          <>
            {/* DASHBOARD STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-brand-purple">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Expected (Registrations)</p>
                <h3 className="text-2xl font-bold text-gray-800">₦{totalExpected.toLocaleString()}</h3>
                <p className="text-xs text-gray-400 mt-1">{registrations.length} teens registered</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-500">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Collected (Paid Reg)</p>
                <h3 className="text-2xl font-bold text-green-600">₦{totalCollected.toLocaleString()}</h3>
                <p className="text-xs text-gray-400 mt-1">{registrations.filter(r => r.paymentStatus === 'paid').length} marked as paid</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Extra Income</p>
                <h3 className="text-2xl font-bold text-blue-600">₦{manualIncome.toLocaleString()}</h3>
                <p className="text-xs text-gray-400 mt-1">Donations, sponsorships</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-red-500">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Expenses</p>
                <h3 className="text-2xl font-bold text-red-600">₦{manualExpenses.toLocaleString()}</h3>
                <p className="text-xs text-gray-400 mt-1">Logistics, venue, etc.</p>
              </div>
            </div>

            {/* NET BALANCE */}
            <div className="bg-brand-purple text-white p-6 rounded-2xl shadow-lg mb-8 flex justify-between items-center">
              <div>
                <p className="text-brand-orange font-bold uppercase tracking-wider text-sm mb-1">Net Balance (Income - Expenses)</p>
                <p className="text-sm text-white/70">Total Income: ₦{totalIncome.toLocaleString()}</p>
              </div>
              <h2 className="text-4xl font-extrabold">₦{netBalance.toLocaleString()}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              
              {/* ADD TRANSACTION FORM */}
              <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h2 className="text-xl font-bold text-brand-purple mb-4">Record Transaction</h2>
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
                    <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-2 rounded-md font-bold text-sm transition ${formData.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>+ Income</button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-2 rounded-md font-bold text-sm transition ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>- Expense</button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₦) *</label>
                    <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Source / Reason *</label>
                    <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" placeholder="e.g. Venue deposit, Donation from..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date *</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
                  </div>
                  <button disabled={busy} type="submit" className="w-full bg-brand-purple text-white py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition">
                    {busy ? 'Saving...' : 'Save Transaction'}
                  </button>
                </form>
              </div>

              {/* TRANSACTION LIST */}
              <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-gray-700">Manual Transactions</h2>
                </div>
                {transactions.length === 0 ? (
                  <p className="p-8 text-center text-gray-500">No manual income or expenses recorded yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {transactions.map(tx => (
                      <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-800">{tx.description}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} · Recorded by {tx.recordedBy}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'income' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                          </span>
                          <button onClick={() => handleDeleteTransaction(tx.id)} className="text-gray-400 hover:text-red-500 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}