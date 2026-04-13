-- Fix board_members RLS to allow querying user's own role on a board
-- This fixes 406 errors when frontend queries: select=access_role&board_id=eq.X&user_id=eq.Y

-- Drop the restrictive policy
DROP POLICY IF EXISTS board_members_select_with_board_access ON board_members;

-- Create a new policy that allows:
-- 1. Users to see their own board memberships (any board)
-- 2. Users to see all members of boards in their organization
-- 3. Masters to see everything
CREATE POLICY board_members_select_allow_own_and_org ON board_members
  FOR SELECT
  USING (
    -- Users can always see their own board memberships
    user_id = auth.uid()
    OR
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
COMMENT ON POLICY board_members_select_allow_own_and_org ON board_members IS 
  'Allow users to see their own board memberships and all members of boards in their organization';
