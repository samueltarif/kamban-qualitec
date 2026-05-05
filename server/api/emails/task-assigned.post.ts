import { createClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  console.log('\n========== [TASK-ASSIGNED EMAIL] START ==========')
  console.log('[task-assigned] Request ID:', requestId)
  console.log('[task-assigned] Timestamp:', new Date().toISOString())
  console.log('[task-assigned] Environment:', process.env.NODE_ENV || 'unknown')
  
  try {
    // STEP 1: Read body
    console.log('[task-assigned] STEP 1: Reading request body...')
    const body = await readBody(event)
    const { taskId, assigneeId } = body

    console.log('[task-assigned] ✓ Request received')
    console.log('[task-assigned] Payload:', { taskId, assigneeId, requestId })

    if (!taskId || !assigneeId) {
      console.log('[task-assigned] ✗ Missing required fields')
      throw createError({
        statusCode: 400,
        message: 'taskId and assigneeId are required'
      })
    }

    // STEP 2: Load runtime config
    console.log('[task-assigned] STEP 2: Loading runtime config...')
    const config = useRuntimeConfig()
    
    console.log('[task-assigned] ✓ Config loaded')
    console.log('[task-assigned] Config check:', {
      hasSupabaseUrl: !!config.public.supabaseUrl,
      supabaseUrlPrefix: config.public.supabaseUrl?.substring(0, 20) + '...',
      hasSupabaseKey: !!config.supabaseServiceRoleKey,
      supabaseKeyPrefix: config.supabaseServiceRoleKey?.substring(0, 10) + '...',
      hasEmailUser: !!config.emailUser,
      emailUser: config.emailUser,
      hasEmailSmtp: !!config.emailSmtp,
      emailSmtp: config.emailSmtp,
      hasEmailPort: !!config.emailPort,
      emailPort: config.emailPort,
      hasEmailPass: !!config.emailPass,
      emailPassLength: config.emailPass?.length || 0,
      hasEmailFromName: !!config.emailFromName,
      emailFromName: config.emailFromName,
      hasAppUrl: !!config.public.appUrl,
      appUrl: config.public.appUrl
    })
    
    // Validar variáveis críticas
    const missingVars = []
    if (!config.public.supabaseUrl) missingVars.push('SUPABASE_URL')
    if (!config.supabaseServiceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY')
    if (!config.emailUser) missingVars.push('EMAIL_USER')
    if (!config.emailSmtp) missingVars.push('EMAIL_SMTP')
    if (!config.emailPort) missingVars.push('EMAIL_PORT')
    if (!config.emailPass) missingVars.push('EMAIL_PASS')
    if (!config.public.appUrl) missingVars.push('PUBLIC_APP_URL')
    
    if (missingVars.length > 0) {
      console.error('[task-assigned] ✗ CRITICAL: Missing environment variables:', missingVars)
      throw createError({
        statusCode: 500,
        message: `Missing required environment variables: ${missingVars.join(', ')}`
      })
    }
    
    // STEP 3: Create Supabase client
    console.log('[task-assigned] STEP 3: Creating Supabase client...')
    const supabase = createClient<Database>(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey
    )

    console.log('[task-assigned] ✓ Supabase client created')

    // Buscar preferências de email do usuário
    console.log('[task-assigned] → Fetching email preferences for user:', assigneeId)
    const { data: prefs, error: prefsError } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', assigneeId)
      .single()

    if (prefsError) {
      console.log('[task-assigned] ⚠ Email preferences error:', prefsError.message)
    }

    console.log('[task-assigned] ✓ Preferences fetched:', {
      found: !!prefs,
      enabled: prefs?.task_assigned_enabled,
      maxPerHour: prefs?.max_emails_per_hour,
      maxPerDay: prefs?.max_emails_per_day
    })

    // Se notificações desabilitadas, retornar
    if (!prefs || !prefs.task_assigned_enabled) {
      console.log('[task-assigned] ⊘ Notifications disabled, skipping email')
      console.log('========== [TASK-ASSIGNED EMAIL] END (skipped) ==========\n')
      return { success: true, skipped: true, reason: 'notifications_disabled' }
    }

    // Verificar rate limit
    console.log('[task-assigned] → Checking rate limits...')
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: recentEmails } = await supabase
      .from('email_sent_log')
      .select('id, sent_at')
      .eq('user_id', assigneeId)
      .gte('sent_at', oneDayAgo)

    if (recentEmails) {
      const emailsLastHour = recentEmails.filter(e => e.sent_at >= oneHourAgo).length
      const emailsLastDay = recentEmails.length

      console.log('[task-assigned] ✓ Rate limit check:', {
        emailsLastHour,
        maxPerHour: prefs.max_emails_per_hour,
        emailsLastDay,
        maxPerDay: prefs.max_emails_per_day
      })

      if (emailsLastHour >= prefs.max_emails_per_hour) {
        console.log('[task-assigned] ⊘ Hourly limit exceeded')
        console.log('========== [TASK-ASSIGNED EMAIL] END (rate limited) ==========\n')
        return { success: false, error: 'hourly_limit_exceeded' }
      }
      if (emailsLastDay >= prefs.max_emails_per_day) {
        console.log('[task-assigned] ⊘ Daily limit exceeded')
        console.log('========== [TASK-ASSIGNED EMAIL] END (rate limited) ==========\n')
        return { success: false, error: 'daily_limit_exceeded' }
      }
    }

    // Buscar todas as informações da tarefa
    console.log('[task-assigned] → Fetching task details...')
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        board:boards(id, name),
        group:task_groups(id, name, color),
        status:task_statuses(id, name, color),
        priority:task_priorities(id, name, color),
        created_by_user:profiles!tasks_created_by_fkey(id, full_name, email),
        assignees:task_assignees(
          user:profiles(id, full_name, email, avatar_url)
        ),
        subtasks(
          id, title, is_done, status_id, priority_id, due_date, notes,
          status:task_statuses(name, color),
          priority:task_priorities(name, color),
          assignees:subtask_assignees(
            user:profiles(full_name, email)
          )
        ),
        attachments:task_attachments(
          id, file_name, mime_type, size_bytes, category, description
        ),
        labels:task_labels(
          label:labels(id, name, color)
        )
      `)
      .eq('id', taskId)
      .single()

    if (taskError) {
      console.error('[task-assigned] ✗ Task fetch error:', taskError)
      throw taskError
    }

    if (!task) {
      console.error('[task-assigned] ✗ Task not found')
      throw createError({ statusCode: 404, message: 'Task not found' })
    }

    console.log('[task-assigned] ✓ Task found:', {
      id: task.id,
      title: task.title,
      board: task.board?.name,
      group: task.group?.name,
      assignees: task.assignees?.length
    })

    // Buscar informações do destinatário
    console.log('[task-assigned] → Fetching assignee details...')
    const { data: assignee, error: assigneeError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', assigneeId)
      .single()

    if (assigneeError) {
      console.error('[task-assigned] ✗ Assignee fetch error:', assigneeError)
      throw assigneeError
    }

    if (!assignee || !assignee.email) {
      console.error('[task-assigned] ✗ Assignee not found or no email')
      throw createError({ statusCode: 404, message: 'Assignee not found or no email' })
    }

    console.log('[task-assigned] ✓ Assignee found:', {
      id: assignee.id,
      name: assignee.full_name,
      email: assignee.email
    })

    // Configurar transporter de email
    console.log('[task-assigned] STEP 6: Configuring email transporter...')
    console.log('[task-assigned] Transporter config:', {
      host: config.emailSmtp,
      port: parseInt(config.emailPort),
      secure: true,
      user: config.emailUser
    })
    
    let transporter
    try {
      transporter = nodemailer.createTransport({
        host: config.emailSmtp,
        port: parseInt(config.emailPort),
        secure: true,
        auth: {
          user: config.emailUser,
          pass: config.emailPass
        }
      })
      console.log('[task-assigned] ✓ Transporter configured')
      
      // Verificar conexão
      console.log('[task-assigned] → Verifying transporter connection...')
      await transporter.verify()
      console.log('[task-assigned] ✓ Transporter connection verified')
    } catch (transportError: any) {
      console.error('[task-assigned] ✗ Error configuring/verifying transporter:', transportError.message)
      console.error('[task-assigned] Transport error code:', transportError.code)
      console.error('[task-assigned] Transport error stack:', transportError.stack)
      throw createError({
        statusCode: 500,
        message: `Failed to configure email transporter: ${transportError.message}. Check EMAIL_SMTP, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS.`
      })
    }

    // Formatar data
    const formatDate = (date: string | null) => {
      if (!date) return 'Não definida'
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    // Formatar orçamento
    const formatBudget = (budget: number | null) => {
      if (!budget) return 'Não definido'
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(budget)
    }

    // Formatar tamanho de arquivo
    const formatFileSize = (bytes: number | null) => {
      if (!bytes) return ''
      const mb = bytes / (1024 * 1024)
      if (mb >= 1) return `${mb.toFixed(1)} MB`
      const kb = bytes / 1024
      return `${kb.toFixed(1)} KB`
    }

    // STEP 7: Generate email HTML
    console.log('[task-assigned] STEP 7: Generating email HTML...')
    const taskUrl = `${config.public.appUrl}/boards/${task.board.id}?task=${task.id}`
    
    console.log('[task-assigned] Task URL:', taskUrl)
    console.log('[task-assigned] Checking if generateTaskAssignmentEmail is available...')
    
    // Verificar se a função está disponível
    if (typeof generateTaskAssignmentEmail !== 'function') {
      console.error('[task-assigned] ✗ CRITICAL: generateTaskAssignmentEmail is not a function!')
      console.error('[task-assigned] Type:', typeof generateTaskAssignmentEmail)
      throw createError({
        statusCode: 500,
        message: 'Email template function not available. This may be a build/import issue in production.'
      })
    }
    
    console.log('[task-assigned] ✓ generateTaskAssignmentEmail is available')
    
    let emailHtml: string
    try {
      emailHtml = generateTaskAssignmentEmail({
        assigneeName: assignee.full_name || assignee.email,
        taskTitle: task.title,
        taskDescription: task.description || undefined,
        taskNotes: task.notes || undefined,
        boardName: task.board.name,
        groupName: task.group?.name,
        groupColor: task.group?.color,
        statusName: task.status?.name,
        statusColor: task.status?.color,
        priorityName: task.priority?.name,
        priorityColor: task.priority?.color,
        startDate: task.start_date ? formatDate(task.start_date) : undefined,
        dueDate: task.due_date ? formatDate(task.due_date) : undefined,
        budget: task.budget ? formatBudget(task.budget) : undefined,
        subtasks: task.subtasks?.map(st => ({
          title: st.title,
          isDone: st.is_done,
          statusName: st.status?.name,
          statusColor: st.status?.color
        })),
        attachments: task.attachments?.map(att => ({
          fileName: att.file_name,
          fileSize: att.size_bytes ? formatFileSize(att.size_bytes) : undefined,
          category: att.category || undefined
        })),
        taskUrl,
        assignedBy: task.created_by_user?.full_name || 'Sistema',
        createdAt: formatDate(task.created_at),
        settingsUrl: `${config.public.appUrl}/settings`
      })
      console.log('[task-assigned] ✓ Email HTML generated, length:', emailHtml.length)
    } catch (templateError: any) {
      console.error('[task-assigned] ✗ Error generating email HTML:', templateError.message)
      console.error('[task-assigned] Template error stack:', templateError.stack)
      throw createError({
        statusCode: 500,
        message: `Failed to generate email template: ${templateError.message}`
      })
    }

    // STEP 8: Send email
    console.log('[task-assigned] STEP 8: Sending email...')
    console.log('[task-assigned] Email details:', {
      from: `"${config.emailFromName || 'Sistema Kanban'}" <${config.emailUser}>`,
      to: assignee.email,
      subject: `Nova Tarefa: ${task.title}`,
      htmlLength: emailHtml.length
    })
    
    let emailResult
    try {
      emailResult = await transporter.sendMail({
        from: `"${config.emailFromName || 'Sistema Kanban'}" <${config.emailUser}>`,
        to: assignee.email,
        subject: `Nova Tarefa: ${task.title}`,
        html: emailHtml
      })
      console.log('[task-assigned] ✓ Email sent successfully!')
      console.log('[task-assigned] Email result:', {
        messageId: emailResult.messageId,
        accepted: emailResult.accepted,
        rejected: emailResult.rejected,
        response: emailResult.response
      })
    } catch (sendError: any) {
      console.error('[task-assigned] ✗ Error sending email:', sendError.message)
      console.error('[task-assigned] Send error code:', sendError.code)
      console.error('[task-assigned] Send error response:', sendError.response)
      console.error('[task-assigned] Send error stack:', sendError.stack)
      throw createError({
        statusCode: 500,
        message: `Failed to send email: ${sendError.message}. Code: ${sendError.code || 'unknown'}`
      })
    }

    // Registrar envio
    console.log('[task-assigned] → Registering email log...')
    const { error: logError } = await supabase
      .from('email_sent_log')
      .insert({
        user_id: assigneeId,
        email_type: 'task_assigned',
        task_id: taskId
      })

    if (logError) {
      console.error('[task-assigned] ⚠ Failed to log email (non-critical):', logError.message)
    } else {
      console.log('[task-assigned] ✓ Email log registered')
    }

    const duration = Date.now() - startTime
    console.log('[task-assigned] ✓ Total duration:', duration, 'ms')
    console.log('========== [TASK-ASSIGNED EMAIL] END (success) ==========\n')

    return { success: true, sent: true, duration }

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('\n========== [TASK-ASSIGNED EMAIL] ERROR ==========')
    console.error('[task-assigned] Request ID:', requestId)
    console.error('[task-assigned] ✗ Error type:', error.constructor?.name || 'Unknown')
    console.error('[task-assigned] ✗ Error message:', error.message || 'No message')
    console.error('[task-assigned] ✗ Error code:', error.code || 'No code')
    console.error('[task-assigned] ✗ Error statusCode:', error.statusCode || 'No statusCode')
    console.error('[task-assigned] ✗ Error stack:', error.stack || 'No stack')
    console.error('[task-assigned] ✗ Duration before error:', duration, 'ms')
    
    // Log adicional para erros específicos
    if (error.message?.includes('Missing required environment variables')) {
      console.error('[task-assigned] ✗ PRODUCTION CONFIG ERROR: Environment variables are missing!')
      console.error('[task-assigned] ✗ This usually means the deployment platform (Vercel/Netlify/etc) is missing env vars')
    }
    
    if (error.message?.includes('generateTaskAssignmentEmail')) {
      console.error('[task-assigned] ✗ TEMPLATE ERROR: Email template function not available!')
      console.error('[task-assigned] ✗ This may be a build issue - check if server/utils/emailTemplates.ts is included in build')
    }
    
    if (error.code === 'EAUTH' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error('[task-assigned] ✗ SMTP ERROR: Connection/authentication failed!')
      console.error('[task-assigned] ✗ Check EMAIL_SMTP, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in production')
    }
    
    console.error('========== [TASK-ASSIGNED EMAIL] END (error) ==========\n')
    
    // Retornar erro estruturado
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to send email',
      data: {
        requestId,
        errorType: error.constructor?.name || 'Unknown',
        errorCode: error.code || 'unknown',
        duration
      }
    })
  }
})
