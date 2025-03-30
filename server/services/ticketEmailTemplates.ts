/**
 * Templates de e-mail para o sistema de tickets
 */

export function ticketCreationTemplate(data: Record<string, any>): string {
  const { ticketId, ticketTitle, priority, organizationName, description } = data;
  
  // Cores baseadas na prioridade
  const priorityColors = {
    'baixa': { bg: '#f3f4f6', text: '#1f2937', border: '#d1d5db' },
    'media': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    'alta': { bg: '#fee2e2', text: '#b91c1c', border: '#f87171' },
    'critica': { bg: '#7f1d1d', text: '#ffffff', border: '#ef4444' }
  };
  
  // Usar as cores para a prioridade atual, ou padrão se não encontrar
  const colorSet = priorityColors[priority as keyof typeof priorityColors] || priorityColors['media'];
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1>Novo Ticket de Suporte</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Um novo ticket de suporte foi criado pela organização <strong>${organizationName}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Detalhes do Ticket:</h3>
          <p><strong>ID:</strong> #${ticketId}</p>
          <p><strong>Título:</strong> ${ticketTitle}</p>
          <p>
            <strong>Prioridade:</strong> 
            <span style="display: inline-block; padding: 4px 8px; background-color: ${colorSet.bg}; color: ${colorSet.text}; border-radius: 4px; border: 1px solid ${colorSet.border};">${priority}</span>
          </p>
          <p><strong>Organização:</strong> ${organizationName}</p>
          <p><strong>Descrição:</strong></p>
          <div style="background-color: #ffffff; padding: 10px; border: 1px solid #e5e7eb; border-radius: 4px;">
            <p>${description.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        
        <p>Por favor, analise e atribua este ticket assim que possível.</p>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="/tickets/${ticketId}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Ticket</a>
        </p>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

export function ticketUpdateTemplate(data: Record<string, any>): string {
  const { ticketId, ticketTitle, commentContent, commentAuthor, organizationName } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1>Atualização em Ticket de Suporte</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>O ticket <strong>#${ticketId}: ${ticketTitle}</strong>${organizationName ? ` da organização <strong>${organizationName}</strong>` : ''} recebeu um novo comentário de <strong>${commentAuthor}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-left: 4px solid #4f46e5;">
          <p style="margin: 0;">${commentContent.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="/tickets/${ticketId}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Ticket</a>
        </p>
        
        <p>Você pode responder diretamente através da plataforma.</p>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

export function ticketStatusUpdateTemplate(data: Record<string, any>): string {
  const { ticketId, ticketTitle, oldStatus, newStatus } = data;
  
  // Mapeamento de cores de status
  const statusColors = {
    'novo': { bg: '#f3f4f6', text: '#1f2937', border: '#9ca3af' },
    'em_analise': { bg: '#dbeafe', text: '#1e40af', border: '#60a5fa' },
    'em_desenvolvimento': { bg: '#e0f2fe', text: '#0369a1', border: '#38bdf8' },
    'aguardando_resposta': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    'resolvido': { bg: '#d1fae5', text: '#065f46', border: '#34d399' },
    'fechado': { bg: '#f3f4f6', text: '#4b5563', border: '#9ca3af' },
    'cancelado': { bg: '#fee2e2', text: '#b91c1c', border: '#f87171' }
  };
  
  const oldStatusColor = statusColors[oldStatus as keyof typeof statusColors] || statusColors['novo'];
  const newStatusColor = statusColors[newStatus as keyof typeof statusColors] || statusColors['novo'];
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1>Status do Ticket Atualizado</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>O status do ticket <strong>#${ticketId}: ${ticketTitle}</strong> foi atualizado.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p>
            <strong>Status Anterior:</strong> 
            <span style="display: inline-block; padding: 4px 8px; background-color: ${oldStatusColor.bg}; color: ${oldStatusColor.text}; border-radius: 4px; border: 1px solid ${oldStatusColor.border};">${oldStatus.replace(/_/g, ' ')}</span>
          </p>
          <p>
            <strong>Novo Status:</strong> 
            <span style="display: inline-block; padding: 4px 8px; background-color: ${newStatusColor.bg}; color: ${newStatusColor.text}; border-radius: 4px; border: 1px solid ${newStatusColor.border};">${newStatus.replace(/_/g, ' ')}</span>
          </p>
        </div>
        
        ${newStatus === 'resolvido' ? 
          '<p>Seu ticket foi marcado como resolvido. Se o problema não estiver completamente resolvido, você pode reabri-lo respondendo a este ticket na plataforma.</p>' : 
          '<p>Você pode verificar mais detalhes e o histórico completo do ticket na plataforma.</p>'
        }
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="/tickets/${ticketId}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Ticket</a>
        </p>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}

export function ticketResolvedTemplate(data: Record<string, any>): string {
  const { ticketId, ticketTitle, resolution, resolutionDate } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
        <h1>Ticket Resolvido</h1>
      </div>
      <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Temos o prazer de informar que seu ticket <strong>#${ticketId}: ${ticketTitle}</strong> foi resolvido.</p>
        
        <div style="background-color: #d1fae5; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981; color: #065f46;">
          <p style="margin: 0;"><strong>Data de Resolução:</strong> ${new Date(resolutionDate).toLocaleDateString('pt-BR')}</p>
        </div>
        
        ${resolution ? `
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Solução:</h3>
          <p>${resolution.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}
        
        <p>Se você ainda tiver alguma dúvida ou se o problema reaparecer, por favor, sinta-se à vontade para reabrir o ticket ou criar um novo.</p>
        
        <p>Agradecemos sua paciência e compreensão durante o processo de resolução.</p>
        
        <p style="text-align: center; margin-top: 20px;">
          <a href="/feedback/${ticketId}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Fornecer Feedback</a>
        </p>
      </div>
      <div style="padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}