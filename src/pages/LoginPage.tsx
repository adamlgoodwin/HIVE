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
  Divider,
  Group,
} from '@mantine/core';
import { IconAlertCircle, IconMail, IconLock } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Navigation will be handled by AuthContext
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      setMagicLinkSent(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={120}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title ta="center" mb="lg">
          Welcome to HIVE
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

        {magicLinkSent ? (
          <Alert
            icon={<IconMail />}
            title="Magic Link Sent!"
            color="blue"
            mb="md"
          >
            <Text>
              Check your email for a magic link to sign in. You can close this page.
            </Text>
            <Button
              variant="subtle"
              size="sm"
              mt="sm"
              onClick={() => setMagicLinkSent(false)}
            >
              Try a different email
            </Button>
          </Alert>
        ) : (
          <form onSubmit={handleEmailLogin}>
            <Stack>
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
                placeholder="Your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftSection={<IconLock size={16} />}
                disabled={loading}
              />

              <Group justify="space-between" mt="sm">
                <Anchor
                  component="button"
                  type="button"
                  size="sm"
                  onClick={handleMagicLink}
                  disabled={loading}
                >
                  Send magic link instead
                </Anchor>
                
                <Anchor
                  component="button"
                  type="button"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  disabled={loading}
                >
                  Need an account?
                </Anchor>
              </Group>

              <Button
                type="submit"
                fullWidth
                mt="xl"
                loading={loading}
                disabled={!email || !password}
              >
                Sign In
              </Button>

              <Divider label="or" labelPosition="center" my="lg" />

              <Button
                variant="outline"
                fullWidth
                onClick={handleMagicLink}
                loading={loading && !password}
                disabled={!email}
                leftSection={<IconMail size={16} />}
              >
                Send Magic Link
              </Button>
            </Stack>
          </form>
        )}

        <Text ta="center" mt="lg" size="sm" c="dimmed">
          Educational course management system
        </Text>
      </Paper>
    </Container>
  );
}
