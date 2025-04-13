# Documentação do Módulo de Laboratório

## Visão Geral

O Módulo de Laboratório é uma parte essencial da plataforma Endurancy, projetado especificamente para laboratórios que realizam análises de cannabis medicinal. Este módulo permite o gerenciamento completo de equipamentos, amostras, testes, reagentes e processos relacionados à análise laboratorial.

## Módulos Principais

O sistema de laboratório é dividido em duas áreas principais:

1. **Gestão Geral de Laboratório**
   - Gerenciamento de amostras e testes
   - Rastreamento de resultados
   - Emissão de laudos

2. **Gestão de Equipamentos HPLC**
   - Gerenciamento de equipamentos de cromatografia
   - Controle de manutenções e calibrações
   - Gestão de consumíveis e reagentes
   - Validação de métodos analíticos
   - Rastreamento de treinamentos

## Tipos de Usuários

- **Usuário Laboratory/Labor**: Pode acessar todos os recursos do módulo de laboratório
- **Administrador**: Pode configurar permissões e supervisionar todas as operações

## Funcionalidades Disponíveis

### Gerenciamento de Equipamentos

- **Listagem de Equipamentos**: Visualização de todos os equipamentos cadastrados com filtros e ordenação
- **Detalhes do Equipamento**: Informações detalhadas, incluindo histórico de manutenções e certificados
- **Cadastro de Equipamentos**: Formulário para adição de novos equipamentos com campos para todas as informações relevantes
- **Atualização de Equipamentos**: Edição das informações de equipamentos existentes
- **Exclusão de Equipamentos**: Remoção de equipamentos do sistema (com exclusão em cascata de registros relacionados)
- **Alerta de Manutenções**: O sistema alerta sobre equipamentos que necessitam de manutenção ou calibração nos próximos 30 dias

### Manutenções

- **Registro de Manutenções**: Cadastro de atividades de manutenção preventiva e corretiva
- **Tipo de Manutenção**: Categorização em manutenção regular, calibração ou validação
- **Acompanhamento de Status**: Agendada, em andamento, concluída ou cancelada
- **Documentação**: Possibilidade de anexar documentos relacionados à manutenção

### Certificados

- **Registro de Certificados**: Documentação de certificados emitidos para os equipamentos
- **Tipo de Certificado**: Certificados de calibração, qualificação ou validação
- **Período de Validade**: Controle da data de emissão e expiração
- **Documentação**: Possibilidade de anexar arquivos de certificados e documentações relacionadas

### HPLC Específico

- **Consumíveis**: Gerenciamento de colunas, solventes, reagentes e outros consumíveis
- **Controle de Estoque**: Monitoramento da quantidade e alertas de nível mínimo
- **Validação de Métodos**: Registro de processos de validação de métodos analíticos
- **Corridas Analíticas**: Registro de análises realizadas no equipamento de HPLC
- **Procedimentos**: Documentação de POPs e métodos analíticos
- **Treinamentos**: Registro de treinamentos realizados pelos operadores

## Esquema de Dados

### Tabelas Principais

#### Equipamentos (lab_equipments)
- id (chave primária)
- name (nome do equipamento)
- model (modelo)
- serial_number (número de série)
- manufacturer (fabricante)
- acquisition_date (data de aquisição)
- installation_date (data de instalação)
- status (operacional, manutenção, fora de serviço)
- location (localização física)
- description (descrição)
- maintenance_frequency (frequência de manutenção em dias)
- calibration_frequency (frequência de calibração em dias)
- validation_frequency (frequência de validação em dias)
- last_maintenance_date (data da última manutenção)
- next_maintenance_date (data da próxima manutenção)
- last_calibration_date (data da última calibração)
- next_calibration_date (data da próxima calibração)
- last_validation_date (data da última validação)
- next_validation_date (data da próxima validação)
- laboratory_id (laboratório responsável)
- responsible_user_id (usuário responsável)
- documents (array de documentos)
- created_at (data de criação)
- updated_at (data de atualização)

#### Manutenções (equipment_maintenances)
- id (chave primária)
- equipment_id (referência ao equipamento)
- maintenance_type (tipo: regular, calibração, validação)
- description (descrição da manutenção)
- scheduled_date (data agendada)
- completion_date (data de conclusão)
- performed_by (realizado por)
- cost (custo)
- status (agendada, em andamento, concluída, cancelada)
- service_provider (prestador de serviço)
- notes (observações)
- attachments (anexos)
- results_summary (resumo dos resultados)
- approved_by (aprovado por)
- follow_up_required (necessidade de acompanhamento)
- follow_up_date (data de acompanhamento)
- created_by (criado por)
- created_at (data de criação)
- updated_at (data de atualização)

#### Certificados (equipment_certificates)
- id (chave primária)
- equipment_id (referência ao equipamento)
- certificate_type (tipo de certificado)
- certificate_number (número do certificado)
- issue_date (data de emissão)
- expiry_date (data de expiração)
- issuing_organization (organização emissora)
- description (descrição)
- status (válido, expirado, revogado)
- attachments (anexos)
- notes (observações)
- created_by (criado por)
- created_at (data de criação)
- updated_at (data de atualização)

## API Endpoints

### Equipamentos

- `GET /api/laboratory/equipments` - Lista todos os equipamentos
- `GET /api/laboratory/equipments/:id` - Obtém detalhes de um equipamento específico
- `POST /api/laboratory/equipments` - Adiciona um novo equipamento
- `PUT /api/laboratory/equipments/:id` - Atualiza um equipamento existente
- `DELETE /api/laboratory/equipments/:id` - Remove um equipamento

### Manutenções

- `GET /api/laboratory/equipments/:id/maintenances` - Lista manutenções de um equipamento
- `POST /api/laboratory/equipments/:id/maintenances` - Adiciona uma nova manutenção
- `PUT /api/laboratory/maintenances/:id` - Atualiza uma manutenção existente
- `DELETE /api/laboratory/maintenances/:id` - Remove uma manutenção

### Certificados

- `GET /api/laboratory/equipments/:id/certificates` - Lista certificados de um equipamento
- `POST /api/laboratory/equipments/:id/certificates` - Adiciona um novo certificado
- `PUT /api/laboratory/certificates/:id` - Atualiza um certificado existente
- `DELETE /api/laboratory/certificates/:id` - Remove um certificado

## Interface do Usuário

A interface do usuário para o módulo de laboratório segue o padrão de design do sistema Endurancy, com ênfase em usabilidade e eficiência. Os principais componentes incluem:

- **Dashboard de Laboratório**: Visão geral dos equipamentos, manutenções pendentes e certificados próximos de expiração
- **Lista de Equipamentos**: Tabela com filtros e opções de ordenação
- **Detalhes do Equipamento**: Página com abas para informações gerais, manutenções e certificados
- **Formulários**: Interfaces intuitivas para adição e edição de dados
- **Alertas**: Notificações visuais para itens que requerem atenção

## Autenticação e Autorização

O acesso ao módulo de laboratório é restrito a usuários com as funções `laboratory` ou `labor`. A autenticação é feita via sistema de login com sessão, e todas as requisições à API exigem autenticação.

## Manutenção e Suporte

Para questões relacionadas ao módulo de laboratório, entre em contato com o suporte técnico da Endurancy através do sistema de tickets ou pelo e-mail support@endurancy.com.

---

*Última atualização: 13 de abril de 2025*