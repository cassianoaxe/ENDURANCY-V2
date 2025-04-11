import nodemailer from 'nodemailer';
import { z } from 'zod';

// Tipos de templates de email
export enum EmailTemplate {
  INVITE_DOCTOR = 'invite_doctor',
  WELCOME_DOCTOR = 'welcome_doctor',
  PASSWORD_RESET = 'password_reset',
  PRESCRIPTION_NOTIFICATION = 'prescription_notification',
  ORGANIZATION_INVITATION = 'organization_invitation',
  DOCTOR_AFFILIATION_INVITE = 'doctor_affiliation_invite'
}

// Interface para os dados dos templates
export interface EmailTemplateData {
  [EmailTemplate.INVITE_DOCTOR]: {
    doctorName: string;
    organizationName: string;
    inviteLink: string;
    expirationDate: string;
  };
  [EmailTemplate.WELCOME_DOCTOR]: {
    doctorName: string;
    organizationName: string;
    loginLink: string;
  };
  [EmailTemplate.PASSWORD_RESET]: {
    userName: string;
    resetLink: string;
    expirationTime: string;
  };
  [EmailTemplate.PRESCRIPTION_NOTIFICATION]: {
    patientName: string;
    doctorName: string;
    prescriptionDate: string;
    viewLink: string;
  };
  [EmailTemplate.ORGANIZATION_INVITATION]: {
    userName: string;
    organizationName: string;
    inviteLink: string;
    expirationDate: string;
  };
  [EmailTemplate.DOCTOR_AFFILIATION_INVITE]: {
    doctorName: string;
    doctorEmail: string;
    organizationName: string;
    organizationType: string;
    specialtyName: string;
    crmData: string;
    acceptLink: string;
    declineLink: string;
    expirationDate: string;
    customMessage?: string;
  };
}

// Validação de email
const emailSchema = z.string().email();

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

// Renderiza template para o corpo do email (HTML)
function renderEmailTemplate<T extends EmailTemplate>(
  template: T, 
  data: EmailTemplateData[T]
): string {
  switch (template) {
    case EmailTemplate.DOCTOR_AFFILIATION_INVITE:
      const affiliationData = data as EmailTemplateData[EmailTemplate.DOCTOR_AFFILIATION_INVITE];
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3b82f6;">Convite para Afiliação Médica</h1>
          </div>
          
          <p>Olá Dr(a). <strong>${affiliationData.doctorName}</strong>,</p>
          
          <p>A organização <strong>${affiliationData.organizationName}</strong> (${affiliationData.organizationType}) gostaria de convidá-lo(a) para se afiliar como médico em nossa plataforma.</p>
          
          <p>Dados do convite:</p>
          <ul>
            <li>Especialidade: ${affiliationData.specialtyName}</li>
            <li>CRM: ${affiliationData.crmData}</li>
            <li>Email: ${affiliationData.doctorEmail}</li>
          </ul>
          
          ${affiliationData.customMessage ? `<p>Mensagem da organização: <em>"${affiliationData.customMessage}"</em></p>` : ''}
          
          <p>Este convite expira em: <strong>${affiliationData.expirationDate}</strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${affiliationData.acceptLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Aceitar Convite</a>
            <a href="${affiliationData.declineLink}" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Recusar Convite</a>
          </div>
          
          <p style="font-size: 0.8em; color: #666; margin-top: 30px;">Se você não esperava este convite ou tem dúvidas, por favor ignore este email ou entre em contato com o suporte.</p>
        </div>
      `;

    // Adicione outros casos conforme necessário
    default:
      return `<p>Template não encontrado para ${template}</p>`;
  }
}

// Função para envio de emails com templates
export async function sendTemplateEmail<T extends EmailTemplate>(
  to: string,
  subject: string,
  template: T,
  data: EmailTemplateData[T]
): Promise<boolean> {
  try {
    // Validar o endereço de email
    emailSchema.parse(to);
    
    // Renderizar o template
    const html = renderEmailTemplate(template, data);
    
    // Enviar o email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@endurancy.com.br',
      to,
      subject,
      html
    };
    
    console.log(`Enviando email para ${to} com o template ${template}`);
    
    // Em ambiente de desenvolvimento ou teste, apenas simular o envio
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Simulando envio de email em ambiente de desenvolvimento:');
      console.log('Para:', to);
      console.log('Assunto:', subject);
      console.log('Template:', template);
      console.log('Dados:', JSON.stringify(data, null, 2));
      return true;
    }
    
    // Em ambiente de produção, envia o email de verdade
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}