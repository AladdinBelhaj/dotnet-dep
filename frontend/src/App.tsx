import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { theme } from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './features/auth/Login';
import { CreateUser } from './features/admin/CreateUser';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { InventoryPage } from './features/inventory/InventoryPage';
import { MovementsPage } from './features/movements/MovementsPage';
import { AuditLogsPage } from './features/admin/AuditLogsPage';
import { ReportsPage } from './features/reports/ReportsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user?.role === 'Admin' ? <>{children}</> : <Navigate to="/" replace />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="movements" element={<MovementsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="admin/audit-logs" element={<RequireAdmin><AuditLogsPage /></RequireAdmin>} />
        <Route path="admin/create-user" element={<RequireAdmin><CreateUser /></RequireAdmin>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
