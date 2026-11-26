import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './ui/Spinner';

export default function ProtectedRoute({ roles = [], department = null }) {
  const { user, loading } = useAuth();
  
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login" replace />;
  
  // Check if their role is in the allowed list
  if (roles.length && !roles.includes(user.role)) {
    console.log(`Access Denied. Role: ${user.role}, Allowed: ${roles.join(', ')}`);
    return <Navigate to="/" replace />;
  }
  
  // Check department restriction if applicable
  if (department && user.role !== 'presidency' && user.departmentId !== department) {
    return <Navigate to="/portal/reports" replace />;
  }

  return <Outlet />;
}