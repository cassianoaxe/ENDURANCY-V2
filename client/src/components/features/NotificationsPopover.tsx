import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MessageSquare,
  CheckCheck,
  ArrowUpRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  ticketId?: number;
}

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar notificações da API
  const { data: notifications, isLoading } = useQuery<NotificationItem[]>({
    queryKey: ['/api/notifications'],
    // Fallback para desenvolvimento até que a API real esteja pronta
    placeholderData: [
      {
        id: 1,
        title: 'Novo ticket crítico',
        message: 'Um novo ticket com prioridade crítica foi criado pela Associação Canábica Medicinal.',
        type: 'warning',
        isRead: false,
        createdAt: new Date().toISOString(),
        ticketId: 7
      },
      {
        id: 2,
        title: 'Prazo de resposta excedido',
        message: 'O ticket #4 está aguardando resposta há mais de 24 horas.',
        type: 'error',
        isRead: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        ticketId: 4
      },
      {
        id: 3,
        title: 'Ticket resolvido',
        message: 'O ticket #5 foi marcado como resolvido.',
        type: 'success',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        ticketId: 5
      },
      {
        id: 4,
        title: 'Ticket de desenvolvimento atualizado',
        message: 'O ticket #8 de desenvolvimento recebeu um novo comentário.',
        type: 'info',
        isRead: false,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        ticketId: 8
      }
    ]
  });

  // Marcar notificação como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/notifications/${id}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao marcar notificação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", '/api/notifications/mark-all-read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Notificações marcadas como lidas",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao marcar notificações",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtrar notificações não lidas
  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];
  const hasUnread = unreadNotifications.length > 0;

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
  };

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} ${diffDay === 1 ? 'dia' : 'dias'} atrás`;
    } else if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'} atrás`;
    } else {
      return 'Agora';
    }
  };

  // Organizar as notificações por tipos para as abas
  const infoNotifications = notifications?.filter(n => n.type === 'info') || [];
  const warningNotifications = notifications?.filter(n => n.type === 'warning' || n.type === 'error') || [];
  const successNotifications = notifications?.filter(n => n.type === 'success') || [];

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label="Notificações"
        >
          {hasUnread ? (
            <>
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
                {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
              </Badge>
            </>
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="font-semibold">Notificações</h4>
          {hasUnread && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 px-4 py-2">
            <TabsTrigger value="all">
              Todas {hasUnread && <Badge className="ml-1">{unreadNotifications.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="info">
              Info {infoNotifications.filter(n => !n.isRead).length > 0 && 
                <Badge variant="outline" className="ml-1">{infoNotifications.filter(n => !n.isRead).length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="alert">
              Alertas {warningNotifications.filter(n => !n.isRead).length > 0 && 
                <Badge variant="outline" className="ml-1">{warningNotifications.filter(n => !n.isRead).length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="success">
              Sucesso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`px-4 py-3 flex items-start gap-3 ${!notification.isRead ? 'bg-muted/50' : ''}`}
                  >
                    <div className={`
                      h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${notification.type === 'info' ? 'bg-blue-100 text-blue-500' : 
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-500' : 
                        notification.type === 'success' ? 'bg-green-100 text-green-500' : 
                        'bg-red-100 text-red-500'}
                    `}>
                      {notification.type === 'info' ? <MessageSquare className="h-4 w-4" /> : 
                        notification.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : 
                        notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : 
                        <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex mt-2">
                        {notification.ticketId && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs" 
                            onClick={() => {
                              setIsOpen(false);
                              handleMarkAsRead(notification.id);
                              setLocation(`/tickets/${notification.ticketId}`);
                            }}
                          >
                            Ver ticket <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto h-6 text-xs" 
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação disponível</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="info" className="max-h-[400px] overflow-y-auto">
            {infoNotifications.length > 0 ? (
              <div className="divide-y">
                {infoNotifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`px-4 py-3 flex items-start gap-3 ${!notification.isRead ? 'bg-muted/50' : ''}`}
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex mt-2">
                        {notification.ticketId && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs" 
                            onClick={() => {
                              setIsOpen(false);
                              handleMarkAsRead(notification.id);
                              setLocation(`/tickets/${notification.ticketId}`);
                            }}
                          >
                            Ver ticket <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto h-6 text-xs" 
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação informativa</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="alert" className="max-h-[400px] overflow-y-auto">
            {warningNotifications.length > 0 ? (
              <div className="divide-y">
                {warningNotifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`px-4 py-3 flex items-start gap-3 ${!notification.isRead ? 'bg-muted/50' : ''}`}
                  >
                    <div className={`
                      h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-500' : 'bg-red-100 text-red-500'}
                    `}>
                      {notification.type === 'warning' ? 
                        <AlertTriangle className="h-4 w-4" /> : 
                        <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex mt-2">
                        {notification.ticketId && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs" 
                            onClick={() => {
                              setIsOpen(false);
                              handleMarkAsRead(notification.id);
                              setLocation(`/tickets/${notification.ticketId}`);
                            }}
                          >
                            Ver ticket <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto h-6 text-xs" 
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum alerta disponível</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="success" className="max-h-[400px] overflow-y-auto">
            {successNotifications.length > 0 ? (
              <div className="divide-y">
                {successNotifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`px-4 py-3 flex items-start gap-3 ${!notification.isRead ? 'bg-muted/50' : ''}`}
                  >
                    <div className="h-8 w-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex mt-2">
                        {notification.ticketId && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs" 
                            onClick={() => {
                              setIsOpen(false);
                              handleMarkAsRead(notification.id);
                              setLocation(`/tickets/${notification.ticketId}`);
                            }}
                          >
                            Ver ticket <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto h-6 text-xs" 
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação de sucesso</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-2 border-t">
          <Button 
            variant="link" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => {
              setIsOpen(false);
              setLocation('/suporte/notificacoes');
            }}
          >
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}