import { createClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database'
import { randomBytes } from 'crypto'

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

  const token = authHeader.replace('Bearer ', '')
  
  // Create client with user token
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
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
  const { taskId, inviteeEmail, message } = body

  if (!taskId || !inviteeEmail) {
    throw createError({
      statusCode: 400,
      message: 'Task ID and invitee email are required'
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(inviteeEmail)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid email format'
    })
  }

  // Validate task exists and get board_id
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, title, board_id')
    .eq('id', taskId)
    .single()

  if (taskError || !task) {
    throw createError({
      statusCode: 404,
      message: 'Task not found'
    })
  }

  // Verify user has permission to invite (must be board member with editor or owner role)
  const { data: userMembership, error: membershipError } = await supabase
    .from('board_members')
    .select('access_role')
    .eq('board_id', task.board_id)
    .eq('user_id', user.id)
    .single()

  if (membershipError || !userMembership) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to invite collaborators to this task'
    })
  }

  if (userMembership.access_role !== 'owner' && userMembership.access_role !== 'editor') {
    throw createError({
      statusCode: 403,
      message: 'Only owners and editors can invite collaborators'
    })
  }

  // Check if invitee already has access to the board
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', inviteeEmail.toLowerCase())
    .single()

  if (existingProfile) {
    // Check if already a board member
    const { data: existingMember } = await supabase
      .from('board_members')
      .select('user_id')
      .eq('board_id', task.board_id)
      .eq('user_id', existingProfile.id)
      .single()

    if (existingMember) {
      // Just add as task assignee if not already
      const { data: existingAssignee } = await supabase
        .from('task_assignees')
        .select('user_id')
        .eq('task_id', taskId)
        .eq('user_id', existingProfile.id)
        .single()

      if (!existingAssignee) {
        await supabase
          .from('task_assignees')
          .insert({ task_id: taskId, user_id: existingProfile.id })
      }

      return {
        success: true,
        message: 'User already has access and was added as assignee',
        alreadyMember: true
      }
    }
  }

  // Generate secure token
  const inviteToken = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

  // Create invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('task_invitations')
    .insert({
      task_id: taskId,
      board_id: task.board_id,
      inviter_id: user.id,
      invitee_email: inviteeEmail.toLowerCase(),
      invitee_id: existingProfile?.id || null,
      token: inviteToken,
      message: message || null,
      status: 'pending',
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()

  if (inviteError) {
    console.error('[Task Invite] Error creating invitation:', inviteError)
    throw createError({
      statusCode: 500,
      message: 'Failed to create invitation'
    })
  }

  // Get inviter profile
  const { data: inviter } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Get board name
  const { data: board } = await supabase
    .from('boards')
    .select('name')
    .eq('id', task.board_id)
    .single()

  // Send email with invitation link
  const config = useRuntimeConfig()
  const inviteUrl = `${config.public.appUrl}/invite/${inviteToken}`
  
  const { sendTaskInvitationEmail } = await import('../../utils/email')
  
  const emailSent = await sendTaskInvitationEmail({
    to: inviteeEmail,
    inviterName: inviter?.full_name || inviter?.email || 'Um colaborador',
    boardName: board?.name || 'Board',
    taskTitle: task.title,
    taskDescription: task.description || undefined,
    message: message || undefined,
    inviteUrl
  })

  if (!emailSent) {
    console.error('[Task Invite] Failed to send email, but invitation was created')
    // Don't fail the request if email fails - invitation is still valid
  } else {
    console.log('[Task Invite] Email sent successfully to:', inviteeEmail)
  }

  // Create notification if user exists
  if (existingProfile) {
    await supabase
      .from('notifications')
      .insert({
        user_id: existingProfile.id,
        type: 'task_invitation',
        title: 'Convite para colaborar',
        body: `${inviter?.full_name || inviter?.email} convidou você para colaborar na tarefa "${task.title}"`,
        link: `/invite/${inviteToken}`,
        created_at: new Date().toISOString()
      })
  }

  return {
    success: true,
    message: 'Invitation sent successfully',
    inviteUrl,
    expiresAt: expiresAt.toISOString()
  }
})
