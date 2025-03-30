import nodemailer from 'nodemailer';

// Verificar se estamos no modo de teste ou produção
// Por padrão, iniciar em modo de teste se não estiver definido
const isTestMode = () => process.env.EMAIL_TEST_MODE !== 'false';

console.log(`Configurando serviço de e-mail em modo: ${isTestMode() ? 'TESTE' : 'PRODUÇÃO'}`);

// Configuração do transportador de e-mail
let transporter: nodemailer.Transporter;

if (isTestMode()) {
  // No modo de teste, usar o "ethereal" nodemailer que simula o envio sem realmente enviar
  console.log('Usando transportador de e-mail em modo TESTE (não envia realmente os e-mails)');
  
  // Criar uma conta de teste ethereal
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal_pass',
    },
    // Esta opção desativa o envio real, mas registra as informações
    debug: true,
    logger: true,
  });
} else {
  // No modo de produção, usar as credenciais SMTP reais
  console.log('Usando transportador de e-mail em modo PRODUÇÃO');
  transporter = nodemailer.createTransport({
    host: 'mail.endurancy.com.br',
    port: 465,
    secure: true, // true para porta 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// Tipos de e-mail
export type EmailTemplate = 
  | 'organization_registration'
  | 'organization_approved'
  | 'organization_rejected'
  | 'user_welcome'
  | 'password_reset'
  | 'plan_purchase_confirmation'
  | 'module_purchase_confirmation'
  | 'payment_failed'
  | 'subscription_expiring'
  | 'limit_warning'
  | 'new_module_available'
  | 'module_status_update';

// Interface para opções de e-mail
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Envia um e-mail usando o transportador configurado
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, from = process.env.EMAIL_USER } = options;
    
    if (isTestMode()) {
      // No modo de teste, apenas exibir as informações do e-mail no console
      console.log('\n========== MODO DE TESTE: E-MAIL SIMULADO ==========');
      console.log(`De: Endurancy <${from}>`);
      console.log(`Para: ${to}`);
      console.log(`Assunto: ${subject}`);
      console.log('Conteúdo HTML:\n');
      console.log(html);
      console.log('\n========== FIM DO E-MAIL SIMULADO ==========\n');
      
      // No modo de teste, consideramos como sucesso sem realmente enviar
      return true;
    } else {
      // No modo de produção, realmente enviar o e-mail
      await transporter.sendMail({
        from: `Endurancy <${from}>`,
        to,
        subject,
        html,
      });
    }
    
    console.log(`E-mail enviado para ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

/**
 * Gera o conteúdo HTML de um e-mail com base no template e nos dados
 */
export function generateEmailContent(
  template: EmailTemplate,
  data: Record<string, any>
): string {
  switch (template) {
    case 'organization_registration':
      return organizationRegistrationTemplate(data);
    case 'organization_approved':
      return organizationApprovedTemplate(data);
    case 'organization_rejected':
      return organizationRejectedTemplate(data);
    case 'user_welcome':
      return userWelcomeTemplate(data);
    case 'password_reset':
      return passwordResetTemplate(data);
    case 'plan_purchase_confirmation':
      return planPurchaseConfirmationTemplate(data);
    case 'module_purchase_confirmation':
      return modulePurchaseConfirmationTemplate(data);
    case 'payment_failed':
      return paymentFailedTemplate(data);
    case 'subscription_expiring':
      return subscriptionExpiringTemplate(data);
    case 'limit_warning':
      return limitWarningTemplate(data);
    case 'new_module_available':
      return newModuleAvailableTemplate(data);
    case 'module_status_update':
      return moduleStatusUpdateTemplate(data);
    default:
      return `<p>Houve um erro ao gerar o template de e-mail.</p>`;
  }
}

/**
 * Envia um e-mail usando um template
 */
export async function sendTemplateEmail(
  to: string,
  subject: string,
  template: EmailTemplate,
  data: Record<string, any>
): Promise<boolean> {
  const html = generateEmailContent(template, data);
  return sendEmail({ to, subject, html });
}

// Templates de e-mail
function organizationRegistrationTemplate(data: Record<string, any>): string {
  const { organizationName, adminName } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1>Registro de Organização Recebido</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${adminName}</strong>!</p>
        
        <p>Obrigado por registrar a organização <strong>${organizationName}</strong> em nossa plataforma. Recebemos sua solicitação e ela está sendo analisada por nossa equipe administrativa.</p>
        
        <p>O processo de análise inclui:</p>
        <ul style="padding-left: 20px;">
          <li>Validação das informações da organização</li>
          <li>Análise da documentação enviada</li>
          <li>Aprovação administrativa da solicitação</li>
          <li>Configuração do ambiente da organização</li>
          <li>Geração do código de acesso único</li>
        </ul>
        
        <p>Este processo pode levar até 5 dias úteis para ser concluído.</p>
        
        <p>Você receberá um novo e-mail assim que sua solicitação for processada.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #4f46e5;">
          <p style="margin: 0; font-style: italic;">Se tiver alguma dúvida, responda diretamente a este e-mail ou entre em contato com nossa equipe de suporte.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function organizationApprovedTemplate(data: Record<string, any>): string {
  const { organizationName, adminName, orgCode, loginUrl } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
        <h1>Organização Aprovada!</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${adminName}</strong>!</p>
        
        <p>Temos o prazer de informar que a organização <strong>${organizationName}</strong> foi aprovada e está pronta para uso em nossa plataforma!</p>
        
        <p>Você pode acessar o ambiente da sua organização usando o código único abaixo:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="font-family: monospace; font-size: 18px; margin: 0; font-weight: bold;">${orgCode}</p>
        </div>
        
        <p>Para acessar sua conta, visite:</p>
        <p style="text-align: center;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Plataforma</a>
        </p>
        
        <p>ou acesse diretamente pelo link: <a href="${loginUrl}">${loginUrl}</a></p>
        
        <p style="margin-top: 20px;">Bem-vindo à plataforma Endurancy!</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #10b981;">
          <p style="margin: 0; font-style: italic;">Se tiver alguma dúvida sobre como utilizar o sistema, consulte nossa documentação ou entre em contato com nossa equipe de suporte.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function organizationRejectedTemplate(data: Record<string, any>): string {
  const { organizationName, adminName, rejectionReason } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ef4444; padding: 20px; text-align: center; color: white;">
        <h1>Solicitação Não Aprovada</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${adminName}</strong>,</p>
        
        <p>Infelizmente, após análise, a solicitação de registro da organização <strong>${organizationName}</strong> não foi aprovada pelos seguintes motivos:</p>
        
        <div style="background-color: #fee2e2; padding: 15px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 0;">${rejectionReason || 'A documentação ou informações fornecidas não atenderam aos requisitos necessários.'}</p>
        </div>
        
        <p>Você pode fazer uma nova solicitação corrigindo os problemas mencionados acima.</p>
        
        <p>Se você acredita que houve um engano ou deseja obter mais informações sobre os motivos da rejeição, entre em contato com nossa equipe de suporte.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #6b7280;">
          <p style="margin: 0; font-style: italic;">Nossa equipe está à disposição para ajudar no processo de correção e nova submissão.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function userWelcomeTemplate(data: Record<string, any>): string {
  const { userName, organizationName, loginUrl } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1>Bem-vindo à Endurancy!</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${userName}</strong>!</p>
        
        <p>Seja bem-vindo à plataforma Endurancy! Sua conta foi criada com sucesso${organizationName ? ` para a organização <strong>${organizationName}</strong>` : ''}.</p>
        
        <p>Para acessar sua conta, visite:</p>
        <p style="text-align: center;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Plataforma</a>
        </p>
        
        <p>ou acesse diretamente pelo link: <a href="${loginUrl}">${loginUrl}</a></p>
        
        <p style="margin-top: 20px;">Estamos felizes em tê-lo conosco!</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #4f46e5;">
          <p style="margin: 0; font-style: italic;">Se tiver alguma dúvida, nossa equipe de suporte está à disposição para ajudar.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function passwordResetTemplate(data: Record<string, any>): string {
  const { userName, resetLink, expirationTime } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1>Redefinição de Senha</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${userName}</strong>!</p>
        
        <p>Recebemos uma solicitação para redefinir a senha da sua conta na plataforma Endurancy.</p>
        
        <p>Se você solicitou esta redefinição, clique no botão abaixo para criar uma nova senha:</p>
        <p style="text-align: center;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Redefinir Senha</a>
        </p>
        
        <p>ou acesse diretamente pelo link: <a href="${resetLink}">${resetLink}</a></p>
        
        <p>Este link expirará em <strong>${expirationTime}</strong>.</p>
        
        <div style="background-color: #fee2e2; padding: 15px; margin-top: 20px; border-left: 4px solid #ef4444;">
          <p style="margin: 0; font-style: italic;">Se você não solicitou esta redefinição, por favor ignore este e-mail ou entre em contato com nossa equipe de suporte caso tenha alguma preocupação com a segurança da sua conta.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function planPurchaseConfirmationTemplate(data: Record<string, any>): string {
  const { userName, organizationName, planName, planPrice, planDetails, startDate, nextBillingDate, orderNumber, accountUrl } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
        <h1>Confirmação de Assinatura</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${userName}</strong>!</p>
        
        <p>Parabéns! Sua assinatura do plano <strong>${planName}</strong> para <strong>${organizationName}</strong> foi confirmada com sucesso.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Detalhes da Assinatura:</h3>
          <p><strong>Número do Pedido:</strong> ${orderNumber}</p>
          <p><strong>Plano:</strong> ${planName}</p>
          <p><strong>Valor:</strong> R$ ${planPrice.toFixed(2)}</p>
          <p><strong>Data de Início:</strong> ${new Date(startDate).toLocaleDateString('pt-BR')}</p>
          <p><strong>Próxima Cobrança:</strong> ${new Date(nextBillingDate).toLocaleDateString('pt-BR')}</p>
          <p><strong>Recursos Incluídos:</strong></p>
          <ul style="padding-left: 20px;">
            ${planDetails.map((detail: string) => `<li>${detail}</li>`).join('')}
          </ul>
        </div>
        
        <p>Sua assinatura está ativa e todos os recursos do plano já estão disponíveis na plataforma.</p>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="${accountUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Minha Conta</a>
        </p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #10b981;">
          <p style="margin: 0; font-style: italic;">Para qualquer dúvida sobre sua assinatura ou faturamento, entre em contato com nossa equipe de suporte financeiro.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function modulePurchaseConfirmationTemplate(data: Record<string, any>): string {
  const { userName, organizationName, moduleName, modulePrice, startDate, billingCycle, orderNumber, accountUrl } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
        <h1>Módulo Ativado com Sucesso</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${userName}</strong>!</p>
        
        <p>Parabéns! O módulo <strong>${moduleName}</strong> foi adicionado com sucesso à organização <strong>${organizationName}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Detalhes da Compra:</h3>
          <p><strong>Número do Pedido:</strong> ${orderNumber}</p>
          <p><strong>Módulo:</strong> ${moduleName}</p>
          <p><strong>Valor:</strong> R$ ${modulePrice.toFixed(2)}/${billingCycle}</p>
          <p><strong>Data de Início:</strong> ${new Date(startDate).toLocaleDateString('pt-BR')}</p>
        </div>
        
        <p>O módulo já está ativo e pronto para uso em sua organização. Você pode começar a usá-lo imediatamente.</p>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="${accountUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar o Módulo</a>
        </p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #10b981;">
          <p style="margin: 0; font-style: italic;">Para suporte técnico sobre como utilizar este módulo, consulte nossa documentação ou entre em contato com nossa equipe de suporte.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function paymentFailedTemplate(data: Record<string, any>): string {
  const { userName, organizationName, planOrModuleName, attemptDate, paymentMethod, amount, reason, updatePaymentUrl } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ef4444; padding: 20px; text-align: center; color: white;">
        <h1>Problema com Pagamento</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${userName}</strong>,</p>
        
        <p>Identificamos um problema com o pagamento recente do ${planOrModuleName === 'plano' ? 'plano' : 'módulo'} <strong>${planOrModuleName}</strong> para a organização <strong>${organizationName}</strong>.</p>
        
        <div style="background-color: #fee2e2; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #b91c1c;">Detalhes do Problema:</h3>
          <p><strong>Data da Tentativa:</strong> ${new Date(attemptDate).toLocaleDateString('pt-BR')}</p>
          <p><strong>Método de Pagamento:</strong> ${paymentMethod}</p>
          <p><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
          <p><strong>Motivo da Falha:</strong> ${reason}</p>
        </div>
        
        <p>Para evitar a interrupção dos serviços, atualize suas informações de pagamento o mais rápido possível. Faremos uma nova tentativa de cobrança em 3 dias.</p>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="${updatePaymentUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Atualizar Método de Pagamento</a>
        </p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #6b7280;">
          <p style="margin: 0; font-style: italic;">Se precisar de ajuda ou tiver alguma dúvida, entre em contato com nossa equipe de suporte financeiro.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function subscriptionExpiringTemplate(data: Record<string, any>): string {
  const { userName, organizationName, planName, expirationDate, renewalPrice, renewUrl, daysLeft } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f97316; padding: 20px; text-align: center; color: white;">
        <h1>Sua Assinatura Irá Expirar em Breve</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${userName}</strong>,</p>
        
        <p>Gostaríamos de informar que sua assinatura do plano <strong>${planName}</strong> para a organização <strong>${organizationName}</strong> irá expirar em <strong>${daysLeft} dias</strong> (${new Date(expirationDate).toLocaleDateString('pt-BR')}).</p>
        
        <div style="background-color: #fff7ed; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f97316;">
          <h3 style="margin-top: 0; color: #c2410c;">Importante:</h3>
          <p>Para evitar qualquer interrupção nos serviços, recomendamos que você renove sua assinatura antes da data de expiração.</p>
          <p><strong>Valor da Renovação:</strong> R$ ${renewalPrice.toFixed(2)}</p>
        </div>
        
        <p>Caso a renovação automática esteja ativada, não é necessário tomar nenhuma ação. O valor será debitado automaticamente do seu método de pagamento cadastrado na data de renovação.</p>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="${renewUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Renovar Assinatura</a>
        </p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #6b7280;">
          <p style="margin: 0; font-style: italic;">Se você deseja alterar seu plano ou tem alguma dúvida sobre a renovação, entre em contato com nossa equipe de suporte.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function limitWarningTemplate(data: Record<string, any>): string {
  const { userName, organizationName, limitType, currentUsage, totalLimit, percentageUsed, upgradeUrl } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f97316; padding: 20px; text-align: center; color: white;">
        <h1>Alerta de Limite de Uso</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${userName}</strong>,</p>
        
        <p>Notamos que a organização <strong>${organizationName}</strong> está se aproximando do limite de ${limitType} disponível em seu plano atual.</p>
        
        <div style="background-color: #fff7ed; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f97316;">
          <h3 style="margin-top: 0; color: #c2410c;">Status de Utilização:</h3>
          <p><strong>Tipo de Limite:</strong> ${limitType}</p>
          <p><strong>Uso Atual:</strong> ${currentUsage} de ${totalLimit} (${percentageUsed}%)</p>
          
          <div style="background-color: #e5e7eb; height: 20px; border-radius: 10px; margin: 15px 0;">
            <div style="background-color: ${
              percentageUsed >= 90 ? '#ef4444' : '#f97316'
            }; width: ${percentageUsed}%; height: 20px; border-radius: 10px;"></div>
          </div>
        </div>
        
        <p>Para evitar interrupções no serviço, recomendamos fazer o upgrade do seu plano para continuar utilizando todos os recursos da plataforma sem restrições.</p>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="${upgradeUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Fazer Upgrade do Plano</a>
        </p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #6b7280;">
          <p style="margin: 0; font-style: italic;">Se precisar de ajuda para escolher o plano ideal para suas necessidades, nossa equipe de consultores está à disposição para auxiliá-lo.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function newModuleAvailableTemplate(data: Record<string, any>): string {
  const { userName, organizationName, moduleName, moduleDescription, modulePrice, billingCycle, features, moduleUrl } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1>Novo Módulo Disponível!</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${userName}</strong>!</p>
        
        <p>Temos o prazer de anunciar que um novo módulo está disponível para a organização <strong>${organizationName}</strong>!</p>
        
        <div style="background-color: #f0f4ff; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4f46e5;">
          <h3 style="margin-top: 0; color: #4338ca;">Conheça o Módulo ${moduleName}:</h3>
          <p>${moduleDescription}</p>
          <p><strong>Valor:</strong> R$ ${modulePrice.toFixed(2)}/${billingCycle}</p>
          
          <p><strong>Principais Funcionalidades:</strong></p>
          <ul style="padding-left: 20px;">
            ${features.map((feature: string) => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
        
        <p>Este módulo foi desenvolvido especialmente para melhorar a eficiência e produtividade da sua organização, oferecendo ferramentas avançadas para otimizar seus processos.</p>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="${moduleUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Conhecer o Módulo</a>
        </p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #6b7280;">
          <p style="margin: 0; font-style: italic;">Se tiver interesse em adquirir este módulo ou deseja uma demonstração personalizada, entre em contato com nossa equipe de vendas.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

function moduleStatusUpdateTemplate(data: Record<string, any>): string {
  const { userName, organizationName, moduleName, oldStatus, newStatus, updateDetails, updateDate, moduleUrl } = data;
  
  // Função para determinar cores com base no status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'development':
      case 'em desenvolvimento':
        return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' };
      case 'test':
      case 'em teste':
        return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'active':
      case 'ativo':
        return { bg: '#dcfce7', text: '#166534', border: '#22c55e' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#6b7280' };
    }
  };
  
  const oldStatusColors = getStatusColor(oldStatus);
  const newStatusColors = getStatusColor(newStatus);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1>Atualização de Status de Módulo</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Olá, <strong>${userName}</strong>!</p>
        
        <p>Gostaríamos de informar que o status do módulo <strong>${moduleName}</strong> na organização <strong>${organizationName}</strong> foi atualizado.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Detalhes da Atualização:</h3>
          <p><strong>Data da Atualização:</strong> ${new Date(updateDate).toLocaleDateString('pt-BR')}</p>
          <p>
            <strong>Status Anterior:</strong> 
            <span style="display: inline-block; padding: 4px 8px; background-color: ${oldStatusColors.bg}; color: ${oldStatusColors.text}; border-radius: 4px; border: 1px solid ${oldStatusColors.border};">${oldStatus}</span>
          </p>
          <p>
            <strong>Novo Status:</strong> 
            <span style="display: inline-block; padding: 4px 8px; background-color: ${newStatusColors.bg}; color: ${newStatusColors.text}; border-radius: 4px; border: 1px solid ${newStatusColors.border};">${newStatus}</span>
          </p>
        </div>
        
        <p>${updateDetails}</p>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="${moduleUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar Módulo</a>
        </p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin-top: 20px; border-left: 4px solid #6b7280;">
          <p style="margin: 0; font-style: italic;">Se tiver alguma dúvida sobre essa atualização, entre em contato com nossa equipe de suporte.</p>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}