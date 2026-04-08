# Requirements Document

## Introduction

This feature extends the existing drag-and-drop functionality (Task 6.1.1) to allow users to move tasks between different groups within a board. Currently, users can only reorder tasks within the same group. This enhancement enables visual priority adjustment across the entire board by allowing tasks to be moved from one group to another via drag-and-drop interaction.

The feature maintains the security model (RLS policies, permission checks), follows the mobile-first approach (drag disabled on mobile), and preserves the existing drag-within-group functionality.

## Glossary

- **Task**: A work item within a board, stored in the `tasks` table with fields including `id`, `board_id`, `group_id`, `title`, `position`
- **Group**: A collection of tasks within a board, stored in the `task_groups` table with fields including `id`, `board_id`, `name`, `color`, `sort_order`
- **Drag_System**: The frontend drag-and-drop interaction system that handles dragstart, dragover, and drop events
- **Reorder_API**: The backend API endpoint `/api/tasks/reorder` that validates permissions and persists task position changes
- **Move_API**: The new backend API endpoint that will handle moving tasks between groups
- **Source_Group**: The group from which a task is being dragged
- **Target_Group**: The group into which a task is being dropped
- **Position**: An integer field on tasks that determines display order within a group (0-indexed)
- **RLS_Policy**: Row-Level Security policy in Supabase that enforces data access rules
- **Permission_Check**: Backend validation that verifies user has master, owner, or editor role
- **Optimistic_Update**: Frontend technique where UI updates immediately before backend confirmation
- **Rollback**: Reverting UI state when backend operation fails

## Requirements

### Requirement 1: Move Task Between Groups

**User Story:** As a board editor, I want to drag a task from one group and drop it into another group, so that I can reorganize tasks across different workflow stages.

#### Acceptance Criteria

1. WHEN a user drags a task over a different group, THE Drag_System SHALL display visual feedback indicating the target group
2. WHEN a user drops a task into a different group, THE Drag_System SHALL update the task's group_id to the target group
3. WHEN a task is moved to a different group, THE Move_API SHALL recalculate positions in both source and target groups
4. WHEN a task is moved between groups, THE Drag_System SHALL preserve the existing drag-within-group functionality
5. THE Move_API SHALL validate that the user has editor, owner, or master permissions before allowing the move

### Requirement 2: Position Recalculation

**User Story:** As a system, I want to maintain correct task positions in both groups after a move, so that task order remains consistent and predictable.

#### Acceptance Criteria

1. WHEN a task is removed from the source group, THE Move_API SHALL recalculate positions for remaining tasks in the source group
2. WHEN a task is added to the target group, THE Move_API SHALL assign it the next available position in the target group
3. WHEN position recalculation occurs, THE Move_API SHALL update all affected tasks in a single transaction
4. THE Move_API SHALL ensure position values remain sequential (0, 1, 2, ...) within each group
5. IF position recalculation fails, THEN THE Move_API SHALL return an error and prevent the move

### Requirement 3: Security and Validation

**User Story:** As a system administrator, I want all cross-group moves to be validated and secured, so that unauthorized users cannot modify board data.

#### Acceptance Criteria

1. THE Move_API SHALL verify the user is authenticated before processing any move request
2. THE Move_API SHALL validate that both source and target groups belong to the same board
3. THE Move_API SHALL validate that the task being moved exists and belongs to the source group
4. THE Move_API SHALL check user permissions (master, owner, or editor) on the board before allowing the move
5. IF any validation fails, THEN THE Move_API SHALL return a 400 or 403 error with a descriptive message
6. THE Move_API SHALL use Zod schema validation for all input parameters

### Requirement 4: Optimistic Updates and Error Handling

**User Story:** As a user, I want immediate visual feedback when I move a task, with automatic rollback if the operation fails, so that the interface feels responsive and reliable.

#### Acceptance Criteria

1. WHEN a user drops a task into a different group, THE Drag_System SHALL immediately update the UI before backend confirmation
2. WHEN the backend move operation succeeds, THE Drag_System SHALL maintain the updated UI state
3. IF the backend move operation fails, THEN THE Drag_System SHALL revert the task to its original group and position
4. WHEN a rollback occurs, THE Drag_System SHALL display an error message to the user
5. THE Drag_System SHALL disable further drag operations while a move is in progress

### Requirement 5: Visual Feedback and UX

**User Story:** As a user, I want clear visual indicators when dragging tasks between groups, so that I understand where the task will be placed.

#### Acceptance Criteria

1. WHEN a task is dragged over a different group, THE Drag_System SHALL highlight the target group with a border or background color
2. WHEN a task is being dragged, THE Drag_System SHALL reduce opacity of the dragged task
3. WHEN a group is empty, THE Drag_System SHALL allow dropping tasks on the group header or empty area
4. THE Drag_System SHALL display a visual indicator (e.g., drag handle) on tasks when hovering in desktop mode
5. WHILE on mobile devices (< 640px), THE Drag_System SHALL disable all drag-and-drop functionality

### Requirement 6: Empty Group Handling

**User Story:** As a user, I want to be able to drop tasks into empty groups, so that I can populate new workflow stages.

#### Acceptance Criteria

1. WHEN a group has no tasks, THE Drag_System SHALL allow dropping tasks on the group header area
2. WHEN a group has no tasks, THE Drag_System SHALL allow dropping tasks on the empty content area
3. WHEN a task is dropped into an empty group, THE Move_API SHALL assign it position 0
4. THE Drag_System SHALL display the same visual feedback for empty groups as for groups with tasks
5. WHEN the last task is removed from a group, THE Drag_System SHALL maintain the group's visibility and drop target functionality

### Requirement 7: Database Consistency

**User Story:** As a system, I want all database updates to maintain referential integrity, so that data remains consistent across operations.

#### Acceptance Criteria

1. WHEN a task's group_id is updated, THE Move_API SHALL verify the target group exists and belongs to the same board
2. WHEN multiple tasks are updated, THE Move_API SHALL use database transactions to ensure atomicity
3. IF any database operation fails, THEN THE Move_API SHALL rollback all changes in the transaction
4. THE Move_API SHALL preserve the task's board_id when moving between groups
5. THE Move_API SHALL update the task's updated_at timestamp when the move completes

### Requirement 8: API Contract

**User Story:** As a backend developer, I want a clear API contract for moving tasks between groups, so that the frontend can reliably integrate with the backend.

#### Acceptance Criteria

1. THE Move_API SHALL accept a request body with task_id, source_group_id, and target_group_id
2. THE Move_API SHALL return a 200 status with success: true when the move completes successfully
3. THE Move_API SHALL return a 400 status when input validation fails
4. THE Move_API SHALL return a 401 status when the user is not authenticated
5. THE Move_API SHALL return a 403 status when the user lacks sufficient permissions
6. THE Move_API SHALL return a 500 status when a database operation fails
7. THE Move_API SHALL use exact database column names (group_id, not groupId) in all operations

### Requirement 9: Integration with Existing Code

**User Story:** As a developer, I want the new functionality to integrate seamlessly with existing code, so that maintenance is straightforward and bugs are minimized.

#### Acceptance Criteria

1. THE Drag_System SHALL reuse existing drag event handlers (onDragStart, onDragOver, onDrop, onDragEnd)
2. THE Drag_System SHALL extend the existing draggingTaskId and dragOverTaskId state management
3. THE Move_API SHALL follow the same security pattern as the existing /api/tasks/reorder endpoint
4. THE Drag_System SHALL call the existing refreshGroupTasks function after a successful move
5. THE Drag_System SHALL maintain compatibility with the existing TaskRow component drag functionality

### Requirement 10: Performance and Responsiveness

**User Story:** As a user, I want drag-and-drop operations to feel instant and smooth, so that I can efficiently reorganize my tasks.

#### Acceptance Criteria

1. WHEN a task is dropped, THE Drag_System SHALL update the UI within 100ms
2. WHEN the backend operation completes, THE Move_API SHALL respond within 500ms under normal load
3. THE Drag_System SHALL not block user interaction while waiting for backend confirmation
4. THE Drag_System SHALL batch position updates to minimize database operations
5. WHEN multiple tasks are moved in quick succession, THE Drag_System SHALL queue operations to prevent race conditions
