import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminNav() {
  const { user } = useAuth();
  const isPresidency = user?.role === 'presidency';
  const isCoordinator = user?.role === 'coordinator';

  const allLinks = [
    { to: '/admin', label: 'Overview', end: true, presidencyOnly: true },
    { to: '/admin/events', label: 'Manage Events', presidencyOnly: true },
    { to: '/admin/plans', label: 'Event Plans', presidencyOnly: false }, 
    { to: '/admin/finance', label: 'Finance', presidencyOnly: false }, 
    { to: '/admin/reports', label: 'Reports', presidencyOnly: false }, 
    { to: '/admin/complaints', label: 'Complaints', presidencyOnly: true },
    { to: '/admin/partners', label: 'Partners', presidencyOnly: true },
    { to: '/admin/registrations', label: 'Registrations', presidencyOnly: false }, 
    { to: '/admin/biodata', label: 'Bio-Data', presidencyOnly: false }, 
    { to: '/admin/executives', label: 'Executives', presidencyOnly: true },
    { to: '/admin/departments', label: 'Departments', presidencyOnly: true },
    { to: '/admin/content', label: 'Edit History', presidencyOnly: true },
  ];

  const linksToShow = allLinks.filter(link => {
    if (isPresidency) return true; 
    if (isCoordinator) return !link.presidencyOnly; 
    return !link.presidencyOnly; 
  });

  return (
    <div className="bg-gray-100 border-b border-gray-200 mb-8 sticky top-[72px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
        <nav className="flex gap-6 py-4">
          {linksToShow.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap font-medium text-sm pb-1 border-b-2 transition-colors ${
                  isActive ? 'border-brand-orange text-brand-purple' : 'border-transparent text-gray-500 hover:text-brand-purple'
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