import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

// Template de emails suportados
export type EmailTemplate =
  | "welcome"
  | "reset_password"
  | "organization_created"
  | "organization_approved"
  | "organization_rejected"
  | "organization_registration"
  | "organization_activated"
  | "organization_activated_free"
  | "new_admin_credentials"
  | "payment_success"
  | "payment_failed"
  | "invoice"
  | "ticket_creation"
  | "ticket_update"
  | "ticket_status_update"
  | "invitation"
  | "reminder"
  | "payment_link";

// Cria o transporter do nodemailer com as configurações do ambiente
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: parseInt(process.env.EMAIL_PORT || "587") === 465, // true para porta 465, false para outras portas
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// Função para enviar emails
export async function sendMail(options: EmailOptions): Promise<any> {
  try {
    const transporter = createTransporter();
    
    // Adiciona o email padrão de origem se não foi fornecido
    const from = options.from || `"Endurancy" <${process.env.EMAIL_USER}>`;
    
    // Adiciona versão em texto simples se não foi fornecida
    const text = options.text || options.html.replace(/<[^>]*>?/gm, '');
    
    // Envia o email
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text,
      html: options.html,
    });
    
    console.log("Email enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}

// Função para enviar emails com templates
export async function sendTemplateEmail(
  to: string,
  subject: string,
  template: EmailTemplate,
  data: Record<string, any>
): Promise<any> {
  // Gera o HTML do template usando os dados fornecidos
  const html = renderEmailTemplate(template, data);
  
  // Envia o email usando a função sendMail
  return sendMail({
    to,
    subject,
    html,
  });
}

// Função para renderizar templates de email
function renderEmailTemplate(template: EmailTemplate, data: Record<string, any>): string {
  // Implementação simplificada - em produção, use um sistema de templates real
  switch (template) {
    case "welcome":
      return `
        <h1>Bem-vindo(a) ao Endurancy!</h1>
        <p>Olá ${data.name},</p>
        <p>Sua conta foi criada com sucesso. Estamos felizes em tê-lo(a) conosco!</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
    case "reset_password":
      return `
        <h1>Redefinição de Senha</h1>
        <p>Olá ${data.name},</p>
        <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para continuar:</p>
        <p><a href="${data.resetLink}">Redefinir senha</a></p>
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
    case "organization_created":
      return `
        <h1>Organização Criada</h1>
        <p>Olá ${data.name},</p>
        <p>Sua organização "${data.organizationName}" foi criada com sucesso.</p>
        <p>Estamos analisando os dados e em breve entraremos em contato.</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
    case "organization_approved":
      return `
        <h1>Organização Aprovada</h1>
        <p>Olá ${data.name},</p>
        <p>Sua organização "${data.organizationName}" foi aprovada!</p>
        <p>Agora você pode acessar todos os recursos disponíveis no seu plano.</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
    case "invitation":
      return `
        <h1>Convite para se juntar à ${data.organizationName}</h1>
        <p>Olá,</p>
        <p>Você foi convidado(a) para se juntar à organização "${data.organizationName}" como ${data.role}.</p>
        <p>Clique no link abaixo para aceitar o convite:</p>
        <p><a href="${data.invitationLink}">Aceitar Convite</a></p>
        <p>Este convite expira em ${data.expiresIn || '7 dias'}.</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
    case "ticket_creation":
      return `
        <h1>Novo Ticket Criado</h1>
        <p>Olá ${data.name},</p>
        <p>Um novo ticket foi criado:</p>
        <p><strong>Título:</strong> ${data.ticketTitle}</p>
        <p><strong>ID:</strong> ${data.ticketId}</p>
        <p><strong>Prioridade:</strong> ${data.priority}</p>
        <p>Acesse o ticket <a href="${data.ticketLink}">aqui</a>.</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
    case "ticket_update":
      return `
        <h1>Atualização no Ticket</h1>
        <p>Olá ${data.name},</p>
        <p>Seu ticket recebeu uma atualização:</p>
        <p><strong>Título:</strong> ${data.ticketTitle}</p>
        <p><strong>ID:</strong> ${data.ticketId}</p>
        <p><strong>Atualização:</strong> ${data.updateMessage}</p>
        <p>Acesse o ticket <a href="${data.ticketLink}">aqui</a>.</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
    case "ticket_status_update":
      return `
        <h1>Status do Ticket Atualizado</h1>
        <p>Olá ${data.name},</p>
        <p>O status do seu ticket foi alterado:</p>
        <p><strong>Título:</strong> ${data.ticketTitle}</p>
        <p><strong>ID:</strong> ${data.ticketId}</p>
        <p><strong>Novo Status:</strong> ${data.newStatus}</p>
        <p>Acesse o ticket <a href="${data.ticketLink}">aqui</a>.</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
    case "organization_registration":
      return `
        <h1>Registro de Organização Recebido</h1>
        <p>Olá ${data.adminName || 'Administrador'},</p>
        <p>Recebemos o registro da sua organização "${data.organizationName}".</p>
        <p>O acesso ao sistema será liberado automaticamente após a confirmação do pagamento.</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
      
    case "organization_activated":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://endurancy.app/logo.png" alt="Endurancy" style="max-width: 150px;">
          </div>
          
          <h1 style="color: #2e7d32; text-align: center;">Organização Ativada!</h1>
          
          <!-- Alerta SPAM visível para emails importantes -->
          <div style="background-color: #FFF9C4; padding: 15px; border-radius: 4px; border-left: 4px solid #FBC02D; margin: 20px 0;">
            <p style="margin: 0; color: #5D4037; font-weight: bold; display: flex; align-items: center;">
              <span style="font-size: 22px; margin-right: 8px;">⚠️</span>
              <span>IMPORTANTE: Verifique também sua pasta de SPAM ou Lixo Eletrônico!</span>
            </p>
          </div>
          
          <p>Olá ${data.adminName || 'Administrador'},</p>
          <p>Sua organização "<strong>${data.organizationName}</strong>" foi ativada com sucesso!</p>
          <p>Você já pode acessar o sistema com suas credenciais:</p>
          <p><strong>Usuário:</strong> ${data.username}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.accessLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Acessar o Sistema</a>
          </div>
          
          <p>Atenciosamente,<br>Equipe Endurancy</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px; text-align: center;">
            <p>Este é um email automático, por favor não responda.</p>
            <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
          </div>
        </div>
      `;
      
    case "organization_activated_free":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://endurancy.app/logo.png" alt="Endurancy" style="max-width: 150px;">
          </div>
          
          <h1 style="color: #2e7d32; text-align: center;">Organização Ativada com Plano Gratuito</h1>
          
          <!-- Alerta SPAM visível para emails importantes -->
          <div style="background-color: #FFF9C4; padding: 15px; border-radius: 4px; border-left: 4px solid #FBC02D; margin: 20px 0;">
            <p style="margin: 0; color: #5D4037; font-weight: bold; display: flex; align-items: center;">
              <span style="font-size: 22px; margin-right: 8px;">⚠️</span>
              <span>IMPORTANTE: Verifique também sua pasta de SPAM ou Lixo Eletrônico!</span>
            </p>
          </div>
          
          <p>Olá ${data.adminName || 'Administrador'},</p>
          <p>Sua organização "<strong>${data.organizationName}</strong>" foi ativada com o <strong>Plano Gratuito</strong>!</p>
          <p>Devido a problemas no processamento do pagamento, sua organização foi configurada com o plano gratuito, que fornece recursos básicos para você iniciar suas atividades.</p>
          <p>Você já pode acessar o sistema com suas credenciais:</p>
          <p><strong>Usuário:</strong> ${data.username}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.accessLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Acessar o Sistema</a>
          </div>
          
          <p>Para fazer upgrade para um plano com mais recursos, acesse a seção <a href="${data.upgradePlanLink}" style="color: #2e7d32; text-decoration: underline;">Meu Plano</a> no painel da sua organização.</p>
          
          <p>Atenciosamente,<br>Equipe Endurancy</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px; text-align: center;">
            <p>Este é um email automático, por favor não responda.</p>
            <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
          </div>
        </div>
      `;
    
    case "new_admin_credentials":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://endurancy.app/logo.png" alt="Endurancy" style="max-width: 150px;">
          </div>
          
          <h1 style="color: #2e7d32; text-align: center;">Suas Credenciais de Acesso</h1>
          
          <!-- Alerta SPAM visível para emails importantes -->
          <div style="background-color: #FFF9C4; padding: 15px; border-radius: 4px; border-left: 4px solid #FBC02D; margin: 20px 0;">
            <p style="margin: 0; color: #5D4037; font-weight: bold; display: flex; align-items: center;">
              <span style="font-size: 22px; margin-right: 8px;">⚠️</span>
              <span>IMPORTANTE: Verifique também sua pasta de SPAM ou Lixo Eletrônico!</span>
            </p>
          </div>
          
          <p>Olá ${data.adminName || 'Administrador'},</p>
          <p>Suas credenciais de acesso para a organização "<strong>${data.organizationName}</strong>" foram criadas:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Usuário:</strong> ${data.username}</p>
            <p><strong>Senha:</strong> ${data.password}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.accessLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Acessar o Sistema</a>
          </div>
          
          <p>Recomendamos que você altere sua senha após o primeiro acesso através da opção "Perfil" no menu do usuário.</p>
          <p>Se preferir, você pode redefinir sua senha <a href="${data.passwordResetLink}" style="color: #2e7d32; text-decoration: underline;">clicando aqui</a>.</p>
          
          <p>Atenciosamente,<br>Equipe Endurancy</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px; text-align: center;">
            <p>Este é um email automático, por favor não responda.</p>
            <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
          </div>
        </div>
      `;
      
    case "payment_link":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://endurancy.app/logo.png" alt="Endurancy" style="max-width: 150px;">
          </div>
          <h2 style="color: #333; text-align: center;">Pagamento Pendente</h2>
          
          <!-- Alerta SPAM bem visível no topo -->
          <div style="background-color: #FFF9C4; padding: 15px; border-radius: 4px; border-left: 4px solid #FBC02D; margin: 20px 0;">
            <p style="margin: 0; color: #5D4037; font-weight: bold; display: flex; align-items: center;">
              <span style="font-size: 22px; margin-right: 8px;">⚠️</span>
              <span>IMPORTANTE: Verifique também sua pasta de SPAM ou Lixo Eletrônico!</span>
            </p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">Olá ${data.adminName || 'Administrador'},</p>
          <p style="color: #555; line-height: 1.6;">Agradecemos por se registrar na plataforma Endurancy!</p>
          <p style="color: #555; line-height: 1.6;">Para ativar sua conta e começar a usar todos os recursos do plano <strong>${data.planName}</strong>, é necessário finalizar o pagamento.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.paymentLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Finalizar Pagamento</a>
          </div>
          
          <p style="color: #555; line-height: 1.6;">Este link de pagamento é válido por <strong>24 horas</strong>. Após esse período, será necessário solicitar um novo link.</p>
          
          <p style="color: #555; line-height: 1.6;">Caso tenha alguma dúvida, entre em contato com nossa equipe de suporte.</p>
          
          <p style="color: #555; line-height: 1.6;">Atenciosamente,<br>Equipe Endurancy</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
            <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
            <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
          </div>
        </div>
      `;
      
    // Template padrão para casos não tratados
    default:
      return `
        <h1>Notificação Endurancy</h1>
        <p>Olá ${data.name || 'usuário'},</p>
        <p>Esta é uma notificação do sistema Endurancy.</p>
        <p>Atenciosamente,<br>Equipe Endurancy</p>
      `;
  }
}

// Função para verificar se o serviço de email está configurado
export function isEmailServiceConfigured(): boolean {
  return !!(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASSWORD
  );
}