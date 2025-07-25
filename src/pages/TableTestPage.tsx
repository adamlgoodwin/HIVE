import { Container, Title, Text, Stack, Divider, Paper, Group, Badge } from '@mantine/core';
import GenericDataTable from '../components/GenericDataTable';
import { 
  courseTableConfig, 
  courseCatalogConfig, 
  coursePickerConfig, 
  simpleCourseListConfig 
} from '../configs/tableConfigs';

export function TableTestPage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="sm">
            🧪 Generic Table System Test Lab
          </Title>
          <Text size="lg" c="dimmed">
            Demonstrating how the same data can be displayed in completely different table configurations
          </Text>
        </div>

        {/* Test 1: Full-Featured Table */}
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={2} size="h3">
              1️⃣ Full-Featured Course Management
            </Title>
            <Badge color="blue" variant="light">
              All Features Enabled
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            ✅ Editing • ✅ Adding • ✅ Deleting • ✅ Bulk Ops • ✅ Cut/Copy/Paste • ✅ Ordering • ✅ Column Control • ✅ Filtering
          </Text>
          <GenericDataTable config={courseTableConfig} />
        </Paper>

        <Divider my="xl" />

        {/* Test 2: Read-Only Catalog */}
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={2} size="h3">
              2️⃣ Course Catalog (Read-Only)
            </Title>
            <Badge color="green" variant="light">
              Display Only
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            🎨 Custom styling • 🚫 No editing • 🎯 Filtering only • 💎 Custom cell renderers
          </Text>
          <GenericDataTable config={courseCatalogConfig} />
        </Paper>

        <Divider my="xl" />

        {/* Test 3: Course Picker */}
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={2} size="h3">
              3️⃣ Course Selection Interface
            </Title>
            <Badge color="violet" variant="light">
              Custom Actions
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            🎛️ Custom toolbar actions • ⚡ Custom row actions • 🎯 Multi-select only • 🎨 Custom styling
          </Text>
          <GenericDataTable config={coursePickerConfig} />
        </Paper>

        <Divider my="xl" />

        {/* Test 4: Ultra-Simple List */}
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={2} size="h3">
              4️⃣ Ultra-Minimal Course List
            </Title>
            <Badge color="gray" variant="light">
              Bare Minimum
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            🎯 Single column • 🚫 No features • 🚫 No header • 📱 Perfect for dropdowns/selection lists
          </Text>
          <GenericDataTable config={simpleCourseListConfig} />
        </Paper>

        <Divider my="xl" />

        {/* Summary */}
        <Paper p="lg" withBorder style={{ backgroundColor: '#F8F9FA' }}>
          <Title order={3} mb="md">
            🎯 Key Takeaways
          </Title>
          <Stack gap="sm">
            <Text>
              <strong>✅ Same Data, Different Experiences:</strong> All tables use the same Course data but look and behave completely differently
            </Text>
            <Text>
              <strong>🎛️ Feature Toggle System:</strong> Pick and choose exactly which features each table needs
            </Text>
            <Text>
              <strong>🎨 Complete Customization:</strong> Custom styling, actions, cell renderers, and layouts per table
            </Text>
            <Text>
              <strong>🔌 Service Abstraction:</strong> Any entity can be used by implementing the simple interfaces
            </Text>
            <Text>
              <strong>📈 Scalable Architecture:</strong> Add new table types without modifying core component
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
