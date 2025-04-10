import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ExternalLink, LinkIcon, Grid, Users, Clipboard, Home, LineChart, 
  Settings, User, Building, FileText, ShieldCheck, Pill, Leaf, 
  BookOpen, Database, Bell, HelpCircle, Clock,
  Key, Stethoscope, LayoutGrid, Mail, MapPin
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
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-green-100">
            <TabsTrigger value="admin" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Administração</TabsTrigger>
            <TabsTrigger value="doctor" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Portal do Médico</TabsTrigger>
            <TabsTrigger value="patient" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Portal do Paciente</TabsTrigger>
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
                        <Link href="/admin" className="text-green-600 hover:underline">
                          Dashboard Principal
                        </Link>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Visão geral do sistema com métricas principais</p>
                    </div>
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <div className="flex items-center mb-2">
                        <LineChart className="h-4 w-4 mr-2 text-green-500" />
                        <Link href="/admin/reports" className="text-green-600 hover:underline">
                          Relatórios
                        </Link>
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
                        <Link href="/doctor" className="text-green-600 hover:underline">
                          Dashboard
                        </Link>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Visão geral da atividade médica e métricas</p>
                    </div>
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <div className="flex items-center mb-2">
                        <Users className="h-4 w-4 mr-2 text-green-500" />
                        <Link href="/doctor/pacientes" className="text-green-600 hover:underline">
                          Pacientes
                        </Link>
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
                        <Link href="/patient" className="text-green-600 hover:underline">
                          Dashboard
                        </Link>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">Página inicial do paciente</p>
                    </div>
                    <div className="p-3 border border-green-100 rounded-md shadow-sm">
                      <div className="flex items-center mb-2">
                        <Pill className="h-4 w-4 mr-2 text-green-500" />
                        <Link href="/patient/prescricoes" className="text-green-600 hover:underline">
                          Minhas Prescrições
                        </Link>
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
                    <Link href="/login" className="text-green-600 hover:underline flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Login Principal
                    </Link>
                  </li>
                  <li>
                    <Link href="/patient-login" className="text-green-600 hover:underline flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Login de Pacientes
                    </Link>
                  </li>
                  <li>
                    <Link href="/forgot-password" className="text-green-600 hover:underline flex items-center gap-1">
                      <Key className="h-3.5 w-3.5" /> Recuperação de Senha
                    </Link>
                  </li>
                  <li>
                    <Link href="/organization-registration" className="text-green-600 hover:underline flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" /> Cadastro de Organização
                    </Link>
                  </li>
                  <li>
                    <Link href="/cadastrodemedicos" className="text-green-600 hover:underline flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" /> Cadastro de Médicos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Seção de Admin */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Área Administrativa</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/admin" className="text-green-600 hover:underline flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" /> Dashboard Admin
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/organizations" className="text-green-600 hover:underline flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" /> Organizações
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/doctors" className="text-green-600 hover:underline flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" /> Médicos
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/patients" className="text-green-600 hover:underline flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Pacientes
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/plans" className="text-green-600 hover:underline flex items-center gap-1">
                      <LayoutGrid className="h-3.5 w-3.5" /> Planos e Módulos
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/reports" className="text-green-600 hover:underline flex items-center gap-1">
                      <LineChart className="h-3.5 w-3.5" /> Relatórios
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/settings" className="text-green-600 hover:underline flex items-center gap-1">
                      <Settings className="h-3.5 w-3.5" /> Configurações
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Seção de Médico */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Área do Médico</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/doctor" className="text-green-600 hover:underline flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" /> Dashboard Médico
                    </Link>
                  </li>
                  <li>
                    <Link href="/doctor/pacientes" className="text-green-600 hover:underline flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Pacientes
                    </Link>
                  </li>
                  <li>
                    <Link href="/doctor/prescricoes" className="text-green-600 hover:underline flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Prescrições
                    </Link>
                  </li>
                  <li>
                    <Link href="/doctor/configuracoes" className="text-green-600 hover:underline flex items-center gap-1">
                      <Settings className="h-3.5 w-3.5" /> Configurações
                    </Link>
                  </li>
                  <li>
                    <Link href="/doctor/afiliacoes" className="text-green-600 hover:underline flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" /> Minhas Organizações
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Seção de Paciente */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Área do Paciente</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/patient" className="text-green-600 hover:underline flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" /> Dashboard Paciente
                    </Link>
                  </li>
                  <li>
                    <Link href="/patient/prescricoes" className="text-green-600 hover:underline flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Minhas Prescrições
                    </Link>
                  </li>
                  <li>
                    <Link href="/patient/historico" className="text-green-600 hover:underline flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Histórico Médico
                    </Link>
                  </li>
                  <li>
                    <Link href="/patient/perfil" className="text-green-600 hover:underline flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Meu Perfil
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Seção de Farmácia */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Área da Farmácia</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/pharmacy" className="text-green-600 hover:underline flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" /> Dashboard Farmácia
                    </Link>
                  </li>
                  <li>
                    <Link href="/pharmacy/prescricoes" className="text-green-600 hover:underline flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Aprovar Prescrições
                    </Link>
                  </li>
                  <li>
                    <Link href="/pharmacy/products" className="text-green-600 hover:underline flex items-center gap-1">
                      <Pill className="h-3.5 w-3.5" /> Produtos
                    </Link>
                  </li>
                  <li>
                    <Link href="/pharmacy/reports" className="text-green-600 hover:underline flex items-center gap-1">
                      <LineChart className="h-3.5 w-3.5" /> Relatórios
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Outros Links */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-700 border-b border-green-100 pb-2">Outros Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/sitemap" className="text-green-600 hover:underline flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Sitemap
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-green-600 hover:underline flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Termos de Uso
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-green-600 hover:underline flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Política de Privacidade
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="text-green-600 hover:underline flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" /> Ajuda e Suporte
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-green-600 hover:underline flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> Contato
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Endurancy • Plataforma de Gestão Médica
        </div>
      </div>
    </div>
  );
};

export default Sitemap;