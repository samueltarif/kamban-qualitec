import { verifyEmailConfig } from '../../utils/email'

/**
 * Endpoint de teste para verificar configuração de e-mail
 * Acesse: GET /api/email/test
 */
export default defineEventHandler(async (event) => {
  try {
    const isValid = await verifyEmailConfig()
    
    if (isValid) {
      return {
        success: true,
        message: 'Email configuration is valid and working',
        config: {
          smtp: useRuntimeConfig().emailSmtp,
          port: useRuntimeConfig().emailPort,
          user: useRuntimeConfig().emailUser
        }
      }
    } else {
      throw new Error('Email configuration verification failed')
    }
  } catch (error: any) {
    console.error('[Email Test] Error:', error)
    throw createError({
      statusCode: 500,
      message: `Email configuration error: ${error.message}`
    })
  }
})
