-- Fix board_members RLS to allow users to see all members of boards they belong to
-- This is necessary for features like member lists, assignee dropdowns, etc.

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS board_members_select_final ON board_members;

-- Create a new policy that allows seeing all members of boards the user has access to
CREATE POLICY board_members_select_with_board_access ON board_members
  FOR SELECT
  USING (
    -- Master users can see all
    auth.uid() IN (
      SELECT id FROM profiles WHERE role_global = 'master'
    )
    OR
    -- Users can see all members of boards in their organization
    board_id IN (
      SELECT b.id
      FROM boards b
      INNER JOIN workspaces w ON w.id = b.workspace_id
      INNER JOIN profiles p ON p.organization_id = w.organization_id
      WHERE p.id = auth.uid()
    )
  );

-- Add comment
COMMENT ON POLICY board_members_select_with_board_access ON board_members IS 
  'Allow users to see all members of boards in their organization';
