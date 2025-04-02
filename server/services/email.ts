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
  | "payment_success"
  | "payment_failed"
  | "invoice"
  | "ticket_creation"
  | "ticket_update"
  | "ticket_status_update"
  | "invitation"
  | "reminder";

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