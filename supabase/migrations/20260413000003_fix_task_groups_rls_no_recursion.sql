-- Fix task_groups RLS policies to eliminate recursion
-- Remove dependency on my_role() helper function and board_members subqueries

-- Drop existing policies
DROP POLICY IF EXISTS "task_groups: read if board member" ON task_groups;
DROP POLICY IF EXISTS "task_groups: owner/editor manages" ON task_groups;

-- Create new SELECT policy without recursion
-- Users can read task_groups if they are a master or if they own/are member of the board
CREATE POLICY task_groups_select_policy ON task_groups
  FOR SELECT
  USING (
    -- Master users can see all
    auth.uid() IN (
      SELECT id FROM profiles WHERE role_global = 'master'
    )
    OR
    -- Board owners/editors/viewers can see groups in their boards
    board_id IN (
      SELECT b.id
      FROM boards b
      INNER JOIN workspaces w ON w.id = b.workspace_id
      INNER JOIN profiles p ON p.organization_id = w.organization_id
      WHERE p.id = auth.uid()
    )
  );

-- Create new INSERT/UPDATE/DELETE policy for owners and editors
CREATE POLICY task_groups_modify_policy ON task_groups
  FOR ALL
  USING (
    -- Master users can modify all
    auth.uid() IN (
      SELECT id FROM profiles WHERE role_global = 'master'
    )
    OR
    -- Board owners/editors can modify groups
    board_id IN (
      SELECT b.id
      FROM boards b
      INNER JOIN workspaces w ON w.id = b.workspace_id  
      INNER JOIN profiles p ON p.organization_id = w.organization_id
      WHERE p.id = auth.uid()
        AND p.role_global IN ('master', 'collaborator')
    )
  );

-- Add comments
COMMENT ON POLICY task_groups_select_policy ON task_groups IS 
  'Allow users to read task groups if they are master or member of the board organization';
  
COMMENT ON POLICY task_groups_modify_policy ON task_groups IS 
  'Allow masters and collaborators to modify task groups in their organization boards';
