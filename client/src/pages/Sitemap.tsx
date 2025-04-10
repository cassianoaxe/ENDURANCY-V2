import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, LinkIcon, Grid, Users, Clipboard, Home, LineChart, Settings, User, Building, FileText, ShieldCheck, Pill } from 'lucide-react';

const Sitemap = () => {
  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Sitemap do Endurancy</h1>
      <p className="text-gray-500 mb-6">Mapa completo de todas as páginas e rotas do sistema</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Navegação e Acesso ao Sistema</CardTitle>
          <CardDescription>Informações importantes sobre como navegar e acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Acesso a Organizações</h3>
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
            <h3 className="text-lg font-medium mb-2">Estrutura de IDs e Navegação</h3>
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

      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="admin">Administração</TabsTrigger>
          <TabsTrigger value="doctor">Portal do Médico</TabsTrigger>
          <TabsTrigger value="patient">Portal do Paciente</TabsTrigger>
          <TabsTrigger value="api">APIs e Integrações</TabsTrigger>
        </TabsList>

        {/* Seção de Administração */}
        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <span>Painel de Administração</span>
              </CardTitle>
              <CardDescription>Controle central para gerenciar todo o sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">Dashboard e Relatórios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Home className="h-4 w-4 mr-2 text-blue-500" />
                      <Link href="/admin" className="text-blue-600 hover:underline">
                        Dashboard Principal
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Visão geral do sistema com métricas principais</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LineChart className="h-4 w-4 mr-2 text-blue-500" />
                      <Link href="/admin/reports" className="text-blue-600 hover:underline">
                        Relatórios
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Relatórios detalhados e análises</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">Gerenciamento de Usuários</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      <Link href="/admin/users" className="text-blue-600 hover:underline">
                        Usuários
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gerenciar todos os usuários do sistema</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-blue-500" />
                      <Link href="/admin/doctors" className="text-blue-600 hover:underline">
                        Médicos
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gerenciar médicos por categoria (clínicos, dentistas, veterinários)</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">Organizações e Planos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Building className="h-4 w-4 mr-2 text-blue-500" />
                      <Link href="/admin/organizations" className="text-blue-600 hover:underline">
                        Organizações
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gerenciar todas as organizações do sistema</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Grid className="h-4 w-4 mr-2 text-blue-500" />
                      <Link href="/admin/plans" className="text-blue-600 hover:underline">
                        Planos e Subscrições
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gerenciar planos e subscrições (Free, Seed, Grow, Pro, Enterprise)</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">Links para Onboarding</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-gray-700">/cadastrodemedicos?organizationId=:id</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Link para cadastro de médicos em uma organização específica</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-gray-700">/org/:organizationId/login</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Link de acesso direto ao login de uma organização</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seção do Portal do Médico */}
        <TabsContent value="doctor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Portal do Médico</span>
              </CardTitle>
              <CardDescription>Ambiente para gerenciamento de pacientes e prescrições</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">Navegação Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Home className="h-4 w-4 mr-2 text-green-500" />
                      <Link href="/doctor" className="text-green-600 hover:underline">
                        Dashboard
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Visão geral da atividade médica e métricas</p>
                  </div>
                  <div className="p-3 border rounded-md">
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

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">Prescrições e Documentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Clipboard className="h-4 w-4 mr-2 text-green-500" />
                      <Link href="/doctor/prescricoes" className="text-green-600 hover:underline">
                        Prescrições
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gerenciar prescrições médicas de produtos</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2 text-green-500" />
                      <Link href="/doctor/prontuarios" className="text-green-600 hover:underline">
                        Prontuários
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Acesso aos prontuários médicos dos pacientes</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">Configurações e Afiliações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Building className="h-4 w-4 mr-2 text-green-500" />
                      <Link href="/doctor/afiliacao" className="text-green-600 hover:underline">
                        Afiliação
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gerenciar organizações afiliadas</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Settings className="h-4 w-4 mr-2 text-green-500" />
                      <Link href="/doctor/configuracoes" className="text-green-600 hover:underline">
                        Configurações
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Configurações pessoais e preferências</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">URLs de Acesso</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-gray-700">/doctor?organizationId=:id</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Acesso direto ao portal médico com organização específica</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seção do Portal do Paciente */}
        <TabsContent value="patient" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Portal do Paciente</span>
              </CardTitle>
              <CardDescription>Acesso a informações médicas e prescrições</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">Navegação Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Home className="h-4 w-4 mr-2 text-purple-500" />
                      <Link href="/patient" className="text-purple-600 hover:underline">
                        Dashboard
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Página inicial do paciente</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Pill className="h-4 w-4 mr-2 text-purple-500" />
                      <Link href="/patient/prescricoes" className="text-purple-600 hover:underline">
                        Minhas Prescrições
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Visualizar prescrições médicas aprovadas</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">Perfil e Histórico Médico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-purple-500" />
                      <Link href="/patient/perfil" className="text-purple-600 hover:underline">
                        Meu Perfil
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gerenciar informações pessoais</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                      <Link href="/patient/historico" className="text-purple-600 hover:underline">
                        Histórico Médico
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Visualizar histórico de atendimentos</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">URLs de Acesso</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-gray-700">/patient/login?organizationId=:id</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Login direto ao portal do paciente em uma organização</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seção de APIs e Integrações */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                <span>APIs e Integrações</span>
              </CardTitle>
              <CardDescription>Endpoints de API e integrações disponíveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">APIs Públicas</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">/api/auth/login</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Endpoint de autenticação para obter token de acesso</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">APIs Administrativas</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">/api/admin/users</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gestão de usuários do sistema</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">/api/admin/organizations</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gestão de organizações</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">/api/admin/reports</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Relatórios do sistema</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">APIs para Médicos</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">/api/doctor/organizations</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Organizações afiliadas ao médico</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">/api/doctor/prescriptions</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Gerenciamento de prescrições médicas</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">/api/patients</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Acesso aos pacientes da organização</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">APIs para Pacientes</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">/api/patient/prescriptions</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Prescrições aprovadas para o paciente</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center mb-2">
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">/api/patient/profile</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">Perfil do paciente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Referência Rápida de URLs</CardTitle>
          <CardDescription>Lista completa de URLs disponíveis no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Acessos Principais</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/ </span>
                  <span>Página inicial</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/login </span>
                  <span>Login para todos os tipos de usuários</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/org/:id </span>
                  <span>Acesso direto a uma organização</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/cadastrodemedicos </span>
                  <span>Cadastro de médicos via link</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Portal do Médico</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/doctor </span>
                  <span>Dashboard do médico</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/doctor/pacientes </span>
                  <span>Gerenciamento de pacientes</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/doctor/prescricoes </span>
                  <span>Prescrições médicas</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/doctor/prontuarios </span>
                  <span>Prontuários médicos</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/doctor/afiliacao </span>
                  <span>Organizações afiliadas</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/doctor/configuracoes </span>
                  <span>Configurações da conta</span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Administração</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/admin </span>
                  <span>Dashboard administrativo</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/admin/users </span>
                  <span>Gerenciamento de usuários</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/admin/doctors </span>
                  <span>Gerenciamento de médicos</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/admin/organizations </span>
                  <span>Gerenciamento de organizações</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/admin/plans </span>
                  <span>Gerenciamento de planos</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/admin/reports </span>
                  <span>Relatórios do sistema</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Portal do Paciente</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/patient </span>
                  <span>Dashboard do paciente</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/patient/prescricoes </span>
                  <span>Prescrições aprovadas</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/patient/perfil </span>
                  <span>Perfil do paciente</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-500 w-28">/patient/historico </span>
                  <span>Histórico médico</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Hierarquia de Planos e Módulos</CardTitle>
          <CardDescription>Organização dos planos e seus módulos correspondentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-left">Plano</th>
                  <th className="p-2 border text-left">Nível</th>
                  <th className="p-2 border text-left">Módulos Incluídos</th>
                  <th className="p-2 border text-left">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-medium">Enterprise</td>
                  <td className="p-2 border">5</td>
                  <td className="p-2 border">Todos os módulos + Customizações</td>
                  <td className="p-2 border">Solução completa com suporte dedicado e personalizações</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Pro / Professional</td>
                  <td className="p-2 border">4</td>
                  <td className="p-2 border">Básico + Grow + Análises avançadas + Integrações</td>
                  <td className="p-2 border">Para organizações médicas estabelecidas com necessidades avançadas</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Grow</td>
                  <td className="p-2 border">3</td>
                  <td className="p-2 border">Básico + Seed + Gerenciamento avançado</td>
                  <td className="p-2 border">Para organizações em crescimento com múltiplos médicos</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Seed</td>
                  <td className="p-2 border">2</td>
                  <td className="p-2 border">Básico + Recursos adicionais</td>
                  <td className="p-2 border">Para médicos individuais ou pequenas práticas</td>
                </tr>
                <tr>
                  <td className="p-2 border font-medium">Free / Básico</td>
                  <td className="p-2 border">1</td>
                  <td className="p-2 border">Funcionalidades essenciais</td>
                  <td className="p-2 border">Versão gratuita com recursos limitados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sitemap;