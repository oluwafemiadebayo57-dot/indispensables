import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function Footer() {
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'settings'));
        if (snap.exists()) {
          setInstagram(snap.data().instagramLink || '');
          setTiktok(snap.data().tiktokLink || '');
        }
      } catch (error) {
        console.error("Footer settings not loaded", error);
      }
    }
    fetchSettings();
  }, []);

  return (
    <footer className="bg-brand-purple text-white mt-10 md:mt-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-brand-orange/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 md:pt-16 md:pb-8 relative z-10 flex flex-col items-center text-center">
        
        <div className="flex flex-col items-center mb-6 md:mb-10">
          <div className="bg-white p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-lg mb-3 md:mb-5">
            <img src="/logo.png" alt="Logo" className="h-10 md:h-20 object-contain" />
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold tracking-wide mb-2">
            THE <span className="text-brand-orange">INDISPENSABLES</span>
          </h2>
          <p className="hidden md:block text-white/60 text-base max-w-md mx-auto leading-relaxed">
            RCCG Ondo Province 11 Teen Affairs Ministry. Raising a generation of teenagers indispensable to the Kingdom.
          </p>
        </div>

        <div className="w-full max-w-2xl border-y border-white/10 py-5 md:py-8 mb-6 md:mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 md:gap-y-4 gap-x-2 text-xs md:text-sm font-medium text-white/80">
            <Link to="/about" className="hover:text-brand-orange">About Us</Link>
            <Link to="/events" className="hover:text-brand-orange">Events</Link>
            <Link to="/register-teen" className="hover:text-brand-orange">Join Province</Link>
            <Link to="/departments" className="hover:text-brand-orange">Departments</Link>
            <Link to="/prayer-request" className="hover:text-brand-orange">Prayer Request</Link>
            <Link to="/complaints" className="hover:text-brand-orange">Complaints</Link>
            <Link to="/partner" className="hover:text-brand-orange">Partner With Us</Link>
            <Link to="/complaints/track" className="hover:text-brand-orange">Track Issue</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-6 md:mb-10 w-full max-w-2xl">
          <a href="mailto:theindispensables11@gmail.com" className="flex items-center justify-center gap-2 bg-white/5 border border-white/20 px-4 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium hover:bg-white/10 transition-all w-full md:w-auto">
            <svg className="w-3 h-3 md:w-4 md:h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            theindispensables11@gmail.com
          </a>

          <div className="flex gap-2 w-full md:w-auto">
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-orange px-4 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold shadow-lg hover:bg-orange-500 transition-all">
                <svg className="w-3 h-3 md:w-4 md:h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram
              </a>
            )}
            {tiktok && (
              <a href={tiktok} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white px-4 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold shadow-lg hover:bg-gray-900 transition-all">
                <svg className="w-3 h-3 md:w-4 md:h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                TikTok
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-[10px] md:text-xs text-white/40 tracking-wider uppercase font-medium">
          <p>&copy; {new Date().getFullYear()} RCCG Ondo Province 11 Teen Affairs. All rights reserved.</p>
          <Link to="/login" className="hover:text-brand-orange transition-colors">Staff / Executive Login</Link>
        </div>
        
      </div>
    </footer>
  );
}