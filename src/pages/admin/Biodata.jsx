import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminNav from '../../components/layout/AdminNav';

export default function Biodata() {
  const [executives, setExecutives] = useState([]);
  const [teens, setTeens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teens'); // 'teens' or 'executives'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Executives
        const execSnap = await getDocs(collection(db, 'executives'));
        const execData = execSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        execData.sort((a, b) => (a.order || 99) - (b.order || 99));
        setExecutives(execData);

        // 2. Fetch BOTH Event Registrations and Official Teens
        const regSnap = await getDocs(collection(db, 'registrations'));
        const provSnap = await getDocs(collection(db, 'provinceTeens'));
        
        const allTeensRaw = [
          ...regSnap.docs.map(doc => ({ id: doc.id, source: 'event', ...doc.data() })),
          ...provSnap.docs.map(doc => ({ id: doc.id, source: 'province', ...doc.data() }))
        ];
        
        // DEDUPLICATE: Only show them once (using phone number)
        const uniqueTeens = [];
        const seenPhones = new Set();
        
        allTeensRaw.forEach(teen => {
          const phone = teen.phone?.trim();
          if (phone && !seenPhones.has(phone)) {
            seenPhones.add(phone);
            uniqueTeens.push(teen);
          } else if (!phone && !seenPhones.has(teen.fullName)) {
            seenPhones.add(teen.fullName);
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

  // Generic CSV Download Function
  const downloadCSV = (data, headers, filename) => {
    if (data.length === 0) return;
    
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] || '';
        return `"${val.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
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

  // Filter data based on search term
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
            <p className="text-gray-500">Unified database of all Executives, Teens, and Workers in the Province.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={activeTab === 'teens' ? handleExportTeens : handleExportExecutives}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-sm flex items-center gap-2"
            >
              ⬇️ Export {activeTab === 'teens' ? 'Teens' : 'Executives'} CSV
            </button>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-100 bg-gray-50 gap-4">
            
            <div className="flex gap-2 bg-gray-200 p-1 rounded-lg w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('teens')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'teens' ? 'bg-white text-brand-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Teens & Workers ({teens.length})
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
                placeholder="Search by name, parish, phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-purple focus:outline-none"
              />
            </div>
          </div>

          {/* TABLE CONTENT */}
          {loading ? (
            <p className="p-10 text-center font-bold text-brand-purple">Loading database...</p>
          ) : activeTab === 'teens' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-gray-500 text-sm">
                    <th className="p-4 font-medium">Full Name</th>
                    <th className="p-4 font-medium">Gender</th>
                    <th className="p-4 font-medium">Date of Birth</th>
                    <th className="p-4 font-medium">Teen Contact</th>
                    <th className="p-4 font-medium">Parish</th>
                    <th className="p-4 font-medium">Guardian Name</th>
                    <th className="p-4 font-medium text-brand-orange">Guardian Contact</th>
                    <th className="p-4 font-medium">Medical Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeens.length === 0 ? (
                    <tr><td colSpan="8" className="p-8 text-center text-gray-500">No teens found.</td></tr>
                  ) : filteredTeens.map((teen) => (
                    <tr key={teen.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">{teen.fullName}</td>
                      <td className="p-4 text-sm text-gray-600">{teen.gender}</td>
                      <td className="p-4 text-sm text-gray-600">{teen.dob}</td>
                      <td className="p-4">
                        <p className="text-sm text-gray-800">{teen.phone}</p>
                        <p className="text-xs text-gray-500">{teen.email || 'No email'}</p>
                      </td>
                      <td className="p-4 text-sm font-medium text-brand-purple">{teen.parish}</td>
                      <td className="p-4 text-sm text-gray-800">{teen.guardianName}</td>
                      <td className="p-4 text-sm font-bold text-brand-orange">{teen.guardianPhone}</td>
                      <td className="p-4 text-sm text-red-600 max-w-xs truncate" title={teen.medicalNotes}>
                        {teen.medicalNotes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-gray-500 text-sm">
                    <th className="p-4 font-medium">Name & Office</th>
                    <th className="p-4 font-medium">Zone</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Socials</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExecutives.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">No executives found.</td></tr>
                  ) : filteredExecutives.map((exec) => (
                    <tr key={exec.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{exec.name}</p>
                        <p className="text-xs font-bold text-brand-orange">{exec.office}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-700">{exec.zone}</td>
                      <td className="p-4 text-sm text-gray-800">{exec.phone}</td>
                      <td className="p-4 text-sm text-blue-500">
                        <div className="flex gap-2">
                          {exec.whatsapp && <a href={exec.whatsapp} target="_blank" rel="noreferrer" className="hover:underline">WA</a>}
                          {exec.instagram && <a href={exec.instagram} target="_blank" rel="noreferrer" className="hover:underline">IG</a>}
                          {!exec.whatsapp && !exec.instagram && '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}