import { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  Card,
  Grid,
  Alert,
  Divider
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLogin, IconUser, IconSchool, IconAlertCircle } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: string;
  description: string;
  color: string;
}

const testUsers: TestUser[] = [
  {
    email: 'adam.test@example.com',
    password: '123456',
    name: 'Adam Goodwin',
    role: 'Platform Admin',
    description: 'Full system access',
    color: 'red'
  },
  {
    email: 'school1@test.com',
    password: '123456',
    name: 'Sarah Johnson',
    role: 'School Admin',
    description: 'Riverside Elementary',
    color: 'blue'
  },
  {
    email: 'school2@test.com',
    password: '123456',
    name: 'Michael Chen',
    role: 'School Admin',
    description: 'Metro High School',
    color: 'blue'
  },
  {
    email: 'staff1@test.com',
    password: '123456',
    name: 'Lisa Rodriguez',
    role: 'Staff',
    description: 'Administrative staff',
    color: 'green'
  },
  {
    email: 'staff2@test.com',
    password: '123456',
    name: 'James Wilson',
    role: 'Staff',
    description: 'Administrative staff',
    color: 'green'
  },
  {
    email: 'teacher1@test.com',
    password: '123456',
    name: 'Emily Davis',
    role: 'Teacher',
    description: 'Math Teacher',
    color: 'violet'
  },
  {
    email: 'teacher2@test.com',
    password: '123456',
    name: 'Robert Martinez',
    role: 'Teacher',
    description: 'Science Teacher',
    color: 'violet'
  },
  {
    email: 'teacher3@test.com',
    password: '123456',
    name: 'Jennifer Lee',
    role: 'Teacher',
    description: 'English Teacher',
    color: 'violet'
  },
  {
    email: 'student1@test.com',
    password: '123456',
    name: 'Alex Thompson',
    role: 'Student',
    description: 'Riverside Elementary',
    color: 'cyan'
  },
  {
    email: 'student2@test.com',
    password: '123456',
    name: 'Maya Patel',
    role: 'Student',
    description: 'Riverside Elementary',
    color: 'cyan'
  },
  {
    email: 'student3@test.com',
    password: '123456',
    name: 'Daniel Kim',
    role: 'Student',
    description: 'Metro High School',
    color: 'cyan'
  },
  {
    email: 'parent1@test.com',
    password: '123456',
    name: 'Maria Thompson',
    role: 'Parent/Observer',
    description: 'Parent of Alex',
    color: 'orange'
  },
  {
    email: 'parent2@test.com',
    password: '123456',
    name: 'David Patel',
    role: 'Parent/Observer',
    description: 'Parent of Maya',
    color: 'orange'
  }
];

export function QuickLoginPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (user: TestUser) => {
    setLoading(user.email);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error) {
        throw error;
      }

      notifications.show({
        title: 'Login Successful!',
        message: `Welcome back, ${user.name}!`,
        color: 'green',
        icon: <IconUser />
      });

      // Redirect to main app or dashboard
      window.location.href = '/';

    } catch (error: any) {
      console.error('Login error:', error);
      
      notifications.show({
        title: 'Login Failed',
        message: error.message || 'Please check your credentials',
        color: 'red',
        icon: <IconAlertCircle />
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSignUp = async (user: TestUser) => {
    setLoading(`signup-${user.email}`);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.name.split(' ')[0],
            last_name: user.name.split(' ')[1] || '',
            display_name: user.name
          },
          // Skip email confirmation for development
          emailRedirectTo: undefined
        }
      });

      if (error) {
        throw error;
      }

      notifications.show({
        title: 'Account created!',
        message: `User ${user.name} created successfully. If you can't sign in immediately, check email confirmation settings in Supabase.`,
        color: 'green',
        icon: <IconUser size={16} />
      });

    } catch (error: any) {
      console.error('Signup error:', error);
      
      notifications.show({
        title: 'Signup Failed',
        message: error.message || 'Could not create account',
        color: 'red',
        icon: <IconAlertCircle />
      });
    } finally {
      setLoading(null);
    }
  };

  const createAllAccounts = async () => {
    setLoading('create-all');
    let successCount = 0;
    let errorCount = 0;

    for (const user of testUsers) {
      try {
        const { error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              first_name: user.name.split(' ')[0],
              last_name: user.name.split(' ')[1] || '',
              display_name: user.name
            }
          }
        });

        if (error && !error.message.includes('already')) {
          throw error;
        }
        
        successCount++;
      } catch (error) {
        console.error(`Failed to create account for ${user.email}:`, error);
        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    notifications.show({
      title: 'Bulk Account Creation Complete',
      message: `Created ${successCount} accounts, ${errorCount} errors`,
      color: errorCount > 0 ? 'yellow' : 'green'
    });
    
    setLoading(null);
  };

  return (
    <Stack gap="xl" p="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="md">
          <Group>
            <IconLogin size={32} />
            <div>
              <Title order={2}>Quick Login - Development Testing</Title>
              <Text c="dimmed">All accounts use password: <strong>123</strong></Text>
            </div>
          </Group>

          <Alert icon={<IconAlertCircle />} color="yellow">
            <Text size="sm">
              <strong>Development Only:</strong> These are test accounts with simple passwords. 
              Don't use in production!
            </Text>
          </Alert>

          <Group>
            <Button 
              variant="filled" 
              color="blue"
              onClick={createAllAccounts}
              loading={loading === 'create-all'}
              leftSection={<IconUser />}
            >
              Create All Test Accounts
            </Button>
            <Text size="sm" c="dimmed">
              Run this first to create all test users in Supabase Auth
            </Text>
          </Group>

          <Divider label="Test Accounts" labelPosition="center" />
        </Stack>
      </Paper>

      <Grid>
        {testUsers.map((user) => (
          <Grid.Col key={user.email} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card withBorder radius="md" p="md" h="100%">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Badge color={user.color} variant="light">
                    {user.role}
                  </Badge>
                  <IconSchool size={16} />
                </Group>
                
                <div>
                  <Text fw={500} size="sm">{user.name}</Text>
                  <Text size="xs" c="dimmed">{user.email}</Text>
                  <Text size="xs" c="dimmed">{user.description}</Text>
                </div>

                <Stack gap="xs">
                  <Button
                    fullWidth
                    variant="filled"
                    size="sm"
                    onClick={() => handleLogin(user)}
                    loading={loading === user.email}
                    leftSection={<IconLogin size={14} />}
                  >
                    Sign In
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="light"
                    size="xs"
                    onClick={() => handleSignUp(user)}
                    loading={loading === `signup-${user.email}`}
                    color="gray"
                  >
                    Create Account
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Paper p="md" radius="md" withBorder>
        <Text size="sm" c="dimmed">
          <strong>Note:</strong> After creating accounts and running the seed data SQL, 
          these users will have proper roles and organization memberships set up for testing.
        </Text>
      </Paper>
    </Stack>
  );
}

export default QuickLoginPage;
