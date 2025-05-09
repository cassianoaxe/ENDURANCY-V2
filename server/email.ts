import nodemailer from 'nodemailer';
import { z } from 'zod';

// Tipos de templates de email
export enum EmailTemplate {
  INVITE_DOCTOR = 'invite_doctor',
  WELCOME_DOCTOR = 'welcome_doctor',
  PASSWORD_RESET = 'password_reset',
  PRESCRIPTION_NOTIFICATION = 'prescription_notification',
  ORGANIZATION_INVITATION = 'organization_invitation',
  DOCTOR_AFFILIATION_INVITE = 'doctor_affiliation_invite',
  SAMPLE_REQUEST_CONFIRMATION = 'sample_request_confirmation',
  SAMPLE_RECEIVED_NOTIFICATION = 'sample_received_notification',
  SAMPLE_ANALYSIS_COMPLETE = 'sample_analysis_complete'
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
  [EmailTemplate.SAMPLE_REQUEST_CONFIRMATION]: {
    requestId: string;
    companyName: string;
    contactName: string;
    sampleType: string;
    analysisType: string;
    submissionDate: string;
    trackingUrl?: string;
    portalUrl: string;
  };
  [EmailTemplate.SAMPLE_RECEIVED_NOTIFICATION]: {
    requestId: string;
    companyName: string;
    contactName: string;
    sampleType: string;
    receivedDate: string;
    estimatedCompletionDate: string;
    portalUrl: string;
  };
  [EmailTemplate.SAMPLE_ANALYSIS_COMPLETE]: {
    requestId: string;
    companyName: string;
    contactName: string;
    sampleType: string;
    completionDate: string;
    portalUrl: string;
    reportUrl: string;
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
    case EmailTemplate.SAMPLE_REQUEST_CONFIRMATION:
      const confirmationData = data as EmailTemplateData[EmailTemplate.SAMPLE_REQUEST_CONFIRMATION];
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0f4c81;">Confirmação de Solicitação de Análise</h1>
          </div>
          
          <p>Olá <strong>${confirmationData.contactName}</strong>,</p>
          
          <p>Recebemos sua solicitação de análise para <strong>${confirmationData.companyName}</strong>. Obrigado por escolher nosso laboratório!</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #0f4c81; margin-top: 0;">Detalhes da Solicitação</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Número da Solicitação:</strong> ${confirmationData.requestId}</li>
              <li><strong>Tipo de Amostra:</strong> ${confirmationData.sampleType}</li>
              <li><strong>Tipo de Análise:</strong> ${confirmationData.analysisType}</li>
              <li><strong>Data de Solicitação:</strong> ${confirmationData.submissionDate}</li>
            </ul>
          </div>
          
          <h3 style="color: #0f4c81;">Próximos Passos</h3>
          <ol>
            <li>Prepare sua amostra conforme as <a href="#" style="color: #0f4c81;">instruções de envio</a>.</li>
            <li>Envie a amostra para o nosso laboratório o mais breve possível.</li>
            <li>Você receberá um email de confirmação quando recebermos sua amostra.</li>
          </ol>
          
          ${confirmationData.trackingUrl ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${confirmationData.trackingUrl}" style="background-color: #0f4c81; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acompanhar Envio</a>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${confirmationData.portalUrl}" style="background-color: #0f4c81; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Portal de Amostras</a>
          </div>
          
          <p>Caso tenha dúvidas, entre em contato conosco respondendo este email ou pelo telefone (41) 3333-4444.</p>
          
          <p style="font-size: 0.8em; color: #666; margin-top: 30px; text-align: center;">
            © 2025 LabAnalytics - Uma empresa Endurancy
          </p>
        </div>
      `;

    case EmailTemplate.SAMPLE_RECEIVED_NOTIFICATION:
      const receivedData = data as EmailTemplateData[EmailTemplate.SAMPLE_RECEIVED_NOTIFICATION];
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0f4c81;">Amostra Recebida com Sucesso</h1>
          </div>
          
          <p>Olá <strong>${receivedData.contactName}</strong>,</p>
          
          <p>Temos o prazer de informar que recebemos sua amostra em nosso laboratório.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #0f4c81; margin-top: 0;">Detalhes da Amostra</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Número da Solicitação:</strong> ${receivedData.requestId}</li>
              <li><strong>Empresa:</strong> ${receivedData.companyName}</li>
              <li><strong>Tipo de Amostra:</strong> ${receivedData.sampleType}</li>
              <li><strong>Data de Recebimento:</strong> ${receivedData.receivedDate}</li>
              <li><strong>Previsão de Conclusão:</strong> ${receivedData.estimatedCompletionDate}</li>
            </ul>
          </div>
          
          <p>Nossa equipe iniciará o processo de análise imediatamente. Você receberá notificações sobre o progresso da análise em seu email.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${receivedData.portalUrl}" style="background-color: #0f4c81; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acompanhar no Portal</a>
          </div>
          
          <p>Caso tenha dúvidas sobre o processo de análise, entre em contato com nossa equipe técnica.</p>
          
          <p style="font-size: 0.8em; color: #666; margin-top: 30px; text-align: center;">
            © 2025 LabAnalytics - Uma empresa Endurancy
          </p>
        </div>
      `;

    case EmailTemplate.SAMPLE_ANALYSIS_COMPLETE:
      const completeData = data as EmailTemplateData[EmailTemplate.SAMPLE_ANALYSIS_COMPLETE];
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0f4c81;">Análise Concluída</h1>
          </div>
          
          <p>Olá <strong>${completeData.contactName}</strong>,</p>
          
          <p>Temos o prazer de informar que a análise da sua amostra foi concluída com sucesso.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #0f4c81; margin-top: 0;">Detalhes da Análise</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Número da Solicitação:</strong> ${completeData.requestId}</li>
              <li><strong>Empresa:</strong> ${completeData.companyName}</li>
              <li><strong>Tipo de Amostra:</strong> ${completeData.sampleType}</li>
              <li><strong>Data de Conclusão:</strong> ${completeData.completionDate}</li>
            </ul>
          </div>
          
          <p>Você já pode acessar o relatório completo da análise através do nosso Portal de Amostras ou pelo link direto abaixo.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${completeData.reportUrl}" style="background-color: #2b7d2b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Baixar Laudo</a>
            <a href="${completeData.portalUrl}" style="background-color: #0f4c81; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Portal</a>
          </div>
          
          <p>Agradecemos por escolher nossos serviços. Se precisar de esclarecimentos sobre os resultados ou tiver interesse em realizar novas análises, nossa equipe técnica está à disposição.</p>
          
          <p style="font-size: 0.8em; color: #666; margin-top: 30px; text-align: center;">
            © 2025 LabAnalytics - Uma empresa Endurancy
          </p>
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