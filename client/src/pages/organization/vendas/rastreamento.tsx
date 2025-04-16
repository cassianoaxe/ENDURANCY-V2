import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
// Removido import para Tabs que não está mais sendo usado
import { 
  Search, 
  ExternalLink,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Dados de exemplo
const pedidosRastreamento = [
  {
    pedido: '#P12346',
    cliente: 'João Pereira',
    rastreio: 'BR987654321',
    destino: 'São Paulo, SP',
    status: 'Em Transporte',
    eventos: [
      { data: '21/07/2023 11:00', local: 'São Paulo, SP', descricao: 'Saiu para entrega' },
      { data: '21/07/2023 08:30', local: 'São Paulo, SP', descricao: 'Objeto em trânsito - por favor aguarde' },
      { data: '20/07/2023 14:40', local: 'Rio de Janeiro, RJ', descricao: 'Objeto postado' }
    ]
  }
];

// Função para obter a cor do status de rastreamento
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Entregue':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Em Transporte':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Com Problemas':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'Postado':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Função para obter o ícone do status de rastreamento
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Entregue':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'Em Transporte':
      return <Truck className="h-5 w-5 text-blue-500" />;
    case 'Com Problemas':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'Postado':
      return <Package className="h-5 w-5 text-yellow-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

export default function Rastreamento() {
  const [codigoRastreio, setCodigoRastreio] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(pedidosRastreamento[0]);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Use React Query para buscar os dados de rastreamento
  const { data: rastreamentoData, isLoading } = useQuery({
    queryKey: ['/api/vendas/rastreamento'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  const handleTrackOrder = () => {
    if (!codigoRastreio) {
      toast({
        title: "Código necessário",
        description: "Digite um código de rastreio para consultar",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Consultando rastreamento",
      description: `Buscando informações do rastreio ${codigoRastreio}`,
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Rastreamento de Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe o status dos seus envios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Card de Busca */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar Rastreamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tracking-code">Digite o código de rastreamento para encontrar um pedido específico</Label>
                <div className="flex gap-2">
                  <Input
                    id="tracking-code"
                    placeholder="Digite o código de rastreamento..."
                    value={codigoRastreio}
                    onChange={(e) => setCodigoRastreio(e.target.value)}
                  />
                  <Button onClick={handleTrackOrder}>Buscar</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 w-full">
                <Button 
                  variant={activeTab === "todos" ? "default" : "outline"} 
                  size="sm"
                  className="flex-1"
                  onClick={() => setActiveTab("todos")}>
                  Todos
                </Button>
                <Button 
                  variant={activeTab === "em-transporte" ? "default" : "outline"} 
                  size="sm"
                  className="flex-1"
                  onClick={() => setActiveTab("em-transporte")}>
                  Em Transporte
                </Button>
                <Button 
                  variant={activeTab === "entregues" ? "default" : "outline"} 
                  size="sm"
                  className="flex-1"
                  onClick={() => setActiveTab("entregues")}>
                  Entregues
                </Button>
                <Button 
                  variant={activeTab === "com-problemas" ? "default" : "outline"} 
                  size="sm"
                  className="flex-1"
                  onClick={() => setActiveTab("com-problemas")}>
                  Problemas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card de Pedidos */}
          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pedidosRastreamento.map((pedido, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors ${
                      selectedPedido?.pedido === pedido.pedido ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedPedido(pedido)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{pedido.pedido}</div>
                        <div className="text-sm text-muted-foreground">{pedido.cliente}</div>
                        <div className="text-sm mt-1">
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                            {pedido.rastreio}
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(pedido.status)}>
                        {pedido.status}
                      </Badge>
                    </div>
                    <div className="text-sm mt-2 flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" /> {pedido.destino}
                    </div>
                  </div>
                ))}
                {pedidosRastreamento.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhum pedido com rastreamento encontrado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Card de Detalhes do Rastreamento */}
          {selectedPedido ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Detalhes do Rastreamento</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Pedido {selectedPedido.pedido}</p>
                  </div>
                  <Badge className={getStatusColor(selectedPedido.status)}>
                    {selectedPedido.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Cliente</h3>
                    <p>{selectedPedido.cliente}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Código de Rastreio</h3>
                    <div className="flex items-center">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {selectedPedido.rastreio}
                      </code>
                      <Button variant="ghost" size="icon" className="ml-1" onClick={() => {
                        navigator.clipboard.writeText(selectedPedido.rastreio);
                        toast({
                          title: "Código copiado",
                          description: "O código de rastreio foi copiado para a área de transferência",
                        });
                      }}>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Destino</h3>
                    <p>{selectedPedido.destino}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Status</h3>
                    <div className="flex items-center">
                      {getStatusIcon(selectedPedido.status)}
                      <span className="ml-2">{selectedPedido.status}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Histórico de Rastreamento</h3>
                  <div className="space-y-4">
                    {selectedPedido.eventos.map((evento, index) => (
                      <div key={index} className="relative pl-6">
                        {index !== selectedPedido.eventos.length - 1 && (
                          <div className="absolute top-6 bottom-0 left-[0.625rem] w-0.5 bg-gray-200" />
                        )}
                        <div className="absolute top-1 left-0 w-3 h-3 rounded-full bg-primary" />
                        <div>
                          <div className="font-medium">{evento.data}</div>
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1 inline" /> {evento.local}
                          </div>
                          <div className="mt-1">{evento.descricao}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-sm font-medium mb-3">Notificações</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Notificações por email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba atualizações de status por email
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba atualizações de status por SMS
                        </p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Nenhum pedido selecionado</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Selecione um pedido da lista à esquerda ou digite um código de rastreio para ver os detalhes do rastreamento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}