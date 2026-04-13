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

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Token is required'
    })
  }

  // Get invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('task_invitations')
    .select(`
      id,
      task_id,
      board_id,
      inviter_id,
      invitee_email,
      message,
      status,
      expires_at,
      created_at,
      tasks:task_id (
        id,
        title,
        description
      ),
      boards:board_id (
        id,
        name
      ),
      inviter:inviter_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
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

  return {
    invitation: {
      id: invitation.id,
      taskId: invitation.task_id,
      boardId: invitation.board_id,
      inviteeEmail: invitation.invitee_email,
      message: invitation.message,
      status: invitation.status,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
      task: invitation.tasks,
      board: invitation.boards,
      inviter: invitation.inviter
    }
  }
})
