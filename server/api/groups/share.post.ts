import { createClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database'

export default defineEventHandler(async (event) => {
  console.log('[Share Group API] Requisição recebida')
  
  const config = useRuntimeConfig(event)
  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey
  const supabaseServiceKey = config.supabaseServiceRoleKey

  console.log('[Share Group API] Config check:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    serviceKeyLength: supabaseServiceKey?.length || 0
  })

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('[Share Group API] Configuração do Supabase incompleta')
    console.error('[Share Group API] Você precisa adicionar SUPABASE_SERVICE_ROLE_KEY no arquivo .env')
    console.error('[Share Group API] Encontre a chave em: Supabase Dashboard > Project Settings > API > service_role key')
    throw createError({
      statusCode: 500,
      message: 'Supabase configuration missing'
    })
  }

  // Get authenticated user token
  const authHeader = getHeader(event, 'authorization')
  console.log('[Share Group API] Auth header presente:', !!authHeader)
  
  if (!authHeader) {
    console.error('[Share Group API] Sem header de autorização')
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  console.log('[Share Group API] Token extraído (primeiros 20 chars):', token.substring(0, 20))
  
  // Create client with user token for auth validation
  const supabaseUser = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })

  // Create service role client for permission checks (bypasses RLS)
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

  // Parse request body
  const body = await readBody(event)
  const { groupId, memberIds, message } = body

  console.log('[Share Group API] Body recebido:', {
    groupId,
    memberIdsCount: memberIds?.length,
    hasMessage: !!message
  })

  if (!groupId || !Array.isArray(memberIds) || memberIds.length === 0) {
    console.error('[Share Group API] Dados inválidos no body')
    throw createError({
      statusCode: 400,
      message: 'Group ID and member IDs are required'
    })
  }

  // Get current user
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  
  console.log('[Share Group API] User auth result:', {
    userId: user?.id,
    error: authError?.message
  })
  
  if (authError || !user) {
    console.error('[Share Group API] Falha na autenticação:', authError)
    throw createError({
      statusCode: 401,
      message: 'Invalid authentication'
    })
  }

  // Validate group exists and get board_id (using service role)
  console.log('[Share Group API] Buscando grupo:', groupId)
  const { data: group, error: groupError } = await supabase
    .from('task_groups')
    .select('id, name, board_id')
    .eq('id', groupId)
    .single()

  console.log('[Share Group API] Resultado da busca do grupo:', {
    found: !!group,
    groupName: group?.name,
    boardId: group?.board_id,
    error: groupError?.message
  })

  if (groupError || !group) {
    console.error('[Share Group API] Grupo não encontrado:', groupError)
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  // Get all board members to verify permissions (using service role to bypass RLS)
  console.log('[Share Group API] Buscando membros do board:', group.board_id)
  const { data: allMembers, error: allMembersError } = await supabase
    .from('board_members')
    .select('user_id, access_role')
    .eq('board_id', group.board_id)

  console.log('[Share Group API] Membros do board:', {
    count: allMembers?.length,
    error: allMembersError?.message
  })

  if (allMembersError) {
    console.error('[Share Group API] Erro ao buscar membros do board:', allMembersError)
    throw createError({
      statusCode: 500,
      message: 'Failed to verify permissions'
    })
  }

  // Check if current user is a member with editor or owner role
  const userMembership = allMembers?.find(m => m.user_id === user.id)
  
  console.log('[Share Group API] Membership do usuário:', {
    found: !!userMembership,
    role: userMembership?.access_role
  })
  
  if (!userMembership) {
    console.error('[Share Group API] Usuário não é membro do board')
    throw createError({
      statusCode: 403,
      message: 'Você não é membro deste quadro'
    })
  }

  if (userMembership.access_role !== 'owner' && userMembership.access_role !== 'editor') {
    console.error('[Share Group API] Usuário não tem permissão (role:', userMembership.access_role, ')')
    throw createError({
      statusCode: 403,
      message: 'Você não tem permissão para compartilhar este grupo'
    })
  }
  
  console.log('[Share Group API] Permissões verificadas com sucesso')

  // Verify all recipients are board members
  const validMemberIds = allMembers?.map(m => m.user_id) || []
  const invalidIds = memberIds.filter((id: string) => !validMemberIds.includes(id))

  if (invalidIds.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'Some recipients are not board members'
    })
  }

  // Get tasks in the group
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, status_id, priority_id, due_date')
    .eq('group_id', groupId)
    .is('archived_at', null)
    .order('position', { ascending: true })

  if (tasksError) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch group tasks'
    })
  }

  // Get recipient profiles
  const { data: recipients, error: recipientsError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', memberIds)

  if (recipientsError || !recipients) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch recipient profiles'
    })
  }

  // Get sender profile
  const { data: sender, error: senderError } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  if (senderError || !sender) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch sender profile'
    })
  }

  // Get board name
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('name')
    .eq('id', group.board_id)
    .single()

  if (boardError || !board) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch board info'
    })
  }

  // Send emails to recipients
  const groupUrl = `${config.public.appUrl}/boards/${group.board_id}`
  
  console.log('[Share Group API] Preparando envio de emails para', recipients.length, 'destinatários')
  
  const { sendGroupShareEmail } = await import('../../utils/email')
  
  for (const recipient of recipients) {
    try {
      console.log('[Share Group API] Enviando email para:', recipient.email)
      await sendGroupShareEmail({
        to: recipient.email,
        senderName: sender.full_name || sender.email,
        boardName: board.name,
        groupName: group.name,
        taskCount: tasks?.length || 0,
        tasks: tasks?.map(t => t.title),
        message: message || undefined,
        groupUrl
      })
      console.log('[Share Group API] ✓ Email enviado com sucesso para:', recipient.email)
    } catch (error) {
      console.error('[Share Group API] ✗ Falha ao enviar email para:', recipient.email, error)
      // Continue sending to other recipients even if one fails
    }
  }

  // Create notifications for recipients
  const notifications = recipients.map(recipient => ({
    user_id: recipient.id,
    type: 'group_shared',
    title: `Grupo compartilhado: ${group.name}`,
    body: message || `${sender.full_name || sender.email} compartilhou o grupo "${group.name}" com você`,
    link: `/boards/${group.board_id}`,
    created_at: new Date().toISOString()
  }))

  const { error: notifError } = await supabase
    .from('notifications')
    .insert(notifications)

  if (notifError) {
    console.error('[Share Group] Failed to create notifications:', notifError)
    // Don't fail the request if notifications fail
  }

  console.log('[Share Group API] ✓ Compartilhamento concluído com sucesso')
  
  return {
    success: true,
    message: `Grupo compartilhado com ${recipients.length} ${recipients.length === 1 ? 'membro' : 'membros'}`
  }
})
