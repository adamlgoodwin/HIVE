import { Container, Card, Title, Text, Button } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { userWithRoles, activeOrg, loading } = useAuth();
  
  // Show loading while auth is loading
  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </Container>
    );
  }

  // Require proper authentication with roles
  if (!userWithRoles) {
    return (
      <Container size="md" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={2} mb="md">Welcome to Hive</Title>
          <Text mb="md">
            Please login to access your dashboard.
          </Text>
          <Button component={Link} to="/login" variant="filled">
            Login
          </Button>
        </Card>
      </Container>
    );
  }

  // Extract user info
  const userName = userWithRoles.profile?.display_name || userWithRoles.profile?.email || 'User';
  const userRole = userWithRoles.organizations?.[0]?.role || 'learner';
  const orgName = activeOrg?.name || userWithRoles.organizations?.[0]?.organization?.name || 'No Organization';

  return (
    <Container size="lg" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={1} mb="md">
          Welcome back, {userName}!
        </Title>
        
        <Text size="lg" mb="md">
          Your authentication system is now fully working! 🎉
        </Text>
        
        <Text mb="md">
          <strong>Organization:</strong> {orgName}
        </Text>
        
        <Text mb="md">
          <strong>Role:</strong> {userRole}
        </Text>
        
        <Button component={Link} to="/courses" variant="filled" mt="md">
          Browse Courses
        </Button>
      </Card>
    </Container>
  );
}
