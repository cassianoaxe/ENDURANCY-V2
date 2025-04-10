import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, LinkIcon, Grid, Users, Clipboard, Home, LineChart, Settings, User, Building, FileText, ShieldCheck, Pill, Leaf } from 'lucide-react';

// Logo SVG inline do Endurancy
const EndurancyLogo = () => (
  <svg width="180" height="40" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24.5 7.5C15.9 7.5 9 14.4 9 23C9 31.6 15.9 38.5 24.5 38.5C33.1 38.5 40 31.6 40 23C40 14.4 33.1 7.5 24.5 7.5ZM33.8 23.9H27.2V30.5H21.8V23.9H15.2V18.5H21.8V11.9H27.2V18.5H33.8V23.9Z" fill="#4CAF50"/>
    <path d="M52.2 15.3H47.7V29H44V15.3H39.5V12.1H52.2V15.3Z" fill="#333333"/>
    <path d="M65.5 29L64.9 26.8H64.8C64.1 27.7 63.4 28.3 62.7 28.7C61.9 29 61 29.2 59.9 29.2C58.5 29.2 57.4 28.8 56.6 28C55.8 27.2 55.4 26.1 55.4 24.7C55.4 23.2 55.9 22.1 57 21.3C58.1 20.5 59.7 20.1 61.9 20L64.6 19.9V19.3C64.6 18.3 64.4 17.6 64 17.2C63.6 16.7 63 16.5 62.1 16.5C61.4 16.5 60.7 16.6 60.1 16.8C59.5 17 58.9 17.2 58.3 17.5L57.2 15C58 14.6 58.9 14.3 59.8 14.1C60.7 13.9 61.6 13.8 62.4 13.8C64.3 13.8 65.7 14.2 66.6 15.1C67.5 16 68 17.4 68 19.3V29H65.5ZM61.1 26.5C62 26.5 62.8 26.2 63.4 25.7C64 25.1 64.3 24.3 64.3 23.3V22.1L62.4 22.2C61 22.3 60 22.5 59.4 22.9C58.8 23.3 58.5 23.9 58.5 24.6C58.5 25.2 58.7 25.6 59.1 25.9C59.5 26.3 60.2 26.5 61.1 26.5Z" fill="#333333"/>
    <path d="M80.5 29L79.9 26.8H79.8C79.1 27.7 78.4 28.3 77.7 28.7C76.9 29 76 29.2 74.9 29.2C73.5 29.2 72.4 28.8 71.6 28C70.8 27.2 70.4 26.1 70.4 24.7C70.4 23.2 70.9 22.1 72 21.3C73.1 20.5 74.7 20.1 76.9 20L79.6 19.9V19.3C79.6 18.3 79.4 17.6 79 17.2C78.6 16.7 78 16.5 77.1 16.5C76.4 16.5 75.7 16.6 75.1 16.8C74.5 17 73.9 17.2 73.3 17.5L72.2 15C73 14.6 73.9 14.3 74.8 14.1C75.7 13.9 76.6 13.8 77.4 13.8C79.3 13.8 80.7 14.2 81.6 15.1C82.5 16 83 17.4 83 19.3V29H80.5ZM76.1 26.5C77 26.5 77.8 26.2 78.4 25.7C79 25.1 79.3 24.3 79.3 23.3V22.1L77.4 22.2C76 22.3 75 22.5 74.4 22.9C73.8 23.3 73.5 23.9 73.5 24.6C73.5 25.2 73.7 25.6 74.1 25.9C74.5 26.3 75.2 26.5 76.1 26.5Z" fill="#333333"/>
    <path d="M92.9 29.2C91.8 29.2 90.8 29 89.9 28.7C89 28.3 88.2 27.8 87.6 27.1C87 26.4 86.5 25.5 86.2 24.5C85.9 23.5 85.8 22.3 85.8 21C85.8 19.7 86 18.5 86.3 17.5C86.6 16.5 87.1 15.6 87.8 14.9C88.4 14.2 89.2 13.7 90.1 13.3C91 12.9 92 12.7 93.1 12.7C93.9 12.7 94.6 12.8 95.3 12.9C96 13 96.7 13.2 97.4 13.6L96.4 16.5C95.9 16.2 95.4 16 94.9 15.9C94.4 15.8 93.9 15.7 93.3 15.7C91.9 15.7 90.9 16.2 90.2 17.1C89.5 18 89.2 19.3 89.2 21C89.2 22.7 89.5 24 90.2 24.9C90.9 25.8 91.8 26.2 93.1 26.2C93.9 26.2 94.6 26.1 95.3 25.9C96 25.7 96.6 25.5 97.2 25.2L98 28C97.3 28.4 96.5 28.7 95.7 28.9C94.9 29.1 93.9 29.2 92.9 29.2Z" fill="#333333"/>
    <path d="M107.1 29.2C105.1 29.2 103.4 28.5 102.3 27.2C101.1 25.9 100.5 24 100.5 21.6C100.5 19.1 101.1 17.2 102.3 15.9C103.5 14.6 105.2 13.9 107.3 13.9C107.9 13.9 108.5 14 109.1 14.1C109.7 14.2 110.1 14.4 110.5 14.5L109.7 17.5C109.3 17.4 108.9 17.2 108.4 17.1C108 17 107.6 17 107.3 17C104.9 17 103.7 18.5 103.7 21.6C103.7 23.1 104 24.2 104.6 24.9C105.2 25.7 106.1 26 107.2 26C108 26 108.9 25.8 109.9 25.5L110.7 28.2C110.2 28.5 109.7 28.7 109 28.9C108.3 29.1 107.7 29.2 107.1 29.2Z" fill="#333333"/>
    <path d="M125 29H121.6L118.1 22.8L116.2 24.3V29H112.9V12.1H116.2V21.1L118 18.8L122 14.1H125.4L120.3 19.7L125 29Z" fill="#333333"/>
    <path d="M138.5 29H126.9V26.6L133.8 17.2H127.3V14.1H138.2V16.6L131.3 25.9H138.5V29Z" fill="#333333"/>
  </svg>
);

const Sitemap = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center">
      <div className="container py-8 max-w-5xl mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <EndurancyLogo />
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold mb-2 text-green-800">Sitemap do Endurancy</h1>
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