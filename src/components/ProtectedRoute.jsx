import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './ui/Spinner';

export default function ProtectedRoute({ roles = [], department = null }) {
  const { user, loading } = useAuth();
  
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login" replace />;
  
  // 1. Check if their role is allowed
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  
  // 2. Check if a specific department is required
  if (department && user.role !== 'presidency' && user.departmentId !== department) {
    // If they are an executive but not in this department, kick them to their portal
    return <Navigate to="/portal/reports" replace />;
  }

  return <Outlet />;
}