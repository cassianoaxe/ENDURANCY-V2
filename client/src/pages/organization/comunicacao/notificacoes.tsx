import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
// Removendo import do OrganizationLayout para evitar a renderização duplicada
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Settings,
  Filter,
  RefreshCw,
  ChevronRight,
  User,
  Trash,
  Search,
  MoreHorizontal
} from "lucide-react";

export default function NotificacoesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Estado para controlar as preferências de notificação
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // Lista de notificações (em uma implementação real, viriam da API)
  const notifications = [
    {
      id: 1,
      title: "Novo protocolo aprovado",
      message: "O protocolo #12345 foi aprovado e está pronto para implementação.",
      type: "success",
      time: "Hoje, 10:30",
      read: false,
      source: "sistema"
    },
    {
      id: 2,
      title: "Lembrete de reunião",
      message: "Reunião de equipe às 14:00 hoje na Sala de Conferências 2.",
      type: "info",
      time: "Hoje, 09:15",
      read: true,
      source: "calendar"
    },
    {
      id: 3,
      title: "Alerta de sistema",
      message: "Manutenção programada para hoje às 22:00. O sistema ficará indisponível por aproximadamente 30 minutos.",
      type: "warning",
      time: "Hoje, 08:45",
      read: true,
      source: "sistema"
    },
    {
      id: 4,
      title: "Nova mensagem de Maria Silva",
      message: "Precisamos discutir os resultados do último trimestre antes da apresentação de amanhã.",
      type: "message",
      time: "Ontem, 17:20",
      read: false,
      source: "message"
    },
    {
      id: 5,
      title: "Erro na sincronização de dados",
      message: "Ocorreu um erro ao sincronizar os dados do módulo financeiro. Verifique os logs para mais detalhes.",
      type: "error",
      time: "Ontem, 15:10",
      read: true,
      source: "sistema"
    },
    {
      id: 6,
      title: "Atualização do sistema disponível",
      message: "Uma nova versão do sistema (v2.5.1) está disponível. Clique para instalar a atualização.",
      type: "info",
      time: "12/04/2025, 11:30",
      read: true,
      source: "sistema"
    },
    {
      id: 7,
      title: "Novo usuário registrado",
      message: "O usuário Carlos Mendes (carlos.mendes@exemplo.com) se registrou no sistema.",
      type: "info",
      time: "11/04/2025, 14:45",
      read: true,
      source: "user"
    },
    {
      id: 8,
      title: "Transação aprovada",
      message: "A transação #78901 no valor de R$ 1.250,00 foi aprovada e processada com sucesso.",
      type: "success",
      time: "10/04/2025, 09:20",
      read: true,
      source: "financial"
    }
  ];

  // Função para filtrar notificações com base na aba ativa e termo de pesquisa
  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      // Filtrar por texto
      const matchesSearch = searchTerm === "" || 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrar por tipo (aba)
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "unread" && !notification.read) ||
        (activeTab === "system" && notification.source === "sistema") ||
        (activeTab === "messages" && notification.source === "message");
      
      return matchesSearch && matchesTab;
    });
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notificações</h1>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie suas notificações
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            <Button>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Todas as Notificações</CardTitle>
                    <CardDescription>
                      Visualize e gerencie suas notificações
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={unreadCount > 0 ? "destructive" : "outline"}>
                      {unreadCount} não lidas
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar notificações..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <Tabs 
                  defaultValue="all" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="space-y-4"
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="unread">Não Lidas</TabsTrigger>
                    <TabsTrigger value="system">Sistema</TabsTrigger>
                    <TabsTrigger value="messages">Mensagens</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="space-y-4">
                    <ScrollArea className="h-[500px]">
                      {filteredNotifications.length > 0 ? (
                        <div className="space-y-3">
                          {filteredNotifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-4 border rounded-lg flex items-start ${!notification.read ? 'bg-muted' : ''}`}
                            >
                              <div className="flex-shrink-0 mr-3 mt-1">
                                {notification.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                                {notification.type === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                                {notification.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                                {notification.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
                                {notification.type === "message" && <MessageSquare className="h-5 w-5 text-indigo-500" />}
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium">{notification.title}</h4>
                                  <div className="flex items-center">
                                    <span className="text-xs text-muted-foreground mr-2">{notification.time}</span>
                                    {!notification.read && (
                                      <Badge variant="secondary" className="h-2 w-2 rounded-full p-0"></Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8">
                          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Nenhuma notificação encontrada</h3>
                          <p className="text-muted-foreground text-center">
                            Não há notificações correspondentes aos filtros selecionados.
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="ghost" size="sm">Marcar todas como lidas</Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash className="h-4 w-4 mr-2" />
                  Limpar todas
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como deseja receber suas notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Canais de Notificação</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="email-notifications">Email</Label>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="sms-notifications">SMS</Label>
                      </div>
                      <Switch 
                        id="sms-notifications" 
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                      </div>
                      <Switch 
                        id="push-notifications" 
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="in-app-notifications">No Aplicativo</Label>
                      </div>
                      <Switch 
                        id="in-app-notifications" 
                        checked={inAppNotifications}
                        onCheckedChange={setInAppNotifications}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Tipos de Notificação</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="system-notifications">Sistema</Label>
                        <Switch id="system-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="message-notifications">Mensagens</Label>
                        <Switch id="message-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="calendar-notifications">Calendário</Label>
                        <Switch id="calendar-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="task-notifications">Tarefas</Label>
                        <Switch id="task-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="financial-notifications">Financeiro</Label>
                        <Switch id="financial-notifications" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Frequência</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="real-time-notifications">Tempo Real</Label>
                        <Switch id="real-time-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="daily-digest">Resumo Diário</Label>
                        <Switch id="daily-digest" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="weekly-digest">Resumo Semanal</Label>
                        <Switch id="weekly-digest" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Salvar Preferências</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
  );
}