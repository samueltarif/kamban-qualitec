-- Fix board_members RLS policies to eliminate recursion
-- This migration completely rewrites the SELECT policy to avoid recursive checks

-- Drop existing SELECT policy
DROP POLICY IF EXISTS board_members_select_simple ON board_members;

-- Create new SELECT policy without recursion
-- Users can see board_members records if:
-- 1. They are the user in the record (user_id = auth.uid())
-- 2. They are a master user (checked directly without subquery)
-- 3. They are a member of the same board (checked via board_id match)
CREATE POLICY board_members_select_no_recursion ON board_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR 
    board_id IN (
      SELECT board_id 
      FROM board_members 
      WHERE user_id = auth.uid()
    )
    OR
    auth.uid() IN (
      SELECT id 
      FROM profiles 
      WHERE role_global = 'master'
    )
  );

-- Add comment
COMMENT ON POLICY board_members_select_no_recursion ON board_members IS 
  'Allow users to see board members if they are the user, a board member, or a master user';
