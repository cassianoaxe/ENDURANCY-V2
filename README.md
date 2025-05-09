# Endurancy - Plataforma de Gestão Médica

Uma plataforma médica integrada para conectar médicos, pacientes e farmácias através de um sistema digital completo.

## Visão Geral

Endurancy é uma plataforma de gestão médica abrangente projetada para otimizar fluxos de trabalho de saúde, permitindo interações perfeitas entre médicos, pacientes e farmácias por meio de um ecossistema digital integrado.

### Tecnologias Principais

- Next.js para o framework frontend
- Tailwind CSS para design responsivo
- TypeScript para segurança de tipos
- PostgreSQL para persistência de dados
- ORM Drizzle para interações com o banco de dados
- Navegação com Sitemap aprimorada
- Sistema de afiliação médica multi-organização
- Fluxos de trabalho avançados de prescrição e gestão de pacientes
- Suporte ao idioma português para o mercado de saúde brasileiro

## Manutenção da Documentação

### Importante: Manutenção do Sitemap e Documentação

**Sempre que forem feitas alterações significativas na plataforma, o Sitemap e a documentação devem ser atualizados para refletir as mudanças.**

Áreas que requerem atualização frequente:
- Lista de módulos e suas funcionalidades
- Estrutura de planos e módulos correspondentes
- Links para novas páginas ou recursos
- Descrições de funcionalidades modificadas

O Sitemap serve como um guia abrangente da plataforma, ajudando usuários a navegarem facilmente pelo sistema. Manter esta documentação atualizada é essencial para garantir uma experiência de usuário consistente.

### Procedimento para Atualização do Sitemap

1. Navegue até `client/src/pages/Sitemap.tsx`
2. Atualize as seguintes seções quando necessário:
   - Tabela de planos e módulos
   - Descrições de funcionalidades nos acordeões
   - Lista de links para páginas
3. Atualize a data da "Última atualização" no rodapé

## Estrutura do Projeto

### Interface de Administrador
Painel centralizado para gerenciar usuários, organizações e configurações do sistema.

### Portal do Médico
Interface para médicos gerenciarem pacientes, criarem prescrições e gerenciarem suas afiliações a múltiplas organizações.

### Portal do Paciente
Interface para pacientes visualizarem suas prescrições, comprarem produtos aprovados e acessarem seu histórico médico.

## Conexões e Integrações

- Autenticação de múltiplos níveis para diferentes funções (administrador, médico, paciente)
- Integração com sistema de pagamento via link (alternativa ao Stripe)
- Suporte para múltiplas organizações e afiliações médicas

## Equipe de Desenvolvimento

Para contribuir com este projeto, certifique-se de seguir as diretrizes de codificação e manter a documentação atualizada.

