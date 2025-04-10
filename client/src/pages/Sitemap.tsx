import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, LinkIcon, Grid, Users, Clipboard, Home, LineChart, Settings, User, Building, FileText, ShieldCheck, Pill, Leaf } from 'lucide-react';

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

        <div className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Endurancy • Plataforma de Gestão Médica
        </div>
      </div>
    </div>
  );
};

export default Sitemap;