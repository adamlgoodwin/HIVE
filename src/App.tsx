import { MantineProvider, Container } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { CoursesPage } from './pages/CoursesPage';
import { QuickLoginPage } from './pages/QuickLoginPage';
import { DevNavigation } from './components/DevNavigation';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-react-table/styles.css';

function App() {
  // Simple routing based on URL path
  const currentPath = window.location.pathname;
  
  return (
    <MantineProvider>
      <Notifications />
      <Container size="xl" p="md">
        <DevNavigation />
        {currentPath === '/login' || currentPath === '/quick-login' ? (
          <QuickLoginPage />
        ) : (
          <CoursesPage />
        )}
      </Container>
    </MantineProvider>
  );
}

export default App;
