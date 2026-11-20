import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';

export default function Biodata() {
  const [executives, setExecutives] = useState([]);
  const [teens, setTeens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teens');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const execSnap = await getDocs(collection(db, 'executives'));
        const execData = execSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        execData.sort((a, b) => (a.order || 99) - (b.order || 99));
        setExecutives(execData);

        const regSnap = await getDocs(collection(db, 'registrations'));
        const provSnap = await getDocs(collection(db, 'provinceTeens'));
        
        const allTeensRaw = [
          ...regSnap.docs.map(doc => ({ id: doc.id, source: 'event', ...doc.data() })),
          ...provSnap.docs.map(doc => ({ id: doc.id, source: 'province', ...doc.data() }))
        ];
        
        // DEDUPLICATE: Check by Name + Phone Number so siblings sharing a phone are kept
        const uniqueTeens = [];
        const seenKeys = new Set();
        
        allTeensRaw.forEach(teen => {
          const phone = teen.phone?.trim() || '';
          const name = teen.fullName?.trim() || '';
          const uniqueKey = `${name.toLowerCase()}-${phone}`;

          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            uniqueTeens.push(teen);
          }
        });

        uniqueTeens.sort((a, b) => a.fullName.localeCompare(b.fullName));
        setTeens(uniqueTeens);

      } catch (error) {
        console.error("Error fetching biodata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const downloadCSV = (data, headers, filename) => {
    if (data.length === 0) return;
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] || '';
        return `"${val.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTeens = () => {
    const headers = ['fullName', 'gender', 'dob', 'phone', 'email', 'parish', 'guardianName', 'guardianPhone', 'medicalNotes'];
    downloadCSV(teens, headers, 'Master List - Teens and Workers');
  };

  const handleExportExecutives = () => {
    const headers = ['name', 'office', 'zone', 'phone', 'whatsapp', 'instagram'];
    downloadCSV(executives, headers, 'Master List - Executives');
  };

  const filteredTeens = teens.filter(t => 
    t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.parish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone?.includes(searchTerm)
  );

  const filteredExecutives = executives.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.office?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.zone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-purple">Master Biodata Database</h1>
            <p className="text-gray-500">Unified database of all Executives, Teens, and Workers.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={activeTab === 'teens' ? handleExportTeens : handleExportExecutives}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-sm w-full md:w-auto flex justify-center items-center gap-2"
            >
              ⬇️ Export {activeTab === 'teens' ? 'Teens' : 'Executives'} CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-100 bg-gray-50 gap-4">
            
            <div className="flex gap-2 bg-gray-200 p-1 rounded-lg w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('teens')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'teens' ? 'bg-white text-brand-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Teens ({teens.length})
              </button>
              <button 
                onClick={() => setActiveTab('executives')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'executives' ? 'bg-white text-brand-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Executives ({executives.length})
              </button>
            </div>

            <div className="w-full md:w-72">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-purple focus:outline-none"
              />
            </div>
          </div>

          {activeTab === 'teens' ? (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-gray-500 text-sm">
                      <th className="p-4 font-medium">Full Name</th>
                      <th className="p-4 font-medium">Gender</th>
                      <th className="p-4 font-medium">DOB</th>
                      <th className="p-4 font-medium">Teen Contact</th>
                      <th className="p-4 font-medium">Parish</th>
                      <th className="p-4 font-medium">Guardian</th>
                      <th className="p-4 font-medium text-brand-orange">Guardian Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeens.map((teen) => (
                      <tr key={teen.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800">{teen.fullName}</td>
                        <td className="p-4 text-sm text-gray-600">{teen.gender}</td>
                        <td className="p-4 text-sm text-gray-600">{teen.dob}</td>
                        <td className="p-4 text-sm text-gray-800">{teen.phone}</td>
                        <td className="p-4 text-sm font-medium text-brand-purple">{teen.parish}</td>
                        <td className="p-4 text-sm text-gray-800">{teen.guardianName}</td>
                        <td className="p-4 text-sm font-bold text-brand-orange">{teen.guardianPhone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredTeens.map((teen) => (
                  <div key={teen.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800">{teen.fullName}</h3>
                      <span className="text-xs font-medium text-brand-purple bg-brand-purple/5 px-2 py-1 rounded">{teen.gender}</span>
                    </div>
                    <p className="text-sm text-gray-600">📞 {teen.phone}</p>
                    <p className="text-sm font-medium text-brand-purple">⛪ {teen.parish}</p>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <p><strong>DOB:</strong> {teen.dob}</p>
                      <p><strong>Guardian:</strong> {teen.guardianName} ({teen.guardianPhone})</p>
                      {teen.medicalNotes && <p className="text-red-500 mt-1"><strong>Medical:</strong> {teen.medicalNotes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* DESKTOP TABLE FOR EXECUTIVES */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-gray-500 text-sm">
                      <th className="p-4 font-medium">Name & Office</th>
                      <th className="p-4 font-medium">Zone</th>
                      <th className="p-4 font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExecutives.map((exec) => (
                      <tr key={exec.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{exec.name}</p>
                          <p className="text-xs font-bold text-brand-orange">{exec.office}</p>
                        </td>
                        <td className="p-4 text-sm text-gray-700">{exec.zone}</td>
                        <td className="p-4 text-sm text-gray-800">{exec.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS FOR EXECUTIVES */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredExecutives.map((exec) => (
                  <div key={exec.id} className="p-4 space-y-2">
                    <h3 className="font-bold text-gray-800">{exec.name}</h3>
                    <p className="text-sm font-bold text-brand-orange">{exec.office}</p>
                    <p className="text-sm text-gray-600">📍 {exec.zone} Zone</p>
                    <p className="text-sm text-gray-600">📞 {exec.phone}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}