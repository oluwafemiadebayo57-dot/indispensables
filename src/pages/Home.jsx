import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Countdown from '../components/ui/Countdown';

export default function Home() {
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    async function fetchNextEvent() {
      try {
        const snap = await getDocs(collection(db, 'events'));
        const events = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const upcoming = events
          .filter(e => e.targetDate && new Date(e.targetDate) > new Date())
          .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
        
        if (upcoming.length > 0) setNextEvent(upcoming[0]);
      } catch (error) {
        console.error("Error fetching next event:", error);
      }
    }
    fetchNextEvent();
  }, []);

  return (
    <div className="bg-canvas">
      
      {/* =========================================
          1. HERO SECTION 
          ========================================= */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brand-purple">
        
        {/* BACKGROUND IMAGE */}
        <img 
          src="https://res.cloudinary.com/izxlyyn5/image/upload/v1793972187/FEB_22TH_2026_18_of_38.jpg" 
          alt="Indispensables Teens" 
          className="absolute inset-0 w-full h-full object-cover object-center md:object-[center_20%]"
        />
        
        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-purple via-brand-purple/95 to-brand-purple/40 md:bg-gradient-to-r md:from-brand-purple md:via-brand-purple/80 md:to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative z-10 flex flex-col md:flex-row items-center gap-12 w-full">
          
          <div className="md:w-3/5 text-center md:text-left flex flex-col items-center md:items-start">
            <span className="inline-block py-1.5 px-4 rounded-full bg-brand-orange text-white text-xs md:text-sm font-bold tracking-wider mb-6 shadow-lg">
              RCCG ONDO PROVINCE 11
            </span>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-xl flex flex-col items-center md:items-start">
              <span>Welcome to</span>
              <span className="text-brand-orange whitespace-nowrap text-[2rem] sm:text-5xl md:text-7xl mt-1 md:mt-2">
                The Indispensables
              </span>
            </h1>
            
            <p className="text-base md:text-xl text-white/95 mb-10 max-w-lg font-medium drop-shadow-md leading-relaxed">
              Raising a generation of teenagers who are undeniably relevant, passionately devoted to Christ, and indispensable to the Kingdom.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* UPDATED BUTTON TEXT HERE */}
              <Link to="/events" className="bg-brand-orange text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-500 transition-all shadow-xl hover:-translate-y-1 text-center w-full sm:w-auto">
                Register for December Program
              </Link>
              <Link to="/about" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all text-center w-full sm:w-auto">
                Meet the Executives
              </Link>
            </div>
          </div>

          {/* FLOATING GLASS CARD */}
          <div className="md:w-2/5 w-full max-w-sm mx-auto md:ml-auto mt-8 md:mt-0">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl text-gray-800 border border-white/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-purple to-brand-orange"></div>
              
              <h3 className="text-2xl font-extrabold text-brand-purple mb-6 flex items-center gap-3">
                <span className="text-3xl bg-brand-purple/5 p-2 rounded-lg">⛪</span> Weekly Gatherings
              </h3>
              
              <ul className="space-y-5 mb-8">
                <li className="border-b border-gray-100 pb-4">
                  <p className="font-extrabold text-gray-800 text-lg">Teens Church Service</p>
                  <p className="text-sm text-gray-500 font-medium mt-1">Every Sunday · All Parishes</p>
                </li>
                <li className="border-b border-gray-100 pb-4">
                  <p className="font-extrabold text-gray-800 text-lg">Online Prayer Meeting</p>
                  <p className="text-sm text-gray-500 font-medium mt-1">Every Friday · WhatsApp Platform</p>
                </li>
              </ul>
              
              <a 
                href="https://chat.whatsapp.com/DMxUO6LMSiE9jWHHntQbLx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#20BD5A] transition-all shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Join WhatsApp Community
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC COUNTDOWN BANNER */}
      {nextEvent && (
        <section className="bg-brand-orange py-8 border-b-4 border-brand-purple shadow-inner relative z-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h3 className="text-2xl font-extrabold uppercase tracking-wide">{nextEvent.title}</h3>
              <p className="text-white/90 font-medium">{nextEvent.displayDate} · Registration is Open!</p>
            </div>
            
            <div className="flex items-center">
              <Countdown targetDate={nextEvent.targetDate} colorTheme="purple" />
            </div>
          </div>
        </section>
      )}

      {/* 3. WELCOME MESSAGE */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 relative">
            <div className="absolute top-4 left-4 w-full h-full bg-brand-orange/10 rounded-[2rem] -z-10"></div>
            <img 
              src="https://res.cloudinary.com/izxlyyn5/image/upload/v1793961854/photo_6012415557241606481_y.jpg" 
              alt="Indispensables Teens" 
              className="rounded-[2rem] shadow-xl w-full h-[400px] md:h-[500px] object-cover object-top border-4 border-white"
            />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-brand-orange font-bold uppercase tracking-widest text-sm mb-3">Welcome Home</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-brand-purple mb-6 leading-[1.15]">
              A Place Where Teens <br className="hidden md:block"/> Belong, Grow, and Thrive
            </h3>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              We are the Teen Affairs ministry of the Redeemed Christian Church of God, Ondo Province 11. Our heartbeat is to see every teenager discover their God-given purpose and walk in it.
            </p>
            <p className="text-gray-600 mb-10 text-lg leading-relaxed">
              Whether you are looking to make new friends, grow in your faith, or find a place to serve, there is a home for you here.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 text-brand-purple font-bold text-lg hover:text-brand-orange transition-colors">
              Learn more about us <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. MISSION & VISION */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-purple mb-4">Our Mission & Vision</h2>
            <div className="w-24 h-1.5 bg-brand-orange mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-2xl font-bold text-brand-purple mb-8 flex items-center gap-3">
                <span className="bg-brand-orange/10 text-brand-orange p-3 rounded-xl text-3xl">🎯</span> Our Mission
              </h3>
              <ul className="space-y-6 text-gray-700">
                <li className="flex gap-4">
                  <span className="font-bold text-brand-orange text-xl mt-1">1.</span>
                  <p className="leading-relaxed">We will continuously evangelize and get as many people born again, with the evidence of speaking in tongues.</p>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold text-brand-orange text-xl mt-1">2.</span>
                  <p className="leading-relaxed">We will maintain a constant practice of fasting, prayer, and Bible study, giving ourselves to long hours of prayer and consistent, sound teaching of the Word.</p>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold text-brand-orange text-xl mt-1">3.</span>
                  <p className="leading-relaxed">We will constantly practice the things of the Spirit, praying in tongues, rejoicing in the Spirit, the working of miracles, healings, utterances, revelations, and the gift of faith.</p>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-purple to-[#4a1a66] p-8 md:p-12 rounded-[2rem] shadow-2xl border border-brand-purple/50 text-white hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-brand-orange opacity-10 rounded-bl-full pointer-events-none"></div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="bg-white/10 text-white p-3 rounded-xl text-3xl">👁️</span> Our Vision
              </h3>
              <ul className="space-y-6 text-white/90">
                <li className="flex gap-4">
                  <span className="font-bold text-brand-orange text-xl mt-1">1.</span>
                  <p className="leading-relaxed">To see the Gospel preached everywhere through evangelism and sound teaching until the whole earth is reached with God's Word.</p>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold text-brand-orange text-xl mt-1">2.</span>
                  <p className="leading-relaxed">To raise disciples thoroughly equipped for the work of ministry through the teaching of God's Word, by precept and practice.</p>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold text-brand-orange text-xl mt-1">3.</span>
                  <p className="leading-relaxed"><strong className="text-white">Indispensables Teens Global Pursuit:</strong> Our vision is to pursue these objectives faithfully until every nation in the world is reached by the Lord Jesus Christ.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GIVE / PARTNER CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-brand-purple rounded-[3rem] p-10 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-orange rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl"></div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10">Partner With The Vision</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto relative z-10 font-medium">
              Your generous giving and prayers help us reach more teenagers with the gospel, host life-changing events, and provide resources for teens to grow in Christ.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link to="/partner" className="bg-brand-orange text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-500 transition-all shadow-xl hover:-translate-y-1">
                Support / Partner
              </Link>
              <Link to="/prayer-request" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all hover:-translate-y-1">
                Submit a Prayer Request
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}