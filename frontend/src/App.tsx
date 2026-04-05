import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleGuard } from './guards/RoleGuard';
import AnalyticsPage from './pages/Analytics';
import DashboardPage from './pages/Dashboard';
import ForgotPasswordPage from './pages/ForgotPassword';
import LoginPage from './pages/Login';
import RecordsPage from './pages/Records';
import ReportsPage from './pages/Reports';
import UsersPage from './pages/Users';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/reports"
            element={
              <RoleGuard roles={['ANALYST', 'ADMIN']}>
                <ReportsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/records"
            element={
              <RoleGuard roles={['ANALYST', 'ADMIN']}>
                <RecordsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/analytics"
            element={
              <RoleGuard roles={['ANALYST', 'ADMIN']}>
                <AnalyticsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/users"
            element={
              <RoleGuard roles={['ADMIN']}>
                <UsersPage />
              </RoleGuard>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
