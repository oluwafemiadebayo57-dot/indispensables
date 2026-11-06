import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/',              label: 'Home' },
  { to: '/about',         label: 'About' },
  { to: '/events',        label: 'Events' },
  { to: '/register-teen', label: 'Register Teen' },
  { to: '/departments',   label: 'Departments' },
  { to: '/prayer-request',label: 'Prayer' },
  { to: '/complaints',    label: 'Complaints' },
  { to: '/partner',       label: 'Partner' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const adminHome =
    user?.role === 'presidency' || user?.role === 'reg_admin'
      ? '/admin' 
      : user ? '/portal/reports' : '/login';

  return (
    <header className="sticky top-0 z-40 bg-brand-purple text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        
        {/* LOGO & TITLE */}
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <div className="bg-white p-1 rounded-md h-10 w-10 md:h-12 md:w-12 flex items-center justify-center">
            <img src="/logo.png" alt="The Indispensables Logo" className="h-full w-full object-contain" />
          </div>
          <span className="font-semibold tracking-wide text-xs md:text-base max-w-[150px] md:max-w-none leading-tight">
            Ondo Province 11 <br className="md:hidden" /> Teen Affairs
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {links.map(l => (
            <NavLink 
              key={l.to} 
              to={l.to} 
              end
              className={({isActive}) => isActive ? 'text-brand-orange' : 'hover:text-brand-orange transition-colors'}
            >
              {l.label}
            </NavLink>
          ))}
          
          {/* Only show Dashboard/Logout if they are logged in. Hide "Login" entirely */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-white/20">
              <Link to={adminHome} className="hover:text-brand-orange transition-colors">Dashboard</Link>
              <button onClick={logout} className="text-brand-orange hover:text-white transition-colors">Logout</button>
            </div>
          )}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button 
          className="lg:hidden text-2xl p-2" 
          onClick={() => setOpen(!open)} 
          aria-label="menu"
        >
          ☰
        </button>
      </div>

      {/* MOBILE NAVIGATION DROPDOWN */}
      {open && (
        <div className="lg:hidden px-4 pb-4 flex flex-col gap-3 bg-brand-purple border-t border-white/10 text-sm">
          {links.map(l => (
            <NavLink 
              key={l.to} 
              to={l.to} 
              end 
              onClick={() => setOpen(false)} 
              className="py-2 border-b border-white/5 hover:text-brand-orange"
            >
              {l.label}
            </NavLink>
          ))}
          
          {user && (
            <div className="pt-2 flex flex-col gap-3">
              <Link to={adminHome} onClick={() => setOpen(false)} className="font-bold hover:text-brand-orange">Dashboard</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="text-left text-brand-orange font-semibold">Logout</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}