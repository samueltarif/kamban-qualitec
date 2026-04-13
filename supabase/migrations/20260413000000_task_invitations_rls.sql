-- Enable RLS on task_invitations if not already enabled
ALTER TABLE task_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON task_invitations;
DROP POLICY IF EXISTS "Users can view invitations they sent" ON task_invitations;
DROP POLICY IF EXISTS "Board members can create invitations" ON task_invitations;
DROP POLICY IF EXISTS "Users can update their own invitations" ON task_invitations;

-- Policy: Users can view invitations sent to their email
CREATE POLICY "Users can view invitations sent to them"
ON task_invitations
FOR SELECT
USING (
  invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR invitee_id = auth.uid()
);

-- Policy: Users can view invitations they sent
CREATE POLICY "Users can view invitations they sent"
ON task_invitations
FOR SELECT
USING (inviter_id = auth.uid());

-- Policy: Board members with editor/owner role can create invitations
CREATE POLICY "Board members can create invitations"
ON task_invitations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM board_members
    WHERE board_members.board_id = task_invitations.board_id
      AND board_members.user_id = auth.uid()
      AND board_members.access_role IN ('owner', 'editor')
  )
);

-- Policy: Users can update invitations sent to them (to accept)
CREATE POLICY "Users can update their own invitations"
ON task_invitations
FOR UPDATE
USING (
  invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR invitee_id = auth.uid()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_task_invitations_token ON task_invitations(token);
CREATE INDEX IF NOT EXISTS idx_task_invitations_invitee_email ON task_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_task_invitations_status ON task_invitations(status);
CREATE INDEX IF NOT EXISTS idx_task_invitations_expires_at ON task_invitations(expires_at);

-- Add comment to table
COMMENT ON TABLE task_invitations IS 'Stores invitations for users to collaborate on specific tasks';
