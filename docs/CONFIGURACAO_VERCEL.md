# Configuração de Variáveis de Ambiente na Vercel

## Problema Atual
O sistema de envio de emails automáticos não está funcionando em produção porque as variáveis de ambiente não estão configuradas na Vercel.

## Variáveis Necessárias

Acesse: https://vercel.com/lmesquadriasites-projects/backlog/settings/environment-variables

### 1. Supabase (já configuradas)
```
SUPABASE_URL=https://ifftngadjtwgjsadqvep.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PUBLISHABLE_KEY=sb_publishable_sRN6DRSobMxyDpwGmN6sRg_tpj1ghv1
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Email (PRECISAM SER ADICIONADAS)
```
NUXT_EMAIL_USER=catalogo@qualitec.ind.br
NUXT_EMAIL_PASS=Instrumentos@2026
NUXT_EMAIL_SMTP=smtp.skymail.net.br
NUXT_EMAIL_PORT=465
NUXT_EMAIL_FROM_NAME=Sistema Kanban Qualitec
```

### 3. App URL (PRECISA SER ATUALIZADA)
```
NUXT_PUBLIC_APP_URL=https://kamban-qualitec.vercel.app
```

## Como Adicionar na Vercel

1. Acesse o dashboard da Vercel
2. Vá em Settings > Environment Variables
3. Para cada variável:
   - Clique em "Add New"
   - Nome: cole o nome da variável (ex: `NUXT_EMAIL_USER`)
   - Value: cole o valor correspondente
   - Environments: selecione **Production**, **Preview** e **Development**
   - Clique em "Save"

4. Após adicionar todas as variáveis, faça um novo deploy:
   - Vá em Deployments
   - Clique nos 3 pontos do último deployment
   - Clique em "Redeploy"
   - Marque "Use existing Build Cache" (opcional)
   - Clique em "Redeploy"

## Verificação

Após o deploy, você pode verificar se as variáveis estão funcionando:

1. Acesse: https://kamban-qualitec.vercel.app/api/email/test
2. Deve retornar:
```json
{
  "success": true,
  "message": "Email configuration is valid and working",
  "config": {
    "smtp": "smtp.skymail.net.br",
    "port": 465,
    "user": "catalogo@qualitec.ind.br"
  }
}
```

3. Se retornar erro, verifique:
   - Se todas as variáveis foram adicionadas corretamente
   - Se o nome das variáveis está exatamente como especificado (case-sensitive)
   - Se você fez o redeploy após adicionar as variáveis

## Testando o Envio de Email

Após configurar, teste atribuindo um usuário a uma tarefa:
1. Abra um quadro
2. Adicione ou edite uma tarefa
3. Atribua um responsável
4. O responsável deve receber um email automaticamente

## Logs de Debug

Para ver logs de erro em produção:
1. Vá em Deployments > [último deployment]
2. Clique em "View Function Logs"
3. Procure por erros relacionados a email ou configuração

## Notas Importantes

- As variáveis de ambiente são aplicadas apenas em novos deploys
- Mudanças nas variáveis requerem um redeploy
- Variáveis sensíveis (como senhas) nunca são expostas no frontend
- O `NUXT_PUBLIC_APP_URL` é usado para gerar links nos emails
