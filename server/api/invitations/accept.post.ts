import { createClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database'

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase configuration missing'
    })
  }

  // Get authenticated user token
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const authToken = authHeader.replace('Bearer ', '')
  
  // Create client with user token
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  })

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid authentication'
    })
  }

  // Parse request body
  const body = await readBody(event)
  const { token } = body

  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Token is required'
    })
  }

  // Get invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('task_invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (inviteError || !invitation) {
    throw createError({
      statusCode: 404,
      message: 'Invitation not found'
    })
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw createError({
      statusCode: 410,
      message: 'Invitation has expired'
    })
  }

  // Check if already accepted
  if (invitation.status === 'accepted') {
    throw createError({
      statusCode: 409,
      message: 'Invitation already accepted'
    })
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  // Verify email matches (case insensitive)
  if (profile?.email.toLowerCase() !== invitation.invitee_email.toLowerCase()) {
    throw createError({
      statusCode: 403,
      message: 'This invitation was sent to a different email address'
    })
  }

  // Add user as board member if not already
  const { data: existingMember } = await supabase
    .from('board_members')
    .select('user_id')
    .eq('board_id', invitation.board_id)
    .eq('user_id', user.id)
    .single()

  if (!existingMember) {
    const { error: memberError } = await supabase
      .from('board_members')
      .insert({
        board_id: invitation.board_id,
        user_id: user.id,
        access_role: 'viewer' // Default role for invited users
      })

    if (memberError) {
      console.error('[Accept Invite] Error adding board member:', memberError)
      throw createError({
        statusCode: 500,
        message: 'Failed to add user to board'
      })
    }
  }

  // Add user as task assignee if not already
  const { data: existingAssignee } = await supabase
    .from('task_assignees')
    .select('user_id')
    .eq('task_id', invitation.task_id)
    .eq('user_id', user.id)
    .single()

  if (!existingAssignee) {
    const { error: assigneeError } = await supabase
      .from('task_assignees')
      .insert({
        task_id: invitation.task_id,
        user_id: user.id
      })

    if (assigneeError) {
      console.error('[Accept Invite] Error adding task assignee:', assigneeError)
      // Don't fail the request if assignee addition fails
    }
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from('task_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      invitee_id: user.id
    })
    .eq('id', invitation.id)

  if (updateError) {
    console.error('[Accept Invite] Error updating invitation:', updateError)
    // Don't fail the request if update fails
  }

  // Create notification for inviter
  await supabase
    .from('notifications')
    .insert({
      user_id: invitation.inviter_id,
      type: 'invitation_accepted',
      title: 'Convite aceito',
      body: `${profile?.email} aceitou seu convite para colaborar`,
      link: `/boards/${invitation.board_id}`,
      created_at: new Date().toISOString()
    })

  return {
    success: true,
    message: 'Invitation accepted successfully',
    boardId: invitation.board_id,
    taskId: invitation.task_id
  }
})
