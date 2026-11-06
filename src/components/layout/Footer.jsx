import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function Footer() {
  const [instagram, setInstagram] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'settings'));
        if (snap.exists()) setInstagram(snap.data().instagramLink);
      } catch (error) {
        console.error("Footer settings not loaded", error);
      }
    }
    fetchSettings();
  }, []);

  return (
    <footer className="bg-brand-purple text-white mt-10 md:mt-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-brand-orange/5 blur-3xl rounded-full pointer-events-none"></div>

      {/* Reduced top/bottom padding on mobile (pt-10 pb-6) */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 md:pt-16 md:pb-8 relative z-10 flex flex-col items-center text-center">
        
        {/* BRANDING SECTION - Smaller Logo & Text on mobile */}
        <div className="flex flex-col items-center mb-6 md:mb-10">
          <div className="bg-white p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-lg mb-3 md:mb-5">
            <img src="/logo.png" alt="Logo" className="h-10 md:h-20 object-contain" />
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold tracking-wide mb-2">
            THE <span className="text-brand-orange">INDISPENSABLES</span>
          </h2>
          {/* Hidden on mobile to save space */}
          <p className="hidden md:block text-white/60 text-base max-w-md mx-auto leading-relaxed">
            RCCG Ondo Province 11 Teen Affairs Ministry. Raising a generation of teenagers indispensable to the Kingdom.
          </p>
        </div>

        {/* LINK GRID - Tighter vertical gaps on mobile */}
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

        {/* CONTACT BUTTONS - Shorter height on mobile */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-6 md:mb-10 w-full">
          <a 
            href="mailto:theindispensables11@gmail.com" 
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/20 px-4 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium hover:bg-white/10 transition-all w-full md:w-auto"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            theindispensables11@gmail.com
          </a>

          {instagram && (
            <a 
              href={instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 bg-brand-orange px-4 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold shadow-lg hover:bg-orange-500 transition-all w-full md:w-auto"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Follow on Instagram
            </a>
          )}
        </div>

        {/* COPYRIGHT - Smaller Text */}
        <div className="text-[10px] md:text-xs text-white/40 tracking-wider uppercase font-medium">
          <p>&copy; {new Date().getFullYear()} RCCG Ondo Province 11 Teen Affairs.</p>
          <p className="mt-0.5">All rights reserved.</p>
        </div>
        
      </div>
    </footer>
  );
}