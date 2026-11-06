import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Departments from './pages/Departments';
import PrayerRequest from './pages/PrayerRequest';
import Complaints from './pages/Complaints';
import TrackComplaint from './pages/TrackComplaint';
import Partner from './pages/Partner';
import Login from './pages/Login';
import TeenRegistration from './pages/TeenRegistration';

// Executive Portal Pages
import MyReports from './pages/portal/MyReports';
import ReportSubmit from './pages/portal/ReportSubmit';
import PlanSubmit from './pages/portal/PlanSubmit';
import DepartmentApplications from './pages/portal/DepartmentApplications';
import PrayerRequestsHOD from './pages/portal/PrayerRequestsHOD'; // <-- NEW

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import EventsAdmin from './pages/admin/EventsAdmin';
import PlansAdmin from './pages/admin/PlansAdmin';
import Registrations from './pages/admin/Registrations';
import Biodata from './pages/admin/Biodata';
import Reports from './pages/admin/Reports';
import ReportGenerate from './pages/admin/ReportGenerate';
import ComplaintsAdmin from './pages/admin/ComplaintsAdmin';
import PartnersAdmin from './pages/admin/PartnersAdmin';
import ExecutivesAdmin from './pages/admin/ExecutivesAdmin';
import DepartmentsAdmin from './pages/admin/DepartmentsAdmin';
import SiteContentAdmin from './pages/admin/SiteContentAdmin';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/register-teen" element={<TeenRegistration />} />
            <Route path="/prayer-request" element={<PrayerRequest />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/complaints/track" element={<TrackComplaint />} />
            <Route path="/partner" element={<Partner />} />
          </Route>

          {/* 2. LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* 3. EXECUTIVE PORTAL (General Access for all Executives & Presidency) */}
          <Route element={<ProtectedRoute roles={['executive', 'presidency']} />}>
            <Route element={<Layout />}>
              <Route path="/portal/reports" element={<MyReports />} />
              <Route path="/portal/reports/new" element={<ReportSubmit />} />
              <Route path="/portal/plans/new" element={<PlanSubmit />} />
              <Route path="/portal/applications" element={<DepartmentApplications />} />
              
              {/* Prayer HOD Specific Route */}
              <Route element={<ProtectedRoute department="Prayer" />}>
                <Route path="/portal/prayer-requests" element={<PrayerRequestsHOD />} />
              </Route>
            </Route>
          </Route>

          {/* 4. REGISTRATION ADMIN (Reg Admin, Presidency, AND Registration HOD) */}
          <Route element={<ProtectedRoute roles={['reg_admin', 'presidency', 'executive']} department="Registration" />}>
            <Route element={<Layout />}>
              <Route path="/admin/registrations" element={<Registrations />} />
              <Route path="/admin/biodata" element={<Biodata />} />
            </Route>
          </Route>

          {/* 5. PRESIDENCY DASHBOARD (Presidency ONLY) */}
          <Route element={<ProtectedRoute roles={['presidency']} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/events" element={<EventsAdmin />} />
              <Route path="/admin/plans" element={<PlansAdmin />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/reports/generate" element={<ReportGenerate />} />
              <Route path="/admin/complaints" element={<ComplaintsAdmin />} />
              <Route path="/admin/partners" element={<PartnersAdmin />} />
              <Route path="/admin/executives" element={<ExecutivesAdmin />} />
              <Route path="/admin/departments" element={<DepartmentsAdmin />} />
              <Route path="/admin/content" element={<SiteContentAdmin />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}