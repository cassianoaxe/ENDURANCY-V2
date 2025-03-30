import nodemailer from 'nodemailer';

// Verificar se estamos no modo de teste ou produção
// Temporariamente, estamos forçando o modo de teste, independente da variável de ambiente
const isTestMode = true; // process.env.EMAIL_TEST_MODE === 'true';

console.log(`Configurando serviço de e-mail em modo: ${isTestMode ? 'TESTE' : 'PRODUÇÃO'}`);

// Configuração do transportador de e-mail
let transporter: nodemailer.Transporter;

if (isTestMode) {
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
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true para porta 465, false para outras portas
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
  | 'password_reset';

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
    
    if (isTestMode) {
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