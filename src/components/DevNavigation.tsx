import { Group, Button, Paper, Text, Select } from '@mantine/core';
import { IconHome, IconLogin, IconDatabase, IconLogout, IconUser } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function DevNavigation() {
  const location = useLocation();
  const { user, userWithRoles, activeOrg, setActiveOrg, signOut } = useAuth();

  // Organization selector data
  const orgData = userWithRoles?.organizations?.map(org => ({
    value: org.organization.id,
    label: org.organization.name
  })) || [];

  const handleOrgChange = (value: string | null) => {
    if (value) {
      const selectedOrg = userWithRoles?.organizations?.find(
        org => org.organization.id === value
      )?.organization;
      if (selectedOrg) {
        setActiveOrg(selectedOrg);
      }
    }
  };

  return (
    <Paper p="sm" withBorder mb="md">
      <Group justify="space-between" align="center">
        <Group>
          <Text size="sm" fw={500}>HIVE</Text>
          {user && (
            <Text size="xs" c="dimmed">
              Welcome, {user.email}
            </Text>
          )}
        </Group>
        
        <Group>
          {/* Organization Switcher */}
          {orgData.length > 0 && (
            <Select
              size="xs"
              data={orgData}
              value={activeOrg?.id || null}
              onChange={handleOrgChange}
              placeholder="Select organization"
              leftSection={<IconUser size={14} />}
              w={200}
            />
          )}
          
          {/* Navigation Buttons */}
          <Button 
            component={Link}
            to="/courses"
            size="xs" 
            variant={location.pathname === '/courses' ? 'filled' : 'light'}
            leftSection={<IconHome size={14} />}
          >
            Courses
          </Button>
          
          <Button 
            component={Link}
            to="/testing-tables"
            size="xs" 
            variant={location.pathname === '/testing-tables' ? 'filled' : 'light'}
            leftSection={<IconDatabase size={14} />}
          >
            Testing Tables
          </Button>
          
          <Button 
            component={Link}
            to="/quick-login"
            size="xs" 
            variant={location.pathname === '/quick-login' ? 'filled' : 'light'}
            leftSection={<IconLogin size={14} />}
          >
            Quick Login
          </Button>
          
          {/* Sign Out Button */}
          <Button 
            size="xs" 
            variant="subtle"
            color="red"
            leftSection={<IconLogout size={14} />}
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
