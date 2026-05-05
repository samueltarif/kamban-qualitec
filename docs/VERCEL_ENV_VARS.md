# Variáveis de Ambiente para Vercel

## ⚠️ IMPORTANTE: Você precisa adicionar TODAS estas variáveis no Vercel!

Não é só Supabase. O envio de email precisa das variáveis de SMTP também.

## Como Adicionar no Vercel

1. Acesse: https://vercel.com/seu-projeto
2. Vá em: **Settings** → **Environment Variables**
3. Adicione cada variável abaixo
4. Selecione: **Production**, **Preview**, e **Development**
5. Clique em **Save**
6. Faça **Redeploy** do projeto

## Variáveis Necessárias

### 1. Supabase (Já deve ter)

```
SUPABASE_URL
https://ifftngadjtwgjsadqvep.supabase.co
```

```
SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZnRuZ2FkanR3Z2pzYWRxdmVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYyMjMwMCwiZXhwIjoyMDg1MTk4MzAwfQ.GHOhPKk-J57h9ZlGM8loDlxKyXy5MwMxywgormzwYSI
```

### 2. Email SMTP (FALTANDO - ADICIONAR AGORA!)

```
NUXT_EMAIL_USER
catalogo@qualitec.ind.br
```

```
NUXT_EMAIL_PASS
Instrumentos@2026
```

```
NUXT_EMAIL_SMTP
smtp.skymail.net.br
```

```
NUXT_EMAIL_PORT
465
```

```
NUXT_EMAIL_FROM_NAME
Sistema Kanban Qualitec
```

### 3. App URL (Já deve ter)

```
NUXT_PUBLIC_APP_URL
https://kamban-qualitec.vercel.app
```

## Checklist

Marque conforme adiciona no Vercel:

- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] **NUXT_EMAIL_USER** ← CRÍTICO para email funcionar
- [ ] **NUXT_EMAIL_PASS** ← CRÍTICO para email funcionar
- [ ] **NUXT_EMAIL_SMTP** ← CRÍTICO para email funcionar
- [ ] **NUXT_EMAIL_PORT** ← CRÍTICO para email funcionar
- [ ] **NUXT_EMAIL_FROM_NAME** ← CRÍTICO para email funcionar
- [ ] NUXT_PUBLIC_APP_URL

## ⚠️ Atenção

**SEM as variáveis de email (NUXT_EMAIL_*), o sistema vai:**
- ✅ Associar o responsável normalmente
- ❌ Falhar ao enviar o email (erro 500)
- ❌ Mostrar erro no console do navegador

**COM as variáveis de email, o sistema vai:**
- ✅ Associar o responsável normalmente
- ✅ Enviar o email com sucesso
- ✅ Responsável recebe notificação

## Provedor de Email: Skymail (Locaweb)

Você está usando o Skymail da Locaweb com estas configurações:
- **Servidor SMTP**: smtp.skymail.net.br
- **Porta**: 465 (SSL/TLS)
- **Email**: catalogo@qualitec.ind.br
- **Senha**: Instrumentos@2026

Estas credenciais estão funcionando em localhost, então devem funcionar em produção também.

## Após Adicionar as Variáveis

1. **Redeploy** o projeto no Vercel
2. **Aguarde** o deploy terminar
3. **Teste** associando um responsável
4. **Verifique** se o email chegou
5. Se ainda der erro, **verifique os logs** do Vercel:
   - Vercel Dashboard → Seu Projeto → Deployments
   - Clique no deployment mais recente
   - Vá em "Functions" → Clique na função que deu erro
   - Veja os logs detalhados

## Logs Esperados (Sucesso)

Se tudo estiver correto, você verá nos logs do Vercel:

```
[task-assigned] ✓ Config loaded
[task-assigned] Config check: {
  hasEmailUser: true,
  hasEmailPass: true,
  hasEmailSmtp: true,
  hasEmailPort: true
}
[task-assigned] ✓ Transporter configured
[task-assigned] ✓ Transporter connection verified
[task-assigned] ✓ Email sent successfully!
```

## Logs Esperados (Erro - Variáveis Ausentes)

Se as variáveis não estiverem configuradas:

```
[task-assigned] ✗ CRITICAL: Missing environment variables: [EMAIL_USER, EMAIL_PASS, EMAIL_SMTP, EMAIL_PORT]
```

## Dúvidas Comuns

### Por que preciso adicionar no Vercel se já está no .env?

O arquivo `.env` é local (seu computador). O Vercel não tem acesso a ele. Você precisa configurar as variáveis diretamente no painel do Vercel.

### Posso usar outro provedor de email?

Sim! Se quiser usar Gmail, SendGrid, Mailgun, etc, basta trocar as variáveis:

**Gmail**:
```
NUXT_EMAIL_SMTP=smtp.gmail.com
NUXT_EMAIL_PORT=465
NUXT_EMAIL_USER=seu-email@gmail.com
NUXT_EMAIL_PASS=xxxx xxxx xxxx xxxx  # Senha de app
```

**SendGrid**:
```
NUXT_EMAIL_SMTP=smtp.sendgrid.net
NUXT_EMAIL_PORT=465
NUXT_EMAIL_USER=apikey
NUXT_EMAIL_PASS=SG.xxxxxxxxxx  # API Key
```

### As variáveis são seguras no Vercel?

Sim! As variáveis de ambiente no Vercel são criptografadas e não são expostas no código do frontend. Apenas o código do servidor (API routes) tem acesso a elas.
