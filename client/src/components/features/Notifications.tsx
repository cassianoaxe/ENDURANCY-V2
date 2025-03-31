import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export function Notifications() {
  const { toast } = useToast();

  // Obter notificações
  const { data: notifications = [], isLoading, error, refetch } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    keepPreviousData: true,
  });

  // Marcar como lida
  const markAsRead = async (id: number) => {
    try {
      await apiRequest("PUT", `/api/notifications/${id}/read`);
      refetch();
    } catch (error) {
      toast({
        title: "Erro ao marcar notificação",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await apiRequest("PUT", "/api/notifications/read-all");
      refetch();
      toast({
        title: "Notificações atualizadas",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar notificações",
        description: "Não foi possível marcar as notificações como lidas.",
        variant: "destructive",
      });
    }
  };

  // Obter ícone baseado no tipo de notificação
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">Erro ao carregar notificações</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Nenhuma notificação</h3>
        <p className="text-muted-foreground">
          Você não tem nenhuma notificação no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">
          {notifications.filter((n) => !n.isRead).length} não lidas
        </h3>
        <Button onClick={markAllAsRead} variant="ghost" size="sm">
          Marcar todas como lidas
        </Button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${
              !notification.isRead
                ? "bg-muted/30 border-muted-foreground/20"
                : "bg-background"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{notification.title}</h4>
                  {!notification.isRead && (
                    <Button
                      onClick={() => markAsRead(notification.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      Marcar como lida
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistance(new Date(notification.createdAt), new Date(), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                  {notification.link && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => {
                        window.location.href = notification.link!;
                      }}
                    >
                      Ver detalhes
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}