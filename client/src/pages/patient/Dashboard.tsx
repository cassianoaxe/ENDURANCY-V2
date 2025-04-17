'use client';

import React, { useState } from 'react';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, FileText, Package, MessageSquare, ShoppingBag, CalendarClock, Phone
} from 'lucide-react';
import { PatientQuickActions } from '@/components/dashboard/QuickActions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PatientDashboardPage() {
  const [activeTab, setActiveTab] = useState('visao-geral');
  
  // Função para navegação direta
  const navigateTo = (path: string) => {
    window.location.href = path;
  };
  
  // Handler para cliques nas tabs
  const handleTabClick = (tabValue: string) => {
    setActiveTab(tabValue);
    
    // Navegação direta para outras páginas
    if (tabValue === 'produtos') {
      navigateTo('/patient/produtos');
    } 
    else if (tabValue === 'meus-pedidos') {
      navigateTo('/patient/pedidos/rastreamento');
    }
    else if (tabValue === 'prescricoes') {
      navigateTo('/patient/prescricoes/nova');
    }
  };
  
  return (
    <PatientLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Olá, Paciente</h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo de volta ao seu portal de tratamento
            </p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => window.open('tel:08001234567')}
          >
            <Phone className="mr-2 h-4 w-4" /> Suporte 0800-123-4567
          </Button>
        </div>
        
        {/* Resumo do perfil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 - Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback>PA</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-lg">Nome do Paciente</p>
                  <p className="text-gray-500 text-sm">paciente@email.com</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Editar Perfil
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card 2 - Próxima Consulta */}
          <Card>
            <CardHeader>
              <CardTitle>Próxima Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/10 rounded-md p-3 flex items-center">
                <CalendarClock className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="font-medium">25/08/2023 - 14:30</p>
                  <p className="text-sm text-gray-600">Dr. Antônio Silva</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1">
                  Reagendar
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Confirmar
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Card 3 - Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Tratamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-emerald-600" />
                  <span>Próxima consulta em 15 dias</span>
                </div>
                <div className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-purple-600" />
                  <span>1 pedido(s) pendente(s)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                ATIVO
              </Badge>
            </CardFooter>
          </Card>
        </div>

        {/* Seção de ações rápidas */}
        <div className="mb-8">
          <PatientQuickActions onAction={() => {}} />
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md border">
            <TabsTrigger 
              value="visao-geral" 
              className="rounded-sm"
              onClick={() => handleTabClick('visao-geral')}
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="produtos" 
              className="rounded-sm"
              onClick={() => handleTabClick('produtos')}
            >
              Produtos
            </TabsTrigger>
            <TabsTrigger 
              value="meus-pedidos" 
              className="rounded-sm"
              onClick={() => handleTabClick('meus-pedidos')}
            >
              Meus Pedidos
            </TabsTrigger>
            <TabsTrigger 
              value="prescricoes" 
              className="rounded-sm"
              onClick={() => handleTabClick('prescricoes')}
            >
              Prescrições
            </TabsTrigger>
            <TabsTrigger 
              value="documentos" 
              className="rounded-sm"
              onClick={() => handleTabClick('documentos')}
            >
              Documentos
            </TabsTrigger>
            <TabsTrigger 
              value="mensagens" 
              className="rounded-sm"
              onClick={() => handleTabClick('mensagens')}
            >
              Mensagens
            </TabsTrigger>
          </TabsList>
          
          {/* Conteúdo da Aba Visão Geral */}
          <TabsContent value="visao-geral" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Tratamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Aqui você encontrará informações sobre seu tratamento atual, 
                    prescrições e histórico de pedidos. Clique nas abas acima para 
                    navegar ou use as ações rápidas.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Atualizações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Nova prescrição recebida</p>
                        <p className="text-sm text-gray-500">15/07/2023</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Pedido #1236 aprovado</p>
                        <p className="text-sm text-gray-500">16/07/2023</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Outras tabs redirecionarão, não precisam de conteúdo */}
          <TabsContent value="produtos" className="mt-4">
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium">Redirecionando para Produtos...</h3>
            </div>
          </TabsContent>
          
          <TabsContent value="meus-pedidos" className="mt-4">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium">Redirecionando para Pedidos...</h3>
            </div>
          </TabsContent>
          
          <TabsContent value="prescricoes" className="mt-4">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium">Redirecionando para Prescrições...</h3>
            </div>
          </TabsContent>
          
          <TabsContent value="documentos" className="mt-4">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium">Carregando Documentos...</h3>
            </div>
          </TabsContent>
          
          <TabsContent value="mensagens" className="mt-4">
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium">Carregando Mensagens...</h3>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}