import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Alert,
  Stack,
  Anchor,
} from '@mantine/core';
import { IconAlertCircle, IconMail, IconLock, IconUser } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container size={420} my={120}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert
            icon={<IconMail />}
            title="Check Your Email!"
            color="blue"
          >
            <Text mb="md">
              We've sent you a verification link. Please check your email and click the link to activate your account.
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={120}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title ta="center" mb="lg">
          Create Account
        </Title>

        {error && (
          <Alert
            icon={<IconAlertCircle />}
            title="Error"
            color="red"
            mb="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSignup}>
          <Stack>
            <TextInput
              label="Full Name"
              placeholder="Your full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftSection={<IconUser size={16} />}
              disabled={loading}
            />

            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftSection={<IconMail size={16} />}
              disabled={loading}
            />

            <PasswordInput
              label="Password"
              placeholder="Choose a secure password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftSection={<IconLock size={16} />}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              mt="xl"
              loading={loading}
              disabled={!email || !password || !fullName}
            >
              Create Account
            </Button>

            <Text ta="center" mt="md">
              Already have an account?{' '}
              <Anchor onClick={() => navigate('/login')}>
                Sign in
              </Anchor>
            </Text>
          </Stack>
        </form>

        <Text ta="center" mt="lg" size="sm" c="dimmed">
          By creating an account, you agree to our terms of service
        </Text>
      </Paper>
    </Container>
  );
}
