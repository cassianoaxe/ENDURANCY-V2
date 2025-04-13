# Lista Completa de URLs da Plataforma Endurancy

## URLs do Frontend

### URLs Gerais
- `/` - Página inicial
- `/login` - Página de login
- `/register` - Registro de nova conta
- `/forgot-password` - Recuperação de senha
- `/dashboard` - Dashboard principal
- `/profile` - Perfil do usuário
- `/settings` - Configurações da conta

### Módulo de Administração
- `/admin/dashboard` - Dashboard administrativo
- `/admin/organizations` - Gerenciamento de organizações
- `/admin/users` - Gerenciamento de usuários
- `/admin/plans` - Gerenciamento de planos
- `/admin/modules` - Gerenciamento de módulos
- `/admin/reports` - Relatórios administrativos
- `/admin/settings` - Configurações do sistema

### Módulo de Laboratório
- `/laboratory/dashboard` - Dashboard do laboratório
- `/laboratory/equipment` - Lista de equipamentos
- `/laboratory/equipment/:id` - Detalhes de um equipamento específico
- `/laboratory/samples` - Lista de amostras
- `/laboratory/samples/:id` - Detalhes de uma amostra específica
- `/laboratory/tests` - Lista de testes
- `/laboratory/tests/:id` - Detalhes de um teste específico
- `/laboratory/reports` - Relatórios laboratoriais
- `/laboratory/settings` - Configurações do laboratório
- `/laboratory/personnel` - Gestão de pessoal de laboratório
- `/laboratory/procedures` - Procedimentos e documentação técnica

### Módulo HPLC
- `/laboratory/hplc/dashboard` - Dashboard específico para HPLC
- `/laboratory/hplc/equipments` - Equipamentos de HPLC
- `/laboratory/hplc/maintenances` - Manutenções de equipamentos HPLC
- `/laboratory/hplc/consumables` - Gestão de consumíveis e reagentes
- `/laboratory/hplc/runs` - Corridas analíticas
- `/laboratory/hplc/methods` - Métodos analíticos
- `/laboratory/hplc/validations` - Validações de métodos
- `/laboratory/hplc/trainings` - Treinamentos HPLC

### Módulo de Médicos/Clínicos
- `/doctor/dashboard` - Dashboard do médico
- `/doctor/patients` - Lista de pacientes
- `/doctor/prescriptions` - Prescrições
- `/doctor/appointments` - Consultas e agenda
- `/doctor/profile` - Perfil profissional
- `/doctor/settings` - Configurações do perfil médico

### Módulo de Pacientes
- `/patient/dashboard` - Dashboard do paciente
- `/patient/prescriptions` - Prescrições recebidas
- `/patient/appointments` - Consultas agendadas
- `/patient/medical-records` - Histórico médico
- `/patient/profile` - Perfil pessoal
- `/patient/settings` - Configurações de conta

### Módulo de Farmácia
- `/pharmacy/dashboard` - Dashboard da farmácia
- `/pharmacy/inventory` - Controle de estoque
- `/pharmacy/prescriptions` - Prescrições para validação
- `/pharmacy/dispensations` - Dispensações realizadas
- `/pharmacy/reports` - Relatórios farmacêuticos
- `/pharmacy/settings` - Configurações da farmácia

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout de usuário
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/forgot-password` - Solicitar recuperação de senha
- `POST /api/auth/reset-password` - Redefinir senha
- `GET /api/auth/me` - Obter informações do usuário atual
- `POST /api/auth/login-as-admin` - Login como administrador (super admin)
- `POST /api/auth/return-to-admin` - Retornar ao usuário administrador original

### Organizações
- `GET /api/organizations` - Listar organizações
- `GET /api/organizations/:id` - Obter detalhes de uma organização
- `POST /api/organizations` - Criar organização
- `PUT /api/organizations/:id` - Atualizar organização
- `DELETE /api/organizations/:id` - Excluir organização
- `GET /api/organizations/:id/members` - Listar membros de uma organização
- `POST /api/organizations/:id/members` - Adicionar membro a uma organização
- `DELETE /api/organizations/:id/members/:userId` - Remover membro de uma organização

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter detalhes de um usuário
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Excluir usuário
- `PUT /api/users/:id/password` - Atualizar senha de usuário
- `PUT /api/users/:id/profile` - Atualizar perfil de usuário
- `POST /api/users/:id/photo` - Atualizar foto de perfil

### Planos e Módulos
- `GET /api/plans` - Listar planos
- `GET /api/plans/:id` - Obter detalhes de um plano
- `POST /api/plans` - Criar plano
- `PUT /api/plans/:id` - Atualizar plano
- `DELETE /api/plans/:id` - Excluir plano
- `GET /api/modules` - Listar módulos
- `GET /api/modules/:id` - Obter detalhes de um módulo
- `POST /api/modules` - Criar módulo
- `PUT /api/modules/:id` - Atualizar módulo
- `DELETE /api/modules/:id` - Excluir módulo
- `GET /api/module-plans` - Listar planos de módulos
- `POST /api/plan-change-requests` - Criar solicitação de mudança de plano
- `GET /api/plan-change-requests` - Listar solicitações de mudança de plano
- `PUT /api/plan-change-requests/:id` - Atualizar solicitação de mudança de plano

### Pacientes
- `GET /api/patients` - Listar pacientes
- `GET /api/patients/:id` - Obter detalhes de um paciente
- `POST /api/patients` - Criar paciente
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Excluir paciente
- `GET /api/patients/:id/prescriptions` - Listar prescrições de um paciente
- `GET /api/patients/:id/appointments` - Listar consultas de um paciente
- `GET /api/patients/:id/medical-records` - Obter histórico médico de um paciente

### Médicos
- `GET /api/doctors` - Listar médicos
- `GET /api/doctors/:id` - Obter detalhes de um médico
- `POST /api/doctors` - Criar médico
- `PUT /api/doctors/:id` - Atualizar médico
- `DELETE /api/doctors/:id` - Excluir médico
- `GET /api/doctors/:id/patients` - Listar pacientes de um médico
- `GET /api/doctors/:id/prescriptions` - Listar prescrições feitas por um médico
- `GET /api/doctors/:id/appointments` - Listar consultas de um médico
- `POST /api/doctors/affiliations` - Criar afiliação de médico com organização
- `GET /api/doctors/affiliations` - Listar afiliações de médico
- `PUT /api/doctors/affiliations/:id` - Atualizar afiliação de médico

### Equipamentos de Laboratório
- `GET /api/laboratory/equipments` - Listar equipamentos
- `GET /api/laboratory/equipments/:id` - Obter detalhes de um equipamento
- `POST /api/laboratory/equipments` - Criar equipamento
- `PUT /api/laboratory/equipments/:id` - Atualizar equipamento
- `DELETE /api/laboratory/equipments/:id` - Excluir equipamento
- `GET /api/laboratory/equipments/:id/maintenances` - Listar manutenções de um equipamento
- `POST /api/laboratory/equipments/:id/maintenances` - Adicionar manutenção a um equipamento
- `PUT /api/laboratory/maintenances/:id` - Atualizar manutenção
- `DELETE /api/laboratory/maintenances/:id` - Excluir manutenção
- `GET /api/laboratory/equipments/:id/certificates` - Listar certificados de um equipamento
- `POST /api/laboratory/equipments/:id/certificates` - Adicionar certificado a um equipamento
- `PUT /api/laboratory/certificates/:id` - Atualizar certificado
- `DELETE /api/laboratory/certificates/:id` - Excluir certificado

### HPLC
- `GET /api/laboratory/hplc/equipments` - Listar equipamentos HPLC
- `GET /api/laboratory/hplc/equipments/:id` - Obter detalhes de um equipamento HPLC
- `POST /api/laboratory/hplc/equipments` - Criar equipamento HPLC
- `PUT /api/laboratory/hplc/equipments/:id` - Atualizar equipamento HPLC
- `DELETE /api/laboratory/hplc/equipments/:id` - Excluir equipamento HPLC
- `GET /api/laboratory/hplc/consumables` - Listar consumíveis
- `GET /api/laboratory/hplc/consumables/:id` - Obter detalhes de um consumível
- `POST /api/laboratory/hplc/consumables` - Criar consumível
- `PUT /api/laboratory/hplc/consumables/:id` - Atualizar consumível
- `DELETE /api/laboratory/hplc/consumables/:id` - Excluir consumível
- `POST /api/laboratory/hplc/consumables/:id/consumption` - Registrar consumo de um item
- `GET /api/laboratory/hplc/runs` - Listar corridas
- `GET /api/laboratory/hplc/runs/:id` - Obter detalhes de uma corrida
- `POST /api/laboratory/hplc/runs` - Criar corrida
- `PUT /api/laboratory/hplc/runs/:id` - Atualizar corrida
- `DELETE /api/laboratory/hplc/runs/:id` - Excluir corrida
- `GET /api/laboratory/hplc/methods` - Listar métodos
- `GET /api/laboratory/hplc/methods/:id` - Obter detalhes de um método
- `POST /api/laboratory/hplc/methods` - Criar método
- `PUT /api/laboratory/hplc/methods/:id` - Atualizar método
- `DELETE /api/laboratory/hplc/methods/:id` - Excluir método
- `GET /api/laboratory/hplc/validations` - Listar validações
- `GET /api/laboratory/hplc/validations/:id` - Obter detalhes de uma validação
- `POST /api/laboratory/hplc/validations` - Criar validação
- `PUT /api/laboratory/hplc/validations/:id` - Atualizar validação
- `DELETE /api/laboratory/hplc/validations/:id` - Excluir validação
- `GET /api/laboratory/hplc/trainings` - Listar treinamentos
- `GET /api/laboratory/hplc/trainings/:id` - Obter detalhes de um treinamento
- `POST /api/laboratory/hplc/trainings` - Criar treinamento
- `PUT /api/laboratory/hplc/trainings/:id` - Atualizar treinamento
- `DELETE /api/laboratory/hplc/trainings/:id` - Excluir treinamento

### Amostras e Testes
- `GET /api/laboratory/samples` - Listar amostras
- `GET /api/laboratory/samples/:id` - Obter detalhes de uma amostra
- `POST /api/laboratory/samples` - Criar amostra
- `PUT /api/laboratory/samples/:id` - Atualizar amostra
- `DELETE /api/laboratory/samples/:id` - Excluir amostra
- `GET /api/laboratory/tests` - Listar testes
- `GET /api/laboratory/tests/:id` - Obter detalhes de um teste
- `POST /api/laboratory/tests` - Criar teste
- `PUT /api/laboratory/tests/:id` - Atualizar teste
- `DELETE /api/laboratory/tests/:id` - Excluir teste
- `POST /api/laboratory/tests/:id/results` - Adicionar resultados a um teste
- `GET /api/laboratory/reports` - Listar relatórios
- `GET /api/laboratory/reports/:id` - Obter detalhes de um relatório
- `POST /api/laboratory/reports` - Gerar relatório
- `PUT /api/laboratory/reports/:id` - Atualizar relatório

### Relatórios e Métricas
- `GET /api/reports/sales/monthly` - Obter dados de vendas mensais
- `GET /api/reports/sales/by-channel` - Obter dados de vendas por canal
- `GET /api/reports/sales/daily` - Obter dados de vendas diárias
- `GET /api/reports/sales/top-products` - Obter produtos mais vendidos
- `GET /api/reports/sales/metrics` - Obter métricas de vendas

### Tickets e Suporte
- `GET /api/tickets` - Listar tickets
- `GET /api/tickets/:id` - Obter detalhes de um ticket
- `POST /api/tickets` - Criar ticket
- `PUT /api/tickets/:id` - Atualizar ticket
- `DELETE /api/tickets/:id` - Excluir ticket
- `POST /api/tickets/:id/comments` - Adicionar comentário a um ticket
- `GET /api/tickets/:id/comments` - Listar comentários de um ticket

### Notificações
- `GET /api/notifications` - Listar notificações
- `PUT /api/notifications/:id` - Marcar notificação como lida
- `PUT /api/notifications/read-all` - Marcar todas notificações como lidas

## Webhooks

### Pagamentos
- `/api/webhooks/payments` - Webhook para processamento de pagamentos
- `/api/webhooks/stripe` - Webhook para integrações com Stripe

## URLs de Documentação
- `/documentation` - Documentação geral
- `/documentation/laboratory` - Documentação do módulo de laboratório
- `/documentation/hplc` - Documentação específica do módulo HPLC
- `/documentation/api` - Documentação da API

---

*Última atualização: 13 de abril de 2025*