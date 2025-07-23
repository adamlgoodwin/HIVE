import { useState, useEffect } from 'react'
import { Box, Button, Text, Stack, Group, Alert, Code } from '@mantine/core'
import { LinkedListCourseService } from '../services/linkedListCourseService'
import type { Course } from '../lib/supabase'

/**
 * 🚀 Linked List Ordering Demo
 * 
 * Demonstrates the superior linked-list approach:
 * - O(1) insertions with no reordering needed
 * - Clean 1,2,3... display numbers
 * - Infinite insertion capacity
 */
export function LinkedListDemo() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await LinkedListCourseService.getOrderedCourses()
      setCourses(data)
      setMessage(`✅ Loaded ${data.length} courses`)
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
      console.error('Failed to load courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const insertBlankCourse = async (belowCourseId: string) => {
    try {
      setLoading(true)
      await LinkedListCourseService.insertCourseBelow(belowCourseId, {
        id: `NEW${Date.now()}`,
        title: '', // Blank course
        instructor: '',
      })
      setMessage(`🎯 Inserted blank course below ${belowCourseId}`)
      await loadCourses()
    } catch (err) {
      setMessage(`❌ Insert failed: ${err}`)
      console.error('Failed to insert course:', err)
    } finally {
      setLoading(false)
    }
  }

  const initializeSystem = async () => {
    try {
      setLoading(true)
      await LinkedListCourseService.initializeFromOrderIndex()
      setMessage('🔄 Initialized linked list from existing order_index')
      await loadCourses()
    } catch (err) {
      setMessage(`❌ Initialization failed: ${err}`)
      console.error('Failed to initialize:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  return (
    <Box p="md">
      <Stack gap="md">
        <Group>
          <Text size="xl" fw={700}>🚀 Linked-List Ordering Demo</Text>
          <Button onClick={initializeSystem} loading={loading} variant="outline">
            Initialize System
          </Button>
          <Button onClick={loadCourses} loading={loading}>
            Refresh
          </Button>
        </Group>

        {message && (
          <Alert color={message.includes('❌') ? 'red' : 'green'}>
            {message}
          </Alert>
        )}

        <Alert color="blue" title="🎯 How It Works">
          <Text size="sm">
            • <strong>Display:</strong> Shows clean 1,2,3... numbers<br/>
            • <strong>Backend:</strong> Uses pointer-based linked list<br/>
            • <strong>Insertions:</strong> O(1) operations, no reordering needed<br/>
            • <strong>Capacity:</strong> Infinite insertions possible
          </Text>
        </Alert>

        <Stack gap="xs">
          <Text fw={600}>Course List ({courses.length} total):</Text>
          
          {courses.map((course) => (
            <Box key={course.id} p="sm" style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <Group justify="space-between" align="center">
                <Group>
                  <Text fw={600} c="blue">#{course.displayOrder}</Text>
                  <Text>{course.title || '[Blank Course]'}</Text>
                  <Text c="dimmed">{course.instructor || '[No Instructor]'}</Text>
                  <Code size="xs">{course.id}</Code>
                </Group>
                <Group>
                  <Button 
                    size="xs" 
                    variant="light"
                    onClick={() => insertBlankCourse(course.id)}
                    loading={loading}
                  >
                    Insert Below
                  </Button>
                </Group>
              </Group>
              
              {/* Show backend structure */}
              <Text size="xs" c="dimmed" mt="xs">
                Backend: next_course_id = {course.next_course_id || 'NULL (end of chain)'}
              </Text>
            </Box>
          ))}

          {courses.length === 0 && (
            <Text c="dimmed" ta="center" py="xl">
              No courses found. Click "Initialize System" first.
            </Text>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
