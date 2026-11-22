import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/ui/Spinner';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Departments = lazy(() => import('./pages/Departments'));
const PrayerRequest = lazy(() => import('./pages/PrayerRequest'));
const Complaints = lazy(() => import('./pages/Complaints'));
const TrackComplaint = lazy(() => import('./pages/TrackComplaint'));
const TrackRegistration = lazy(() => import('./pages/TrackRegistration'));
const Partner = lazy(() => import('./pages/Partner'));
const Login = lazy(() => import('./pages/Login'));
const TeenRegistration = lazy(() => import('./pages/TeenRegistration'));

const MyReports = lazy(() => import('./pages/portal/MyReports'));
const ReportSubmit = lazy(() => import('./pages/portal/ReportSubmit'));
const PlanSubmit = lazy(() => import('./pages/portal/PlanSubmit'));
const DepartmentApplications = lazy(() => import('./pages/portal/DepartmentApplications'));
const PrayerRequestsHOD = lazy(() => import('./pages/portal/PrayerRequestsHOD'));

const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const EventsAdmin = lazy(() => import('./pages/admin/EventsAdmin'));
const PlansAdmin = lazy(() => import('./pages/admin/PlansAdmin'));
const FinanceAdmin = lazy(() => import('./pages/admin/FinanceAdmin'));
const Registrations = lazy(() => import('./pages/admin/Registrations'));
const Biodata = lazy(() => import('./pages/admin/Biodata'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const ReportGenerate = lazy(() => import('./pages/admin/ReportGenerate'));
const ComplaintsAdmin = lazy(() => import('./pages/admin/ComplaintsAdmin'));
const PartnersAdmin = lazy(() => import('./pages/admin/PartnersAdmin'));
const ExecutivesAdmin = lazy(() => import('./pages/admin/ExecutivesAdmin'));
const DepartmentsAdmin = lazy(() => import('./pages/admin/DepartmentsAdmin'));
const SiteContentAdmin = lazy(() => import('./pages/admin/SiteContentAdmin'));

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<Spinner full />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:slug" element={<EventDetail />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/register-teen" element={<TeenRegistration />} />
              <Route path="/track-registration" element={<TrackRegistration />} />
              <Route path="/prayer-request" element={<PrayerRequest />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/complaints/track" element={<TrackComplaint />} />
              <Route path="/partner" element={<Partner />} />
            </Route>

            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute roles={['executive', 'presidency']} />}>
              <Route element={<Layout />}>
                <Route path="/portal/reports" element={<MyReports />} />
                <Route path="/portal/reports/new" element={<ReportSubmit />} />
                <Route path="/portal/plans/new" element={<PlanSubmit />} />
                <Route path="/portal/applications" element={<DepartmentApplications />} />
                <Route element={<ProtectedRoute department="Prayer" />}>
                  <Route path="/portal/prayer-requests" element={<PrayerRequestsHOD />} />
                </Route>
              </Route>
            </Route>

            {/* ADMIN ROUTES: Accessible to Coordinators, Reg HODs, and Presidency */}
            <Route element={<ProtectedRoute roles={['reg_admin', 'presidency', 'executive', 'coordinator']} />}>
              <Route element={<Layout />}>
                <Route path="/admin/registrations" element={<Registrations />} />
                <Route path="/admin/biodata" element={<Biodata />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/plans" element={<PlansAdmin />} />
              </Route>
            </Route>

            {/* PRESIDENCY ONLY ROUTES */}
            <Route element={<ProtectedRoute roles={['presidency']} />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/events" element={<EventsAdmin />} />
                <Route path="/admin/finance" element={<FinanceAdmin />} />
                <Route path="/admin/reports/generate" element={<ReportGenerate />} />
                <Route path="/admin/complaints" element={<ComplaintsAdmin />} />
                <Route path="/admin/partners" element={<PartnersAdmin />} />
                <Route path="/admin/executives" element={<ExecutivesAdmin />} />
                <Route path="/admin/departments" element={<DepartmentsAdmin />} />
                <Route path="/admin/content" element={<SiteContentAdmin />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
}