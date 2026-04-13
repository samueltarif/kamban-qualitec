import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { readFile } from 'fs/promises'
import { resolve } from 'path'

let transporter: Transporter | null = null

/**
 * Cria e retorna o transporter do nodemailer
 * Usa configuração do Office365 via variáveis de ambiente
 */
function getTransporter(): Transporter {
  if (transporter) {
    console.log('[Email] Usando transporter existente')
    return transporter
  }

  console.log('[Email] Criando novo transporter')
  const config = useRuntimeConfig()

  console.log('[Email] Config check:', {
    hasUser: !!config.emailUser,
    hasPass: !!config.emailPass,
    hasSmtp: !!config.emailSmtp,
    hasPort: !!config.emailPort,
    smtp: config.emailSmtp,
    port: config.emailPort,
    user: config.emailUser
  })

  if (!config.emailUser || !config.emailPass || !config.emailSmtp || !config.emailPort) {
    console.error('[Email] Configuração de email incompleta')
    throw new Error('Email configuration is missing. Check NUXT_EMAIL_* environment variables.')
  }

  const port = parseInt(config.emailPort)
  const isSecure = port === 465 // Porta 465 usa SSL direto
  
  transporter = nodemailer.createTransport({
    host: config.emailSmtp,
    port: port,
    secure: isSecure, // true para porta 465 (SSL), false para 587 (STARTTLS)
    auth: {
      user: config.emailUser,
      pass: config.emailPass
    },
    tls: {
      // Não rejeitar certificados não autorizados (útil para desenvolvimento)
      rejectUnauthorized: false
    },
    // Opções adicionais
    requireTLS: !isSecure, // Requer TLS apenas se não estiver usando SSL direto
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  })

  console.log('[Email] Transporter criado com sucesso (secure:', isSecure, ')')
  return transporter
}

/**
 * Renderiza template HTML substituindo variáveis
 */
async function renderTemplate(templateName: string, variables: Record<string, string>): Promise<string> {
  try {
    const templatePath = resolve(process.cwd(), 'server', 'templates', templateName)
    let html = await readFile(templatePath, 'utf-8')

    // Substituir variáveis simples {{VAR}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      html = html.replace(regex, value || '')
    }

    // Remover blocos condicionais vazios {{#if VAR}}...{{/if}}
    html = html.replace(/{{#if\s+(\w+)}}[\s\S]*?{{\/if}}/g, (match, varName) => {
      return variables[varName] ? match.replace(/{{#if\s+\w+}}|{{\/if}}/g, '') : ''
    })

    return html
  } catch (error) {
    console.error('[Email] Error rendering template:', error)
    throw new Error(`Failed to render email template: ${templateName}`)
  }
}

/**
 * Envia e-mail usando o transporter configurado
 */
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<boolean> {
  try {
    console.log('[Email] Iniciando envio de email para:', options.to)
    console.log('[Email] Assunto:', options.subject)
    
    const config = useRuntimeConfig()
    const transport = getTransporter()

    console.log('[Email] Chamando transport.sendMail...')
    const info = await transport.sendMail({
      from: options.from || `"Qualitec Backlog" <${config.emailUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    })

    console.log('[Email] ✓ Email enviado com sucesso. MessageId:', info.messageId)
    console.log('[Email] Response:', info.response)
    return true
  } catch (error) {
    console.error('[Email] ✗ Erro ao enviar email:', error)
    if (error instanceof Error) {
      console.error('[Email] Error message:', error.message)
      console.error('[Email] Error stack:', error.stack)
    }
    return false
  }
}

/**
 * Envia e-mail de convite para tarefa
 */
export async function sendTaskInvitationEmail(data: {
  to: string
  inviterName: string
  boardName: string
  taskTitle: string
  taskDescription?: string
  message?: string
  inviteUrl: string
}): Promise<boolean> {
  try {
    // Gerar iniciais do convidador
    const initials = data.inviterName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase()

    const config = useRuntimeConfig()
    const appUrl = config.public.appUrl || 'http://localhost:3000'

    const html = await renderTemplate('task-invitation-email.html', {
      INVITER_NAME: data.inviterName,
      INVITER_INITIALS: initials,
      BOARD_NAME: data.boardName,
      TASK_TITLE: data.taskTitle,
      TASK_DESCRIPTION: data.taskDescription || '',
      MESSAGE: data.message || '',
      INVITE_URL: data.inviteUrl,
      INVITEE_EMAIL: data.to,
      APP_URL: appUrl
    })

    return await sendEmail({
      to: data.to,
      subject: `${data.inviterName} convidou você para colaborar em uma tarefa`,
      html
    })
  } catch (error) {
    console.error('[Email] Error sending task invitation:', error)
    return false
  }
}

/**
 * Envia e-mail de compartilhamento de grupo
 */
export async function sendGroupShareEmail(data: {
  to: string
  senderName: string
  boardName: string
  groupName: string
  taskCount: number
  tasks?: string[]
  message?: string
  groupUrl: string
}): Promise<boolean> {
  try {
    console.log('[Email] sendGroupShareEmail chamado com:', {
      to: data.to,
      senderName: data.senderName,
      boardName: data.boardName,
      groupName: data.groupName,
      taskCount: data.taskCount
    })
    
    // Gerar iniciais do remetente
    const initials = data.senderName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase()

    console.log('[Email] Iniciais geradas:', initials)

    const config = useRuntimeConfig()
    const appUrl = config.public.appUrl || 'http://localhost:3000'

    console.log('[Email] App URL:', appUrl)

    // Renderizar lista de tarefas
    let tasksHtml = ''
    if (data.tasks && data.tasks.length > 0) {
      console.log('[Email] Renderizando', data.tasks.length, 'tarefas')
      tasksHtml = data.tasks
        .slice(0, 5) // Mostrar no máximo 5 tarefas
        .map(task => `<div class="task-item"><div class="task-bullet"></div><span>${task}</span></div>`)
        .join('')
      
      if (data.tasks.length > 5) {
        tasksHtml += `<div class="task-item" style="opacity: 0.7;"><div class="task-bullet"></div><span>... e mais ${data.tasks.length - 5} tarefa(s)</span></div>`
      }
    }

    console.log('[Email] Renderizando template...')
    const html = await renderTemplate('group-share-email.html', {
      SENDER_NAME: data.senderName,
      SENDER_INITIALS: initials,
      BOARD_NAME: data.boardName,
      GROUP_NAME: data.groupName,
      TASK_COUNT: data.taskCount.toString(),
      MESSAGE: data.message || '',
      TASKS: tasksHtml,
      GROUP_URL: data.groupUrl,
      APP_URL: appUrl
    })

    console.log('[Email] Template renderizado, enviando email...')
    const result = await sendEmail({
      to: data.to,
      subject: `${data.senderName} compartilhou o grupo "${data.groupName}" com você`,
      html
    })
    
    console.log('[Email] Resultado do envio:', result)
    return result
  } catch (error) {
    console.error('[Email] ✗ Erro em sendGroupShareEmail:', error)
    if (error instanceof Error) {
      console.error('[Email] Error message:', error.message)
      console.error('[Email] Error stack:', error.stack)
    }
    return false
  }
}

/**
 * Verifica se a configuração de e-mail está correta
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transport = getTransporter()
    await transport.verify()
    console.log('[Email] SMTP configuration is valid')
    return true
  } catch (error) {
    console.error('[Email] SMTP configuration error:', error)
    return false
  }
}
