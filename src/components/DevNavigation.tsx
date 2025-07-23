import { Group, Button, Paper, Text } from '@mantine/core';
import { IconHome, IconLogin, IconDatabase } from '@tabler/icons-react';

export function DevNavigation() {
  const currentPath = window.location.pathname;

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.location.reload();
  };

  return (
    <Paper p="sm" withBorder mb="md">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>Development Navigation</Text>
        <Group>
          <Button 
            size="xs" 
            variant={currentPath === '/' ? 'filled' : 'light'}
            leftSection={<IconHome size={14} />}
            onClick={() => navigateTo('/')}
          >
            Home
          </Button>
          <Button 
            size="xs" 
            variant={currentPath === '/testing-tables' ? 'filled' : 'light'}
            leftSection={<IconDatabase size={14} />}
            onClick={() => navigateTo('/testing-tables')}
          >
            Testing Tables
          </Button>
          <Button 
            size="xs" 
            variant={currentPath === '/quick-login' ? 'filled' : 'light'}
            leftSection={<IconLogin size={14} />}
            onClick={() => navigateTo('/quick-login')}
          >
            Quick Login
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
