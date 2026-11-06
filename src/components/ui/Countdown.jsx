import { useState, useEffect } from 'react';

export default function Countdown({ targetDate, colorTheme = 'purple' }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;

    // Convert targetDate to a timestamp
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;

  // Style variations
  const bgClass = colorTheme === 'orange' ? 'bg-brand-orange text-white' : 'bg-white text-brand-purple';
  const labelClass = colorTheme === 'orange' ? 'text-white/80' : 'text-gray-500';

  return (
    <div className="flex gap-3 text-center">
      <div className={`${bgClass} rounded-xl p-3 w-16 md:w-20 shadow-md`}>
        <span className="block text-2xl md:text-3xl font-extrabold">{timeLeft.days}</span>
        <span className={`text-[10px] md:text-xs font-bold uppercase ${labelClass}`}>Days</span>
      </div>
      <div className={`${bgClass} rounded-xl p-3 w-16 md:w-20 shadow-md`}>
        <span className="block text-2xl md:text-3xl font-extrabold">{timeLeft.hours}</span>
        <span className={`text-[10px] md:text-xs font-bold uppercase ${labelClass}`}>Hours</span>
      </div>
      <div className={`${bgClass} rounded-xl p-3 w-16 md:w-20 shadow-md`}>
        <span className="block text-2xl md:text-3xl font-extrabold">{timeLeft.minutes}</span>
        <span className={`text-[10px] md:text-xs font-bold uppercase ${labelClass}`}>Mins</span>
      </div>
      <div className={`${bgClass} rounded-xl p-3 w-16 md:w-20 shadow-md`}>
        <span className="block text-2xl md:text-3xl font-extrabold">{timeLeft.seconds}</span>
        <span className={`text-[10px] md:text-xs font-bold uppercase ${labelClass}`}>Secs</span>
      </div>
    </div>
  );
}