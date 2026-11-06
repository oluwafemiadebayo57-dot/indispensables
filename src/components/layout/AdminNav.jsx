import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  const links = [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/events', label: 'Manage Events' },
    { to: '/admin/plans', label: 'Event Plans' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/complaints', label: 'Complaints' },
    { to: '/admin/partners', label: 'Partners' },
    { to: '/admin/registrations', label: 'Registrations' },
    { to: '/admin/biodata', label: 'Bio-Data' },
    { to: '/admin/executives', label: 'Executives' },
    { to: '/admin/departments', label: 'Departments' },
    { to: '/admin/content', label: 'Edit History' },
  ];

  return (
    <div className="bg-gray-100 border-b border-gray-200 mb-8 sticky top-[72px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
        <nav className="flex gap-6 py-4">
          {links.map((link) => (
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