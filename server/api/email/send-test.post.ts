import { sendEmail } from '../../utils/email'

/**
 * Endpoint para enviar e-mail de teste
 * POST /api/email/send-test
 * Body: { to: string }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { to } = body

  if (!to) {
    throw createError({
      statusCode: 400,
      message: 'Email address is required'
    })
  }

  try {
    const config = useRuntimeConfig()
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ E-mail de Teste</h1>
          </div>
          <div class="content">
            <p>Olá!</p>
            <p>Este é um e-mail de teste do sistema Qualitec Backlog.</p>
            <p>Se você recebeu este e-mail, significa que a configuração de envio está funcionando corretamente!</p>
            <p><strong>Configuração utilizada:</strong></p>
            <ul>
              <li>SMTP: ${config.emailSmtp}</li>
              <li>Porta: ${config.emailPort}</li>
              <li>Usuário: ${config.emailUser}</li>
            </ul>
          </div>
          <div class="footer">
            <p>Qualitec Backlog - Sistema de Gestão de Tarefas</p>
          </div>
        </div>
      </body>
      </html>
    `

    const success = await sendEmail({
      to,
      subject: '✅ Teste de E-mail - Qualitec Backlog',
      html
    })

    if (success) {
      return {
        success: true,
        message: `Test email sent successfully to ${to}`
      }
    } else {
      throw new Error('Failed to send email')
    }
  } catch (error: any) {
    console.error('[Email Test] Error:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to send test email: ${error.message}`
    })
  }
})
