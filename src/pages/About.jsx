import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ExecutiveCard from '../components/ui/ExecutiveCard';

export default function About() {
  const [executives, setExecutives] = useState([]);
  const [history, setHistory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch History
        const historySnap = await getDoc(doc(db, 'siteContent', 'about'));
        if (historySnap.exists()) {
          setHistory(historySnap.data().history);
        }

        // 2. Fetch Executives
        const execSnap = await getDocs(collection(db, 'executives'));
        const execData = execSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by 'order' field
        execData.sort((a, b) => (a.order || 99) - (b.order || 99));
        setExecutives(execData);
      } catch (error) {
        console.error("Error fetching about data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-purple font-bold text-xl">Loading...</div>;

  return (
    <div className="bg-canvas min-h-screen">
      
      {/* HERO SECTION */}
      <section className="bg-brand-purple py-20 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            About <span className="text-brand-orange">The Indispensables</span>
          </h1>
          <p className="text-lg text-white/80">
            Discovering our roots, understanding our mandate, and meeting the leaders who serve the teen ministry of RCCG Ondo Province 11.
          </p>
        </div>
      </section>

      {/* OUR HISTORY SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <h2 className="text-brand-orange font-bold uppercase tracking-widest text-sm mb-2">Our Story</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-brand-purple mb-6">A Legacy of Raising Godly Teens</h3>
            
            {/* Dynamic History Text */}
            <div className="text-gray-600 mb-8 text-lg leading-relaxed whitespace-pre-wrap">
              {history || "The history of the Teen Affairs ministry will be displayed here. Please ask the admin to update this text in the dashboard."}
            </div>

            <div className="bg-brand-purple/5 border-l-4 border-brand-orange p-6 rounded-r-lg">
              <p className="text-brand-purple font-medium italic text-lg">
                "Train up a child in the way he should go: and when he is old, he will not depart from it." — Proverbs 22:6
              </p>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://res.cloudinary.com/izxlyyn5/image/upload/v1793961854/photo_6012415557241606481_y.jpg" 
              alt="Teens Ministry" 
              className="rounded-2xl shadow-xl w-full object-cover h-[500px] object-top border-4 border-gray-50"
            />
          </div>
        </div>
      </section>

      {/* EXECUTIVES SECTION */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-brand-orange font-bold uppercase tracking-widest text-sm mb-2">Our Leadership</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-brand-purple mb-4">Meet the Executives</h3>
            <div className="w-24 h-1 bg-brand-orange mx-auto rounded-full"></div>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              These are the dedicated individuals leading the Teens Affairs ministry across Ondo Province 11.
            </p>
          </div>

          {executives.length === 0 ? (
            <p className="text-center text-gray-500">No executives added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {executives.map((exec) => (
                <ExecutiveCard key={exec.id} exec={exec} />
              ))}
            </div>
          )}

          {/* Call to Action for Departments */}
          <div className="mt-20 bg-brand-purple rounded-3xl p-10 text-center text-white shadow-xl max-w-4xl mx-auto relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-orange rounded-full opacity-20 blur-3xl"></div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">Want to Serve?</h3>
            <p className="text-lg text-white/80 mb-8 relative z-10">
              We are always looking for passionate teens to join our various departments. Use your gifts for God!
            </p>
            <Link to="/departments" className="inline-block bg-brand-orange text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-500 transition shadow-lg relative z-10">
              View Departments & Apply
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}