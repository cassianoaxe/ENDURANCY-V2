import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, LinkIcon, Grid, Users, Clipboard, Home, LineChart, 
  Settings, User, Building, FileText, ShieldCheck, Pill, Leaf, 
  BookOpen, Database, Bell, HelpCircle, Clock,
  Key, Stethoscope, LayoutGrid, Mail, MapPin, ClipboardList,
  UserPlus, Globe, Scale, Eye, Brain, ShoppingCart, Package,
  Building2, MessageSquare, Microscope, Box, CreditCard
} from 'lucide-react';

// Componente para o título com ícone Leaf
const EndurancyTitle = () => (
  <div className="flex items-center justify-center gap-2 text-green-700">
    <Leaf className="h-8 w-8 text-green-600" strokeWidth={2} />
    <span className="text-3xl font-bold">Endurancy</span>
  </div>
);

const Sitemap = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center">
      <div className="container py-8 max-w-5xl mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <EndurancyTitle />
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-semibold mb-2 text-green-800">Sitemap do Sistema</h2>
            <p className="text-gray-600 mb-6">Mapa completo de todas as páginas e rotas do sistema</p>
          </div>
        </div>

        <Card className="mb-8 shadow-lg border-green-100">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Navegação e Acesso ao Sistema
            </CardTitle>
            <CardDescription>Informações importantes sobre como navegar e acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2 text-green-700">Acesso a Organizações</h3>
              <p className="text-sm text-gray-600 mb-2">
                O Endurancy permite o acesso a múltiplas organizações através de diferentes métodos:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li><strong>URL Direta</strong>: Acesse uma organização específica usando <code>/org/:organizationId</code> na URL</li>
                <li><strong>Parâmetro de Query</strong>: Use <code>?organizationId=123</code> em qualquer URL para acessar uma organização específica</li>
                <li><strong>Organizações Vinculadas</strong>: Médicos podem estar vinculados a múltiplas organizações e alternar entre elas</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2 text-green-700">Estrutura de IDs e Navegação</h3>
              <p className="text-sm text-gray-600 mb-2">
                Como encontrar e navegar usando IDs de organização:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Os IDs de organização podem ser encontrados na URL durante a navegação</li>
                <li>Administradores podem visualizar todos os IDs de organização na página de Organizações</li>
                <li>Médicos podem ver suas organizações vinculadas na página de Afiliações</li>
                <li>Use o navegador para localizar URLs específicas e IDs de organização correspondentes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg border-green-100">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Grid className="h-5 w-5 text-green-600" />
              Módulos do Sistema
            </CardTitle>
            <CardDescription>Visão detalhada de todos os módulos e suas funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 text-green-700">Planos e Estrutura de Módulos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50 text-left">
                      <th className="p-3 border border-green-100 font-medium">Nível de Plano</th>
                      <th className="p-3 border border-green-100 font-medium">Nome do Plano</th>
                      <th className="p-3 border border-green-100 font-medium">Módulos Incluídos</th>
                      <th className="p-3 border border-green-100 font-medium">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-green-100">1</td>
                      <td className="p-3 border border-green-100">Freemium/Básico</td>
                      <td className="p-3 border border-green-100">Básico</td>
                      <td className="p-3 border border-green-100">Acesso limitado ao sistema com funcionalidades essenciais</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-green-100">2</td>
                      <td className="p-3 border border-green-100">Seed</td>
                      <td className="p-3 border border-green-100">Básico, Gestão de Pacientes</td>
                      <td className="p-3 border border-green-100">Funcionalidades básicas com gerenciamento de pacientes</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-green-100">3</td>
                      <td className="p-3 border border-green-100">Grow</td>
                      <td className="p-3 border border-green-100">Básico, Gestão de Pacientes, Prescrições</td>
                      <td className="p-3 border border-green-100">Plano intermediário com gestão de prescrições</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-green-100">4</td>
                      <td className="p-3 border border-green-100">Professional/Pro</td>
                      <td className="p-3 border border-green-100">Todos os módulos</td>
                      <td className="p-3 border border-green-100">Acesso completo a todas as funcionalidades do sistema</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-green-100">5</td>
                      <td className="p-3 border border-green-100">Enterprise</td>
                      <td className="p-3 border border-green-100">Todos os módulos + Personalização</td>
                      <td className="p-3 border border-green-100">Acesso completo com suporte personalizado e configurações específicas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4 text-green-700">Descrição Detalhada dos Módulos</h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="mod-basic">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span>Módulo Básico</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Funcionalidades fundamentais do sistema disponíveis em todos os planos.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Login e autenticação de usuários</li>
                      <li>Gerenciamento de perfil básico</li>
                      <li>Dashboard com informações básicas</li>
                      <li>Navegação pelo sistema</li>
                      <li>Alteração de senha e configurações pessoais</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-patients">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Módulo de Gestão de Pacientes</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Sistema completo para gerenciamento de pacientes nas organizações médicas.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Cadastro e gerenciamento de pacientes</li>
                      <li>Histórico médico completo</li>
                      <li>Ficha do paciente com dados pessoais e médicos</li>
                      <li>Categorização de pacientes</li>
                      <li>Busca e filtragem de pacientes</li>
                      <li>Atribuição de pacientes a médicos específicos</li>
                      <li>Exportação de dados de pacientes</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-prescription">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Módulo de Prescrições</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Sistema avançado para criação e gerenciamento de prescrições médicas.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Criação de prescrições para pacientes</li>
                      <li>Fluxo de aprovação de prescrições (médico → farmacêutico)</li>
                      <li>Especificação de dosagens e produtos</li>
                      <li>Histórico completo de prescrições por paciente</li>
                      <li>Assinatura digital de prescrições</li>
                      <li>Impressão de prescrições em formato padronizado</li>
                      <li>Renovação e cancelamento de prescrições</li>
                      <li>Notificações sobre status de prescrições</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-products">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      <span>Módulo de Produtos</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Gerenciamento completo do catálogo de produtos médicos e farmacêuticos.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Cadastro e manutenção do catálogo de produtos</li>
                      <li>Categorização por tipo (medicamentos, suplementos, etc.)</li>
                      <li>Gestão de estoque e disponibilidade</li>
                      <li>Informações detalhadas sobre cada produto</li>
                      <li>Controle de preços e promoções</li>
                      <li>Integração com prescrições médicas</li>
                      <li>Relatórios de produtos mais prescritos</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-organizations">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>Módulo de Organizações</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Gestão de múltiplas organizações médicas e suas integrações.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Cadastro e gerenciamento de organizações</li>
                      <li>Definição de tipos de organização (clínica, hospital, etc.)</li>
                      <li>Configurações específicas por organização</li>
                      <li>Gerenciamento de usuários da organização</li>
                      <li>Controle de acesso e permissões</li>
                      <li>Relatórios específicos por organização</li>
                      <li>Personalização de interface e documentos</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-doctor">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Módulo de Médicos</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Funcionalidades específicas para profissionais médicos no sistema.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Cadastro de médicos com especialidade (clínico geral, dentista, veterinário)</li>
                      <li>Filiação múltipla a organizações</li>
                      <li>Gerenciamento de agenda e disponibilidade</li>
                      <li>Dashboard específico para atividade médica</li>
                      <li>Criação e gestão de prescrições</li>
                      <li>Histórico de atendimentos e pacientes</li>
                      <li>Documentação médica e prontuários</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-reports">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      <span>Módulo de Relatórios</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Sistema abrangente de relatórios e análises para tomada de decisão.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Relatórios de vendas mensais por módulo/plano</li>
                      <li>Estatísticas de uso do sistema</li>
                      <li>Métricas de desempenho médico</li>
                      <li>Análise de prescrições e tendências</li>
                      <li>Relatórios financeiros e faturamento</li>
                      <li>Exportação em vários formatos (PDF, Excel, CSV)</li>
                      <li>Relatórios personalizados e dashboards analíticos</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-fiscal">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Módulo Fiscal</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Sistema avançado para gestão completa de documentos fiscais, integrado com hardware específico para farmácias e clínicas.</p>
                    
                    <h4 className="font-medium mt-3 mb-1">Funcionalidades Principais:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Emissão de notas fiscais e cupons fiscais</li>
                      <li>Integração nativa com impressoras fiscais Bematech, Epson, Daruma e Elgin</li>
                      <li>Configuração fiscal personalizada por organização</li>
                      <li>Emissão de documentos durante o checkout (integrado ao fluxo de vendas)</li>
                      <li>Abertura automatizada de gaveta de dinheiro</li>
                      <li>Histórico detalhado de documentos fiscais emitidos</li>
                      <li>Relatórios fiscais e de vendas em tempo real</li>
                      <li>Conformidade total com legislação fiscal brasileira (NFC-e, NF-e, Cupom Fiscal)</li>
                      <li>Gestão avançada de séries e numeração sequencial de documentos</li>
                    </ul>
                    
                    <h4 className="font-medium mt-3 mb-1">Interfaces Disponíveis:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Interface do Admin</strong> - Configuração centralizada para todas as organizações</li>
                      <li><strong>Interface do Farmacêutico</strong> - Gerenciamento fiscal específico da farmácia</li>
                      <li><strong>Componente de Checkout</strong> - Opções fiscais integradas ao processo de venda</li>
                    </ul>
                    
                    <h4 className="font-medium mt-3 mb-1">Tipos de Documentos Suportados:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Cupom Fiscal</strong> - Documento simplificado para vendas ao consumidor final</li>
                      <li><strong>NFC-e</strong> - Nota Fiscal de Consumidor Eletrônica</li>
                      <li><strong>NF-e</strong> - Nota Fiscal Eletrônica para operações entre empresas</li>
                      <li><strong>NFS-e</strong> - Nota Fiscal de Serviços Eletrônica para prestação de serviços</li>
                    </ul>
                    
                    <h4 className="font-medium mt-3 mb-1">Funcionalidades da Impressora Fiscal:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Abertura de gaveta de dinheiro automatizada</li>
                      <li>Impressão de relatórios fiscais (X, Z, Gerencial)</li>
                      <li>Leitura de Memória Fiscal (LMF)</li>
                      <li>Cancelamento de documentos</li>
                      <li>Suporte a múltiplos tipos de impostos (ICMS, PIS, COFINS, etc.)</li>
                      <li>Gestão de alíquotas de impostos</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-patient-portal">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Portal do Paciente</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Interface específica para acesso de pacientes ao sistema.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Visualização de prescrições aprovadas</li>
                      <li>Compra de produtos prescritos</li>
                      <li>Histórico médico pessoal</li>
                      <li>Agendamento de consultas</li>
                      <li>Comunicação com a equipe médica</li>
                      <li>Acesso a documentos e orientações</li>
                      <li>Gerenciamento de perfil e preferências</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-admin">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Módulo Administrativo</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Controle central de todo o sistema para administradores.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Gestão completa de usuários e permissões</li>
                      <li>Configurações globais do sistema</li>
                      <li>Gerenciamento de planos e módulos</li>
                      <li>Monitoramento de atividades e logs</li>
                      <li>Backup e restauração de dados</li>
                      <li>Atualizações do sistema</li>
                      <li>Suporte e resolução de problemas</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <h3 className="text-lg font-medium mt-6 mb-3 text-green-700 border-b border-green-100 pb-2">Módulos Add-on</h3>
                <p className="text-sm text-gray-600 mb-3">Módulos adicionais que podem ser contratados individualmente para expandir a funcionalidade do sistema.</p>
                
                <AccordionItem value="mod-tarefas">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      <span>Módulo de Tarefas</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Sistema de gerenciamento de tarefas e produtividade para equipes médicas.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Criação e atribuição de tarefas</li>
                      <li>Acompanhamento de progresso</li>
                      <li>Lembretes e notificações</li>
                      <li>Listas de verificação para procedimentos</li>
                      <li>Organização por projeto ou departamento</li>
                      <li>Integração com calendário</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-crm">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Módulo CRM</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Gestão de relacionamento com pacientes e clientes.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Histórico completo de interações</li>
                      <li>Segmentação de clientes</li>
                      <li>Campanhas de comunicação</li>
                      <li>Acompanhamento de leads e oportunidades</li>
                      <li>Análise de satisfação</li>
                      <li>Integração com canais de comunicação</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-social">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Módulo Social</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Gerenciamento de redes sociais e comunidade online.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Integração com plataformas sociais</li>
                      <li>Publicação e agendamento de conteúdo</li>
                      <li>Monitoramento de menções e interações</li>
                      <li>Análise de engajamento</li>
                      <li>Gestão de comunidade de pacientes</li>
                      <li>Campanhas de conscientização</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-rh">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Módulo RH</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Gerenciamento completo de recursos humanos para organizações de saúde.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Gestão de colaboradores e escalas</li>
                      <li>Controle de férias e licenças</li>
                      <li>Avaliações de desempenho</li>
                      <li>Treinamentos e certificações</li>
                      <li>Folha de pagamento</li>
                      <li>Recrutamento e seleção</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-juridico">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      <span>Módulo Jurídico</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Suporte para questões legais e regulatórias específicas para o setor de saúde.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Gestão de contratos e termos</li>
                      <li>Conformidade regulatória (ANVISA, LGPD)</li>
                      <li>Gerenciamento de processos jurídicos</li>
                      <li>Documentação legal e regulatória</li>
                      <li>Avisos e atualizações legais</li>
                      <li>Gestão de propriedade intelectual</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-transparencia">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Módulo Transparência</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Ferramentas para implementação de políticas de transparência e governança.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Relatórios públicos de atividades</li>
                      <li>Portal de transparência para stakeholders</li>
                      <li>Rastreabilidade de processos</li>
                      <li>Divulgação de informações regulatórias</li>
                      <li>Gestão de auditorias e conformidade</li>
                      <li>Indicadores de governança corporativa</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-ia">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span>Módulo de Inteligência Artificial</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Recursos avançados de IA para auxiliar na tomada de decisões médicas e administrativas.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Assistente virtual para profissionais</li>
                      <li>Análise preditiva de dados de pacientes</li>
                      <li>Sugestões personalizadas de tratamento</li>
                      <li>Otimização de processos clínicos</li>
                      <li>Reconhecimento e análise de imagens médicas</li>
                      <li>Detecção precoce de condições médicas</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-compras">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Módulo de Compras</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Sistema completo para gerenciamento de compras e aquisições.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Gestão de fornecedores</li>
                      <li>Requisições e ordens de compra</li>
                      <li>Cotações e análise de propostas</li>
                      <li>Aprovações e fluxo de trabalho</li>
                      <li>Recebimento e controle de qualidade</li>
                      <li>Relatórios de performance de compras</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-dispensario">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Módulo de Dispensário</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Gerenciamento do dispensário de medicamentos e produtos medicinais.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Controle de dispensação de medicamentos</li>
                      <li>Rastreabilidade de produtos dispensados</li>
                      <li>Integração com prescrições médicas</li>
                      <li>Controle de estoque específico</li>
                      <li>Alertas de interações medicamentosas</li>
                      <li>Gestão de lotes e validades</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-patrimonio">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Módulo de Patrimônio</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Controle de ativos e patrimônio da organização de saúde.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Cadastro e classificação de ativos</li>
                      <li>Controle de depreciação</li>
                      <li>Manutenções preventivas e corretivas</li>
                      <li>Gestão da vida útil dos equipamentos</li>
                      <li>Inventário e movimentação</li>
                      <li>Controle de garantias e seguros</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-comunicacao">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Módulo de Comunicação</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Sistema integrado de comunicação entre profissionais, pacientes e organizações.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Chat interno para equipes</li>
                      <li>Mensagens seguras com pacientes</li>
                      <li>Notificações e alertas</li>
                      <li>Videoconferências para telemedicina</li>
                      <li>Compartilhamento seguro de documentos</li>
                      <li>Integração com e-mail e SMS</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-pesquisa">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <Microscope className="h-4 w-4" />
                      <span>Módulo de Pesquisa Científica</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Ferramentas para condução e gestão de pesquisas clínicas e científicas.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Gestão de projetos de pesquisa</li>
                      <li>Coleta e análise de dados</li>
                      <li>Ferramentas estatísticas</li>
                      <li>Conformidade com requisitos éticos</li>
                      <li>Gestão de publicações e propriedade intelectual</li>
                      <li>Colaboração com instituições de pesquisa</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mod-educacao-paciente">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Módulo de Educação do Paciente</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 px-4">
                    <p>Plataforma educacional para informar e capacitar pacientes sobre tratamentos e condições.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Biblioteca de conteúdo educativo</li>
                      <li>Cursos e tutoriais interativos</li>
                      <li>Vídeos e infográficos explicativos</li>
                      <li>Material personalizado por condição</li>
                      <li>Feedback e avaliação de compreensão</li>
                      <li>Grupos de apoio e fóruns de discussão</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid grid-cols-5 mb-6 bg-green-100">
            <TabsTrigger value="admin" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Administração</TabsTrigger>
            <TabsTrigger value="doctor" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Portal do Médico</TabsTrigger>
            <TabsTrigger value="patient" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Portal do Paciente</TabsTrigger>
            <TabsTrigger value="laboratory" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Portal do Laboratório</TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">APIs e Integrações</TabsTrigger>
          </TabsList>

          {/* Seção de Administração */}
          <TabsContent value="admin" className="space-y-6">
            <Card className="shadow-md border-green-100">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <span>Painel de Administração</span>
                </CardTitle>
                <CardDescription>Controle central para gerenciar todo o sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2 text-green-700">Dashboard e Relatórios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <div className="flex items-center mb-2">
                        <Home className="h-4 w-4 mr-2 text-green-500" />
                        <Button 
                          variant="link" 
                          className="text-green-600 hover:underline p-0 h-auto font-normal"
                          onClick={() => window.location.href = "/admin"}
                        >
                          Dashboard Principal
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Visão geral do sistema com métricas principais</p>
                    </div>
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <div className="flex items-center mb-2">
                        <LineChart className="h-4 w-4 mr-2 text-green-500" />
                        <Button 
                          variant="link" 
                          className="text-green-600 hover:underline p-0 h-auto font-normal"
                          onClick={() => window.location.href = "/admin/reports"}
                        >
                          Relatórios
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Relatórios detalhados e análises</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seção do Portal do Médico */}
          <TabsContent value="doctor" className="space-y-6">
            <Card className="shadow-md border-green-100">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <User className="h-5 w-5 text-green-600" />
                  <span>Portal do Médico</span>
                </CardTitle>
                <CardDescription>Ambiente para gerenciamento de pacientes e prescrições</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2 text-green-700">Navegação Principal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <div className="flex items-center mb-2">
                        <Home className="h-4 w-4 mr-2 text-green-500" />
                        <Button 
                          variant="link" 
                          className="text-green-600 hover:underline p-0 h-auto font-normal"
                          onClick={() => window.location.href = "/doctor"}
                        >
                          Dashboard
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Visão geral da atividade médica e métricas</p>
                    </div>
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <div className="flex items-center mb-2">
                        <Users className="h-4 w-4 mr-2 text-green-500" />
                        <Button 
                          variant="link" 
                          className="text-green-600 hover:underline p-0 h-auto font-normal"
                          onClick={() => window.location.href = "/doctor/pacientes"}
                        >
                          Pacientes
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Gerenciamento de pacientes da organização</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seção do Portal do Paciente */}
          <TabsContent value="patient" className="space-y-6">
            <Card className="shadow-md border-green-100">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <User className="h-5 w-5 text-green-600" />
                  <span>Portal do Paciente</span>
                </CardTitle>
                <CardDescription>Acesso a informações médicas e prescrições</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2 text-green-700">Navegação Principal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <div className="flex items-center mb-2">
                        <Home className="h-4 w-4 mr-2 text-green-500" />
                        <Button 
                          variant="link" 
                          className="text-green-600 hover:underline p-0 h-auto font-normal"
                          onClick={() => window.location.href = "/patient"}
                        >
                          Dashboard
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Página inicial do paciente</p>
                    </div>
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <div className="flex items-center mb-2">
                        <Pill className="h-4 w-4 mr-2 text-green-500" />
                        <Button 
                          variant="link" 
                          className="text-green-600 hover:underline p-0 h-auto font-normal"
                          onClick={() => window.location.href = "/patient/prescricoes"}
                        >
                          Minhas Prescrições
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Visualizar prescrições médicas aprovadas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seção de APIs e Integrações */}
          <TabsContent value="api" className="space-y-6">
            <Card className="shadow-md border-green-100">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <ExternalLink className="h-5 w-5 text-green-600" />
                  <span>APIs e Integrações</span>
                </CardTitle>
                <CardDescription>Interfaces de programação e integração com o sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2 text-green-700">Endpoints Principais</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <p className="font-medium text-green-600">/api/auth</p>
                      <p className="text-xs text-gray-500 ml-2 mt-1">Endpoints para autenticação e autorização</p>
                    </div>
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <p className="font-medium text-green-600">/api/organizations</p>
                      <p className="text-xs text-gray-500 ml-2 mt-1">Endpoints para gerenciamento de organizações</p>
                    </div>
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <p className="font-medium text-green-600">/api/patients</p>
                      <p className="text-xs text-gray-500 ml-2 mt-1">Endpoints para gerenciamento de pacientes</p>
                    </div>
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <p className="font-medium text-green-600">/api/prescriptions</p>
                      <p className="text-xs text-gray-500 ml-2 mt-1">Endpoints para gerenciamento de prescrições</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mb-8 shadow-lg border-green-100">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-green-600" />
              Índice Completo de Links
            </CardTitle>
            <CardDescription>Lista completa de todos os links do sistema para fácil acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Seção de Login e Registro */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Login e Registro</h3>
                <ul className="space-y-2">
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/login"}
                    >
                      <User className="h-3.5 w-3.5" /> Login Principal
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/patient-login"}
                    >
                      <User className="h-3.5 w-3.5" /> Login de Pacientes
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/forgot-password"}
                    >
                      <Key className="h-3.5 w-3.5" /> Recuperação de Senha
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/organization-registration"}
                    >
                      <Building className="h-3.5 w-3.5" /> Cadastro de Organização
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/cadastrodemedicos"}
                    >
                      <Stethoscope className="h-3.5 w-3.5" /> Cadastro de Médicos
                    </Button>
                  </li>
                </ul>
              </div>

              {/* Seção de Admin */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Área Administrativa</h3>
                <ul className="space-y-2">
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/admin"}
                    >
                      <Home className="h-3.5 w-3.5" /> Dashboard Admin
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/admin/organizations"}
                    >
                      <Building className="h-3.5 w-3.5" /> Organizações
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/admin/doctors"}
                    >
                      <Stethoscope className="h-3.5 w-3.5" /> Médicos
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/admin/patients"}
                    >
                      <Users className="h-3.5 w-3.5" /> Pacientes
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/admin/plans"}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" /> Planos e Módulos
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/admin/reports"}
                    >
                      <LineChart className="h-3.5 w-3.5" /> Relatórios
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/admin/settings"}
                    >
                      <Settings className="h-3.5 w-3.5" /> Configurações
                    </Button>
                  </li>
                </ul>
              </div>

              {/* Seção de Médico */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Área do Médico</h3>
                <ul className="space-y-2">
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/doctor"}
                    >
                      <Home className="h-3.5 w-3.5" /> Dashboard Médico
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/doctor/pacientes"}
                    >
                      <Users className="h-3.5 w-3.5" /> Pacientes
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/doctor/prescricoes"}
                    >
                      <FileText className="h-3.5 w-3.5" /> Prescrições
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/doctor/configuracoes"}
                    >
                      <Settings className="h-3.5 w-3.5" /> Configurações
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/doctor/afiliacoes"}
                    >
                      <Building className="h-3.5 w-3.5" /> Minhas Organizações
                    </Button>
                  </li>
                </ul>
              </div>

              {/* Seção de Paciente */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Área do Paciente</h3>
                <ul className="space-y-2">
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/patient"}
                    >
                      <Home className="h-3.5 w-3.5" /> Dashboard Paciente
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/patient/prescricoes"}
                    >
                      <FileText className="h-3.5 w-3.5" /> Minhas Prescrições
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/patient/historico"}
                    >
                      <Clock className="h-3.5 w-3.5" /> Histórico Médico
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/patient/perfil"}
                    >
                      <User className="h-3.5 w-3.5" /> Meu Perfil
                    </Button>
                  </li>
                </ul>
              </div>

              {/* Seção de Farmácia */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Área da Farmácia</h3>
                <ul className="space-y-2">
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/pharmacy"}
                    >
                      <Home className="h-3.5 w-3.5" /> Dashboard Farmácia
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/pharmacy/prescricoes"}
                    >
                      <FileText className="h-3.5 w-3.5" /> Aprovar Prescrições
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/pharmacy/products"}
                    >
                      <Pill className="h-3.5 w-3.5" /> Produtos
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/pharmacy/reports"}
                    >
                      <LineChart className="h-3.5 w-3.5" /> Relatórios
                    </Button>
                  </li>
                </ul>
              </div>

              {/* Outros Links */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Outros Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/sitemap"}
                    >
                      <MapPin className="h-3.5 w-3.5" /> Sitemap
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/terms"}
                    >
                      <FileText className="h-3.5 w-3.5" /> Termos de Uso
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/privacy"}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Política de Privacidade
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/help"}
                    >
                      <HelpCircle className="h-3.5 w-3.5" /> Ajuda e Suporte
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-green-600 hover:underline flex items-center gap-1 p-0 h-auto font-normal"
                      onClick={() => window.location.href = "/contact"}
                    >
                      <Mail className="h-3.5 w-3.5" /> Contato
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-gray-500 text-sm space-y-1">
          <p>
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p>
            © {new Date().getFullYear()} Endurancy • Plataforma de Gestão Médica
          </p>
          <p className="text-xs mt-1">
            Este sitemap e a documentação são atualizados regularmente a cada alteração na plataforma
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;