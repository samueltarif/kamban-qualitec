-- Fix board_members RLS to completely eliminate recursion
-- The previous policy still had recursion because it queried board_members within the policy

-- Drop the recursive policy
DROP POLICY IF EXISTS board_members_select_no_recursion ON board_members;

-- Create a simple, non-recursive SELECT policy
-- Users can see board_members records if:
-- 1. They are the user in the record (user_id = auth.uid())
-- 2. They are a master user (checked via profiles without recursion)
CREATE POLICY board_members_select_final ON board_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    auth.uid() IN (
      SELECT id 
      FROM profiles 
      WHERE role_global = 'master'
    )
  );

-- Add comment
COMMENT ON POLICY board_members_select_final ON board_members IS 
  'Allow users to see their own board memberships or all if master. No recursion.';
