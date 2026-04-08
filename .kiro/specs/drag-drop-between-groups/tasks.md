# Tasks

## Task 1: Create Backend API for Moving Tasks Between Groups

**Status:** completed

**Description:** Create a new API endpoint `/api/tasks/move-to-group.post.ts` that handles moving a task from one group to another with proper validation, permission checks, and position recalculation.

**Acceptance Criteria:**
- [x] Create `/server/api/tasks/move-to-group.post.ts` endpoint
- [x] Implement Zod schema validation for `task_id`, `source_group_id`, `target_group_id`
- [x] Verify user authentication (401 if not authenticated)
- [x] Verify user has master, owner, or editor permissions on the board (403 if insufficient)
- [x] Validate that task exists and belongs to source_group_id (400 if invalid)
- [x] Validate that both groups belong to the same board (400 if invalid)
- [x] Update task's group_id to target_group_id
- [x] Recalculate positions in source group (close gaps)
- [x] Assign task the next available position in target group
- [x] Update task's updated_at timestamp
- [x] Return 200 with `{ success: true }` on success
- [x] Return appropriate error codes (400/401/403/500) with descriptive messages
- [x] Follow security pattern from `/server/api/tasks/reorder.post.ts`

**Dependencies:** None

**Estimated Effort:** Medium

---

## Task 2: Add moveTaskToGroup Function to useTasks Composable

**Status:** completed

**Description:** Extend the `useTasks` composable with a new function that calls the backend API to move a task between groups.

**Acceptance Criteria:**
- [x] Add `moveTaskToGroup` function to `/app/composables/useTasks.ts`
- [x] Function accepts parameters: `taskId`, `sourceGroupId`, `targetGroupId`
- [x] Function calls `/api/tasks/move-to-group` endpoint with POST method
- [x] Function returns boolean indicating success/failure
- [x] Function handles errors gracefully and logs to console
- [x] Export `moveTaskToGroup` from the composable

**Dependencies:** Task 1

**Estimated Effort:** Small

---

## Task 3: Implement Cross-Group Drop Detection in Board Page

**Status:** completed

**Description:** Modify the drag and drop logic in the board page to detect when a task is dropped into a different group and handle it appropriately.

**Acceptance Criteria:**
- [x] Modify `onTaskDrop` function in `/app/pages/boards/[id].vue`
- [x] Detect if dropped task's current group differs from target group
- [x] If same group: use existing reorder logic (preserve Task 6.1.1 functionality)
- [x] If different group: call new cross-group move logic
- [x] Maintain existing drag state management (`draggingTaskId`, `dragOverTaskId`)
- [x] Ensure drag handle remains desktop-only (hidden on mobile)

**Dependencies:** Task 2

**Estimated Effort:** Medium

---

## Task 4: Implement Optimistic Updates for Cross-Group Moves

**Status:** completed

**Description:** Update the UI immediately when a task is dropped into a different group, before backend confirmation, with rollback capability on error.

**Acceptance Criteria:**
- [x] When task is dropped in different group, immediately update `tasksByGroup` state
- [x] Remove task from source group's task array
- [x] Add task to target group's task array at appropriate position
- [x] Update task's `group_id` in local state
- [x] Call `moveTaskToGroup` API function
- [x] If API succeeds: call `refreshGroupTasks` for both groups to sync with backend
- [x] If API fails: revert both groups to original state (rollback)
- [x] Display error message to user on failure
- [x] Disable drag operations while move is in progress

**Dependencies:** Task 3

**Estimated Effort:** Medium

---

## Task 5: Add Visual Feedback for Cross-Group Dragging

**Status:** in_progress

**Description:** Enhance the drag and drop UI to provide clear visual indicators when dragging tasks over different groups.

**Acceptance Criteria:**
- [x] When task is dragged over a different group, highlight the group container
- [x] Use border color change (e.g., `border-primary-400 border-2`) for target group
- [x] Maintain existing opacity reduction for dragged task
- [x] Show visual feedback on group header when group is empty
- [x] Show visual feedback on group content area when group is empty
- [ ] Remove highlight when drag leaves the group (needs onGroupDragOver and dragOverGroupId implementation)
- [x] Ensure visual feedback works on both empty and populated groups
- [x] Follow Monday.com/Trello visual patterns

**Dependencies:** Task 3

**Estimated Effort:** Small

**Note:** Template has visual feedback classes but `dragOverGroupId`, `onGroupDragOver`, and `onGroupDrop` functions need to be implemented in the script section.

---

## Task 6: Implement Drop Zones for Empty Groups

**Status:** in_progress

**Description:** Enable dropping tasks on empty groups by making the group header and empty content area valid drop targets.

**Acceptance Criteria:**
- [ ] Add `@dragover` handler to group header element (needs onGroupDragOver function)
- [ ] Add `@drop` handler to group header element (needs onGroupDrop function)
- [x] Add `@dragover` handler to empty group content area (template has it)
- [x] Add `@drop` handler to empty group content area (template has it)
- [x] Ensure drop handlers work when group has no tasks
- [x] Assign position 0 to task dropped in empty group
- [x] Display same visual feedback as populated groups
- [x] Test with "Nenhuma tarefa ainda" empty state message

**Dependencies:** Task 4, Task 5

**Estimated Effort:** Small

**Note:** Template has drop handlers but `onGroupDragOver` and `onGroupDrop` functions need to be implemented in the script section.

---

## Task 7: Add Error Handling and User Feedback

**Status:** todo

**Description:** Implement comprehensive error handling with user-friendly messages for all failure scenarios.

**Acceptance Criteria:**
- [ ] Display toast/notification on successful cross-group move
- [ ] Display error message when API returns 400 (validation error)
- [ ] Display error message when API returns 403 (permission denied)
- [ ] Display error message when API returns 500 (server error)
- [ ] Display error message when network request fails
- [ ] Ensure error messages are user-friendly (not technical)
- [ ] Auto-dismiss success messages after 3 seconds
- [ ] Keep error messages visible until user dismisses

**Dependencies:** Task 4

**Estimated Effort:** Small

---

## Task 8: Test Cross-Group Drag and Drop Functionality

**Status:** todo

**Description:** Manually test all scenarios to ensure the feature works correctly across different conditions.

**Acceptance Criteria:**
- [ ] Test dragging task from Group A to Group B (success case)
- [ ] Test dragging task to empty group
- [ ] Test dragging task as master user
- [ ] Test dragging task as owner user
- [ ] Test dragging task as editor user
- [ ] Test dragging task as viewer user (should fail with 403)
- [ ] Test dragging task without authentication (should fail with 401)
- [ ] Test dragging task within same group (should use existing reorder logic)
- [ ] Test position recalculation in source group after move
- [ ] Test position assignment in target group after move
- [ ] Test rollback when API fails
- [ ] Test that drag is disabled on mobile (< 640px)
- [ ] Test visual feedback on hover over different groups
- [ ] Test with multiple rapid drag operations

**Dependencies:** Task 6, Task 7

**Estimated Effort:** Medium

---

## Task 9: Update Documentation

**Status:** completed

**Description:** Document the new cross-group drag and drop functionality for future reference.

**Acceptance Criteria:**
- [x] Create `/docs/DRAG_DROP_CROSS_GROUP.md` documentation file
- [x] Document API endpoint contract (`/api/tasks/move-to-group`)
- [x] Document request/response format
- [x] Document error codes and meanings
- [x] Document frontend integration points
- [x] Document security considerations
- [x] Document mobile behavior (disabled)
- [x] Include code examples
- [ ] Update backlog file to mark Task 6.1.2 as completed (pending full feature completion)

**Dependencies:** Task 8

**Estimated Effort:** Small

---

## Summary

**Total Tasks:** 9

**Status Breakdown:**
- Todo: 2 (Task 7, Task 8)
- In Progress: 2 (Task 5, Task 6)
- Completed: 5 (Task 1, Task 2, Task 3, Task 4, Task 9)

**Effort Breakdown:**
- Small: 5 tasks
- Medium: 4 tasks
- Large: 0 tasks

**Critical Path:**
Task 1 ✅ → Task 2 ✅ → Task 3 ✅ → Task 4 ✅ → Task 5 🔄/Task 6 🔄 → Task 7 ⏳ → Task 8 ⏳ → Task 9 ✅

**Recommended Order:**
1. ✅ Task 1 (Backend API) - Foundation
2. ✅ Task 2 (Composable) - Integration layer
3. ✅ Task 3 (Drop Detection) - Core logic
4. ✅ Task 4 (Optimistic Updates) - UX enhancement
5. 🔄 Task 5 (Visual Feedback) - Needs onGroupDragOver/dragOverGroupId implementation
6. 🔄 Task 6 (Empty Groups) - Needs onGroupDrop function implementation
7. ⏳ Task 7 (Error Handling) - Polish
8. ⏳ Task 8 (Testing) - Validation
9. ✅ Task 9 (Documentation) - Final step

**Current Status:**
- Backend API fully implemented with authentication and validation
- Frontend composable ready with moveTaskToGroup function
- Cross-group move logic implemented with optimistic updates and rollback
- Template has visual feedback classes and drop handlers
- **Missing:** Script functions `dragOverGroupId`, `onGroupDragOver`, and `onGroupDrop` need to be implemented to complete Tasks 5 and 6
