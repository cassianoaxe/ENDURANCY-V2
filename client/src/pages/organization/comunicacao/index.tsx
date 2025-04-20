import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  BellRing,
  Send,
  Calendar,
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  CalendarDays,
  Bell,
  ShieldCheck
} from "lucide-react";

export default function ComunicacaoDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mensagens recentes simuladas (em uma implementação real, viriam da API)
  const recentMessages = [
    {
      id: 1,
      title: "Novo protocolo aprovado",
      sender: "Sistema",
      date: "Hoje, 10:30",
      read: false,
      priority: "alta"
    },
    {
      id: 2,
      title: "Reunião de equipe",
      sender: "Maria Silva",
      date: "Ontem, 14:45",
      read: true,
      priority: "média"
    },
    {
      id: 3,
      title: "Atualização do sistema",
      sender: "Suporte",
      date: "12/04/2025",
      read: true,
      priority: "baixa"
    },
    {
      id: 4,
      title: "Novos documentos disponíveis",
      sender: "Departamento Jurídico",
      date: "11/04/2025",
      read: false,
      priority: "média"
    }
  ];

  // Campanhas de email recentes
  const recentCampaigns = [
    {
      id: 1,
      title: "Comunicado - Novos Produtos",
      status: "enviada",
      sentDate: "15/04/2025",
      opens: 245,
      clicks: 78
    },
    {
      id: 2,
      title: "Newsletter Mensal - Abril 2025",
      status: "enviada",
      sentDate: "05/04/2025",
      opens: 198,
      clicks: 56
    },
    {
      id: 3,
      title: "Pesquisa de Satisfação",
      status: "rascunho",
      sentDate: "-",
      opens: 0,
      clicks: 0
    }
  ];

  // Eventos do calendário próximos
  const upcomingEvents = [
    {
      id: 1,
      title: "Reunião de Estratégia",
      date: "21/04/2025",
      time: "14:00 - 15:30",
      participants: 5
    },
    {
      id: 2,
      title: "Treinamento de Equipe",
      date: "23/04/2025",
      time: "09:00 - 12:00",
      participants: 12
    },
    {
      id: 3,
      title: "Apresentação de Resultados",
      date: "30/04/2025",
      time: "16:00 - 17:00",
      participants: 8
    }
  ];

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Comunicação</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as comunicações da sua organização em um só lugar
            </p>
          </div>
          <Button className="gap-2">
            <MessageCircle size={16} />
            Nova Mensagem
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span>Mensagens</span>
              </CardTitle>
              <CardDescription>Mensagens e notificações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-3xl font-bold">24</div>
                  <div className="text-xs text-muted-foreground">Mensagens hoje</div>
                </div>
                <div className="text-right">
                  <div className="flex gap-2 items-center justify-end">
                    <Badge variant="destructive">2</Badge>
                    <span className="text-sm">Não lidas</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">8 de alta prioridade</div>
                </div>
              </div>
              <Button className="w-full" variant="outline">Ver Todas as Mensagens</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                <span>Campanhas</span>
              </CardTitle>
              <CardDescription>Campanhas de email e marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-3xl font-bold">5</div>
                  <div className="text-xs text-muted-foreground">Campanhas ativas</div>
                </div>
                <div className="text-right">
                  <div className="flex gap-2 items-center justify-end">
                    <span className="text-sm font-medium">28.4%</span>
                    <Badge variant="outline" className="bg-green-50">
                      <span className="text-green-600">taxa de abertura</span>
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">3 campanhas este mês</div>
                </div>
              </div>
              <Button className="w-full" variant="outline">Gerenciar Campanhas</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Agenda</span>
              </CardTitle>
              <CardDescription>Eventos e compromissos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-3xl font-bold">7</div>
                  <div className="text-xs text-muted-foreground">Eventos próximos</div>
                </div>
                <div className="text-right">
                  <div className="flex gap-2 items-center justify-end">
                    <Badge>Hoje</Badge>
                    <span className="text-sm">2 eventos</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">5 esta semana</div>
                </div>
              </div>
              <Button className="w-full" variant="outline">Ver Calendário</Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Mensagens</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Campanhas</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Arquivos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens Recentes</CardTitle>
                <CardDescription>
                  Visualize suas mensagens mais recentes e notificações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 mb-2 rounded-md border flex items-start justify-between ${
                        !message.read ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{message.title}</h4>
                          {!message.read && (
                            <Badge variant="secondary" className="text-xs">Nova</Badge>
                          )}
                          {message.priority === "alta" && (
                            <Badge variant="destructive" className="text-xs">Urgente</Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <span className="mr-2">De: {message.sender}</span>
                          <Clock size={12} className="mr-1" />
                          <span>{message.date}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
                <div className="mt-4 flex justify-end">
                  <Button>Ver todas as mensagens</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas de Email Recentes</CardTitle>
                <CardDescription>
                  Visualize o desempenho das suas campanhas de email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {recentCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-3 mb-2 rounded-md border flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{campaign.title}</h4>
                          {campaign.status === "enviada" ? (
                            <Badge variant="success" className="bg-green-100 text-green-800">Enviada</Badge>
                          ) : (
                            <Badge variant="secondary">Rascunho</Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <span className="mr-2">Data: {campaign.sentDate}</span>
                          {campaign.status === "enviada" && (
                            <>
                              <span className="ml-2 mr-2">Aberturas: {campaign.opens}</span>
                              <span>Cliques: {campaign.clicks}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
                <div className="mt-4 flex justify-end">
                  <Button>Gerenciar campanhas</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>
                  Visualize seus próximos eventos e reuniões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 mb-2 rounded-md border flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{event.title}</h4>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <CalendarDays size={12} className="mr-1" />
                          <span className="mr-2">{event.date}</span>
                          <Clock size={12} className="mr-1" />
                          <span className="mr-2">{event.time}</span>
                          <Users size={12} className="mr-1" />
                          <span>{event.participants} participantes</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
                <div className="mt-4 flex justify-end">
                  <Button>Ver calendário completo</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Arquivos e Mídias</CardTitle>
                <CardDescription>
                  Gerencie os arquivos e mídias da sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center flex-col">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Gerenciamento de Arquivos</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Faça upload e gerencie documentos, imagens, vídeos e outros arquivos importantes para sua organização.
                  </p>
                  <Button>Acessar Gerenciador de Arquivos</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Notificações</span>
              </CardTitle>
              <CardDescription>Configure suas preferências de notificação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Notificações por Email</div>
                    <div className="text-xs text-muted-foreground">Receba notificações por email</div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline" className="bg-green-50">
                      <span className="text-green-600">Ativado</span>
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Notificações no Sistema</div>
                    <div className="text-xs text-muted-foreground">Receba notificações no painel</div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline" className="bg-green-50">
                      <span className="text-green-600">Ativado</span>
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Notificações por SMS</div>
                    <div className="text-xs text-muted-foreground">Receba notificações por SMS</div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline" className="bg-red-50">
                      <span className="text-red-600">Desativado</span>
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Configurar Notificações</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>Credenciais</span>
              </CardTitle>
              <CardDescription>Gerencie as credenciais de comunicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">API de Email</div>
                    <div className="text-xs text-muted-foreground">Serviço de envio de emails</div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline" className="bg-green-50">
                      <span className="text-green-600">Configurado</span>
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">API de SMS</div>
                    <div className="text-xs text-muted-foreground">Serviço de envio de SMS</div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline" className="bg-red-50">
                      <span className="text-red-600">Não configurado</span>
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">API de WhatsApp</div>
                    <div className="text-xs text-muted-foreground">Serviço de mensagens WhatsApp</div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline" className="bg-green-50">
                      <span className="text-green-600">Configurado</span>
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Gerenciar Credenciais</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}