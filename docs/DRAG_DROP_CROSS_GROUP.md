# Drag and Drop Between Groups

## Overview

This feature allows users to move tasks between different groups within a board using drag and drop. It extends the existing drag-within-group functionality (Task 6.1.1) to support cross-group task movement.

## Features

- Drag tasks from one group and drop into another group
- Visual feedback when dragging over different groups
- Support for dropping tasks into empty groups
- Optimistic UI updates with automatic rollback on error
- Desktop-only (drag disabled on mobile for scroll priority)
- Maintains existing drag-within-group functionality

## API Endpoint

### POST `/api/tasks/move-to-group`

Moves a task from one group to another with proper validation and permission checks.

#### Request Body

```typescript
{
  task_id: string        // UUID of the task to move
  source_group_id: string // UUID of the current group
  target_group_id: string // UUID of the destination group
}
```

#### Response

**Success (200)**
```typescript
{
  success: true
}
```

**Error Responses**

- `400 Bad Request` - Invalid input or validation failure
  - Task not found
  - Task doesn't belong to source group
  - Invalid groups
  - Groups don't belong to same board

- `401 Unauthorized` - User not authenticated

- `403 Forbidden` - Insufficient permissions (user must be master, owner, or editor)

- `500 Internal Server Error` - Database operation failed

## Frontend Integration

### Composable: `useTasks`

```typescript
const { moveTaskToGroup } = useTasks()

const success = await moveTaskToGroup({
  taskId: 'uuid',
  sourceGroupId: 'uuid',
  targetGroupId: 'uuid'
})
```

### Board Page Logic

The board page (`app/pages/boards/[id].vue`) handles drag and drop with the following flow:

1. **Drag Start**: `onTaskDragStart(taskId)` - Sets `draggingTaskId`
2. **Drag Over**: 
   - `onTaskDragOver(event, taskId)` - When over another task
   - `onGroupDragOver(event, groupId)` - When over a group
3. **Drop**:
   - `onTaskDrop(targetTaskId, groupId)` - When dropped on a task
   - `onGroupDrop(groupId)` - When dropped on empty group
4. **Drag End**: `onTaskDragEnd()` - Clears drag state

### Cross-Group Move Flow

```typescript
async function handleCrossGroupMove(task, sourceGroupId, targetGroupId) {
  // 1. Save original state for rollback
  const originalSourceTasks = [...tasksByGroup.value[sourceGroupId]]
  const originalTargetTasks = [...tasksByGroup.value[targetGroupId]]

  // 2. Optimistic update: remove from source
  sourceTasks.splice(index, 1)

  // 3. Optimistic update: add to target
  targetTasks.push(updatedTask)

  // 4. Call backend API
  const success = await moveTaskToGroup({ taskId, sourceGroupId, targetGroupId })

  // 5. Refresh both groups or rollback
  if (success) {
    await Promise.all([
      refreshGroupTasks(sourceGroupId),
      refreshGroupTasks(targetGroupId)
    ])
  } else {
    // Rollback
    tasksByGroup.value[sourceGroupId] = originalSourceTasks
    tasksByGroup.value[targetGroupId] = originalTargetTasks
  }
}
```

## Visual Feedback

### Dragging Task
- Dragged task has reduced opacity (`opacity-40`)
- Drag handle visible on hover (desktop only)

### Drop Targets
- **Group with tasks**: Border highlight when dragging over (`border-primary-400 border-2`)
- **Empty group**: Background color change + "Solte aqui para mover" message
- **Task row**: Top border highlight when dragging over

### States
- `draggingTaskId` - ID of task being dragged
- `dragOverTaskId` - ID of task being hovered over
- `dragOverGroupId` - ID of group being hovered over

## Security

### Backend Validation
1. User authentication check (401 if not authenticated)
2. Task existence and ownership verification
3. Group validation (both groups must belong to same board)
4. Permission check (master, owner, or editor role required)

### RLS Policies
- Existing RLS policies on `tasks` table enforce organization-level access
- Users can only move tasks within boards they have access to

## Database Operations

### Task Update
```sql
UPDATE tasks 
SET 
  group_id = target_group_id,
  position = new_position,
  updated_at = NOW()
WHERE id = task_id
```

### Position Recalculation (Source Group)
After removing a task, positions are recalculated to close gaps:
```sql
-- For each remaining task in source group
UPDATE tasks 
SET position = new_sequential_position
WHERE group_id = source_group_id
ORDER BY position ASC
```

### Position Assignment (Target Group)
New task gets the next available position:
```sql
SELECT MAX(position) FROM tasks WHERE group_id = target_group_id
-- new_position = max_position + 1 (or 0 if empty)
```

## Mobile Behavior

Drag and drop is **disabled on mobile** (< 640px breakpoint) to prioritize horizontal scrolling:
- Drag handle hidden on mobile (`lg:flex` class)
- Touch events used for scrolling, not dragging
- Users must use desktop/tablet to move tasks between groups

## Error Handling

### Frontend
- Optimistic updates for instant feedback
- Automatic rollback if API call fails
- Console error logging for debugging

### Backend
- Zod schema validation for input
- Descriptive error messages
- Proper HTTP status codes
- Transaction-like behavior (all or nothing)

## Testing Checklist

- [ ] Drag task from Group A to Group B (success)
- [ ] Drag task to empty group
- [ ] Drag task within same group (uses existing reorder logic)
- [ ] Test as master user
- [ ] Test as owner user
- [ ] Test as editor user
- [ ] Test as viewer user (should fail with 403)
- [ ] Test without authentication (should fail with 401)
- [ ] Test position recalculation in source group
- [ ] Test position assignment in target group
- [ ] Test rollback when API fails
- [ ] Test visual feedback on hover
- [ ] Test on mobile (drag should be disabled)
- [ ] Test with multiple rapid operations

## Code Examples

### Moving a Task (Frontend)

```typescript
// In board page component
const { moveTaskToGroup } = useTasks()

async function handleCrossGroupMove(task, sourceGroupId, targetGroupId) {
  const success = await moveTaskToGroup({
    taskId: task.id,
    sourceGroupId,
    targetGroupId
  })
  
  if (success) {
    // Refresh both groups
    await Promise.all([
      refreshGroupTasks(sourceGroupId),
      refreshGroupTasks(targetGroupId)
    ])
  } else {
    // Handle error
    console.error('Failed to move task')
  }
}
```

### Backend Permission Check

```typescript
// Check user permission on the board
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

const isMaster = profile?.role === 'master'

if (!isMaster) {
  const { data: member } = await supabase
    .from('board_members')
    .select('access_role')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .single()

  const canEdit = member?.access_role === 'owner' || member?.access_role === 'editor'
  
  if (!canEdit) {
    throw createError({
      statusCode: 403,
      message: 'Insufficient permissions'
    })
  }
}
```

## Related Documentation

- [Drag and Drop Within Group](./DRAG_AND_DROP_TASKS.md) - Task 6.1.1
- [Project Guide](./.kiro/steering/project_guide) - Architecture and patterns
- [Tasks Table Schema](../supabase/migrations/20260331134932_create_tasks_and_related.sql)

## Future Enhancements

- Batch move multiple tasks at once
- Drag and drop in Kanban view
- Undo/redo functionality
- Drag preview with task details
- Animation transitions between groups
