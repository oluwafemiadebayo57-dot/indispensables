import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const snapshot = await getDocs(collection(db, 'events'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date (optional, you can remove this if you want creation date)
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) return <div className="text-center py-32 text-brand-purple font-bold text-xl">Loading events...</div>;

  return (
    <div className="bg-canvas min-h-screen">
      <section className="bg-brand-purple py-16 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Upcoming Events</h1>
        <p className="text-lg text-white/80">Stay updated with all our provincial programs.</p>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {events.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-2xl shadow-sm max-w-2xl mx-auto">
              <p className="text-gray-500 text-lg">No events scheduled at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group">
                  <div className="h-56 relative overflow-hidden bg-gray-200">
                    <img src={event.flyerUrl || 'https://via.placeholder.com/400x300?text=No+Flyer'} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-sm text-brand-orange font-bold mb-2">📅 {event.date}</div>
                    <h3 className="text-2xl font-bold text-brand-purple mb-2">{event.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">📍 {event.location}</p>
                    <p className="text-gray-600 mb-6 flex-grow line-clamp-3">{event.description}</p>
                    <Link to={`/events/${event.slug}`} className="w-full text-center bg-brand-purple text-white py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition">
                      {event.isRegistrationOpen ? 'Register Now' : 'View Details'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}