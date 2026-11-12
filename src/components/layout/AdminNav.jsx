import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminNav() {
  const { user } = useAuth();
  
  // Check if the current user is the Presidency
  const isPresidency = user?.role === 'presidency';

  const allLinks = [
    { to: '/admin', label: 'Overview', end: true, presidencyOnly: true },
    { to: '/admin/events', label: 'Manage Events', presidencyOnly: true },
    { to: '/admin/plans', label: 'Event Plans', presidencyOnly: true },
    { to: '/admin/reports', label: 'Reports', presidencyOnly: true },
    { to: '/admin/complaints', label: 'Complaints', presidencyOnly: true },
    { to: '/admin/partners', label: 'Partners', presidencyOnly: true },
    
    // Registration & Bio-Data are NOT presidencyOnly, so the Reg HOD can see them
    { to: '/admin/registrations', label: 'Registrations', presidencyOnly: false },
    { to: '/admin/biodata', label: 'Bio-Data', presidencyOnly: false },
    
    { to: '/admin/executives', label: 'Executives', presidencyOnly: true },
    { to: '/admin/departments', label: 'Departments', presidencyOnly: true },
    { to: '/admin/content', label: 'Edit History', presidencyOnly: true },
  ];

  // Filter the links based on the user's role
  const linksToShow = allLinks.filter(link => {
    if (isPresidency) return true; // Presidency sees everything
    return !link.presidencyOnly;   // Registration HOD only sees Registrations and Bio-Data
  });

  return (
    <div className="bg-gray-100 border-b border-gray-200 mb-8 sticky top-[72px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
        <nav className="flex gap-6 py-4">
          {linksToShow.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap font-medium text-sm pb-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-brand-orange text-brand-purple'
                    : 'border-transparent text-gray-500 hover:text-brand-purple'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}