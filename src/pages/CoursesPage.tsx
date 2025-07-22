import { Container, Title, Text, Space } from '@mantine/core';
import { DatabaseTable } from '../components/DatabaseTable';

export function CoursesPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">
        Educational App - Course Management (Database Connected)
      </Title>
      <Text size="lg" c="dimmed" mb="xl">
        🔄 Drag rows to reorder • 📝 Click Edit to modify • 🔍 Use search filters • ↔️ Drag columns to rearrange • 🌐 Real-time sync across devices
      </Text>
      
      <DatabaseTable />
      
      <Space h="xl" />
      <Text size="sm" c="dimmed" ta="center">
        Built with React, TypeScript, Mantine, and Vite
      </Text>
    </Container>
  );
}
