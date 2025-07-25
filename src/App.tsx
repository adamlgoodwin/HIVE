import { MantineProvider, Container } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedLayout } from './layouts/ProtectedLayout';
import { CoursesPage } from './pages/CoursesPage';
import { QuickLoginPage } from './pages/QuickLoginPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TestingTablePage from './pages/TestingTablePage';
import { DevNavigation } from './components/DevNavigation';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-react-table/styles.css';

function App() {
  return (
    <MantineProvider>
      <Notifications />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedLayout>
                  <Container size="xl" p="md">
                    <DevNavigation />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/courses" element={<CoursesPage />} />
                      <Route path="/quick-login" element={<QuickLoginPage />} />
                      <Route path="/testing-tables" element={<TestingTablePage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Container>
                </ProtectedLayout>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
