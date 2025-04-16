# Integração WhatsApp via WAHA API

Este documento descreve a implementação da integração do WhatsApp usando a WAHA API (WhatsApp HTTP API) na plataforma Comply.

## Visão Geral

A integração do WhatsApp permite que organizações se comuniquem com seus clientes/pacientes via WhatsApp diretamente da plataforma Comply. Esta integração utiliza a [WAHA API](https://waha.devlike.pro) ao invés da API oficial do WhatsApp Business, oferecendo uma alternativa mais acessível e flexível.

## Componentes da Integração

### 1. Backend (TypeScript)

#### Arquivos Principais:
- `server/waha-whatsapp.ts`: Classe de interface com a WAHA API
- `server/routes-whatsapp.ts`: Rotas da API para integração com WhatsApp

#### Recursos Implementados:
- Iniciar sessão do WhatsApp (geração de QR Code)
- Verificar status da sessão
- Enviar mensagens de texto
- Enviar arquivos (imagens, PDFs, etc.)
- Encerrar sessão
- Webhook para receber mensagens e eventos

### 2. Frontend (React/TypeScript)

#### Arquivos Principais:
- `client/src/pages/organization/integracoes/whatsapp.tsx`: Interface para configuração da integração
- `client/src/pages/organization/integracoes/index.tsx`: Listagem de integrações disponíveis

#### Recursos Implementados:
- Configuração da API WAHA (URL, chave de API, nome da instância)
- Escanear QR Code para conectar WhatsApp
- Configurações de atendimento (horários, respostas automáticas)
- Gestão de departamentos e atendentes
- Configurações de notificações

## Configuração de Segurança

### Proteção CSRF

A integração com WhatsApp utiliza proteção CSRF para todas as chamadas de API para evitar ataques de falsificação de requisição entre sites:

1. A página de configuração do WhatsApp usa a função `apiRequest` para todas as chamadas à API:

```typescript
// Exemplo da implementação segura usando apiRequest
import { apiRequest } from "@/lib/queryClient";

// Chamada para iniciar sessão do WhatsApp com proteção CSRF
apiRequest('/api/whatsapp/session/start', {
  method: 'POST',
  data: {
    apiUrl: configData.wahaApiUrl,
    apiKey: configData.wahaApiKey,
    instanceName: configData.wahaInstanceName
  }
})
.then(data => {
  // Processar resposta...
})
.catch(error => {
  // Tratar erro...
});
```

### Segurança da Chave de API

A chave de API da WAHA é tratada como informação sensível:
- Armazenada de forma segura no banco de dados (não em texto plano)
- Transmitida apenas por HTTPS
- Nunca exposta no frontend além do campo de entrada
- Mascarada na interface de usuário

## Fluxo de Integração

1. **Configuração da WAHA API**:
   - Administrador configura URL da API WAHA, chave e nome da instância
   - Estas informações são salvas no perfil da organização

2. **Inicialização da Sessão**:
   - Administrador clica em "Gerar QR Code"
   - Frontend chama a API do servidor com as credenciais WAHA
   - Servidor se comunica com a WAHA API para gerar um QR Code
   - QR Code é exibido na interface para o administrador escanear

3. **Autenticação do WhatsApp**:
   - Administrador escaneia o QR Code com o aplicativo WhatsApp
   - WAHA API confirma a conexão
   - Interface atualiza para mostrar o status "Conectado"

4. **Operação**:
   - Sistema pode agora enviar e receber mensagens via WhatsApp
   - Configurações adicionais como respostas automáticas são aplicadas
   - Mensagens recebidas são processadas conforme regras configuradas

5. **Desconexão**:
   - Administrador pode desconectar o WhatsApp a qualquer momento
   - Sessão na WAHA API é encerrada

## Configuração do Webhook

Para receber mensagens e eventos do WhatsApp:

1. O sistema gera automaticamente uma URL de webhook (ex: `https://endurancy.replit.app/api/webhooks/whatsapp`)
2. Esta URL é exibida na interface para o administrador configurar na plataforma WAHA
3. O webhook recebe mensagens de entrada e as processa conforme as regras configuradas

## Limitações Conhecidas

1. **Dependência da WAHA API**:
   - O serviço depende da disponibilidade da WAHA API
   - Mudanças na política do WhatsApp podem afetar o funcionamento

2. **Sessão Única**:
   - Cada instância da WAHA suporta apenas uma sessão de WhatsApp
   - Para múltiplos números, são necessárias múltiplas instâncias

3. **Renovação Periódica**:
   - A sessão do WhatsApp pode expirar após certo tempo
   - Pode ser necessário re-escanear o QR Code periodicamente

## Requisitos Técnicos

1. **Servidor WAHA**:
   - Acesso a uma instância da WAHA API (própria ou compartilhada)
   - Chave de API válida

2. **Smartphone com WhatsApp**:
   - Smartphone com WhatsApp instalado e funcionando
   - Conexão à internet estável no smartphone

3. **Conexão da Plataforma**:
   - Acesso HTTPS à API WAHA
   - Porta 443 liberada no firewall (para comunicação HTTPS)

## Recomendações para Uso em Produção

1. **Hospedagem da WAHA API**:
   - Para ambientes de produção, considere hospedar sua própria instância da WAHA API
   - Utilize servidor dedicado ou contêiner para melhor isolamento

2. **Monitoramento**:
   - Implemente monitoramento da conexão do WhatsApp
   - Configure alertas para desconexões

3. **Backup de Mensagens**:
   - Mantenha backup das mensagens importantes no banco de dados
   - Não confie apenas na história de conversas do WhatsApp

4. **Compliance**:
   - Verifique os termos de serviço do WhatsApp antes de usar em produção
   - Obtenha consentimento explícito dos usuários antes de enviar mensagens

## Solução de Problemas

### QR Code não aparece
- Verifique as credenciais da WAHA API
- Confirme se a instância da WAHA está ativa
- Verifique logs do servidor para erros de comunicação

### Falha na conexão do WhatsApp
- Verifique a conexão do smartphone
- Confirme que o WhatsApp está atualizado
- Tente gerar um novo QR Code

### Mensagens não enviadas
- Verifique o status da sessão
- Confirme formato correto do número de telefone (com código do país)
- Verifique logs para erros de envio

## Roadmap Futuro

1. **Suporte a Múltiplas Contas**:
   - Permitir múltiplas contas de WhatsApp por organização
   - Interface para alternar entre contas

2. **Análise de Conversas**:
   - Implementar análise de sentimento nas conversas
   - Estatísticas de tempo de resposta e satisfação

3. **Automação Avançada**:
   - Chatbots integrados com IA
   - Fluxos de conversação personalizáveis

4. **Integração com CRM**:
   - Sincronização bidirecional com módulo CRM
   - Histórico unificado de comunicações