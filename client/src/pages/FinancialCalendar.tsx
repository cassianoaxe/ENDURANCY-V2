"use client";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, FileText, Plus } from "lucide-react";

// Interface para eventos financeiros do calendário
interface FinancialEvent {
  id: number;
  title: string;
  date: Date;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  description: string;
}

// Função para formatar valores monetários
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função para retornar o badge de status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pendente':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
    case 'pago':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pago</Badge>;
    case 'atrasado':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Atrasado</Badge>;
    case 'cancelado':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelado</Badge>;
    case 'aprovada':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprovada</Badge>;
    case 'negada':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Negada</Badge>;
    case 'em_andamento':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Em andamento</Badge>;
    case 'concluída':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Concluída</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function FinancialCalendar() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<FinancialEvent[]>([
    {
      id: 1,
      title: 'Pagamento de Aluguel',
      date: new Date(2025, 2, 5), // 5 de março de 2025
      amount: 12500,
      type: 'despesa',
      category: 'Aluguel',
      status: 'pago',
      description: 'Aluguel mensal do escritório'
    },
    {
      id: 2,
      title: 'Fatura de Serviços',
      date: new Date(2025, 2, 15), // 15 de março de 2025
      amount: 35750,
      type: 'receita',
      category: 'Serviços',
      status: 'pago',
      description: 'Pagamento do cliente XYZ por serviços de consultoria'
    },
    {
      id: 3,
      title: 'Impostos',
      date: new Date(2025, 2, 20), // 20 de março de 2025
      amount: 18350,
      type: 'despesa',
      category: 'Impostos',
      status: 'pendente',
      description: 'Pagamento trimestral de impostos'
    },
    {
      id: 4,
      title: 'Plano Seed - Cliente ABC',
      date: new Date(2025, 2, 22), // 22 de março de 2025
      amount: 499,
      type: 'receita',
      category: 'Assinaturas',
      status: 'pendente',
      description: 'Renovação da assinatura do plano Seed'
    },
    {
      id: 5,
      title: 'Pagamento de Fornecedores',
      date: new Date(2025, 2, 25), // 25 de março de 2025
      amount: 8950,
      type: 'despesa',
      category: 'Fornecedores',
      status: 'pendente',
      description: 'Pagamento mensal de fornecedores diversos'
    },
    {
      id: 6,
      title: 'Fatura de Energia',
      date: new Date(2025, 2, 28), // 28 de março de 2025
      amount: 2350,
      type: 'despesa',
      category: 'Utilidades',
      status: 'pendente',
      description: 'Conta de energia do escritório'
    },
    {
      id: 7,
      title: 'Plano Pro - Cliente XYZ',
      date: new Date(2025, 2, 30), // 30 de março de 2025
      amount: 2999,
      type: 'receita',
      category: 'Assinaturas',
      status: 'pendente',
      description: 'Assinatura do plano Pro'
    },
    {
      id: 8,
      title: 'Fatura de Internet',
      date: new Date(2025, 3, 2), // 2 de abril de 2025
      amount: 1200,
      type: 'despesa',
      category: 'Utilidades',
      status: 'pendente',
      description: 'Conta de internet do escritório'
    },
    {
      id: 9,
      title: 'Módulo Add-on Jurídico',
      date: new Date(2025, 3, 5), // 5 de abril de 2025
      amount: 99,
      type: 'receita',
      category: 'Módulos',
      status: 'pendente',
      description: 'Assinatura do módulo add-on Jurídico'
    }
  ]);
  
  const [selectedEvent, setSelectedEvent] = useState<FinancialEvent | null>(null);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<FinancialEvent>>({
    title: '',
    date: new Date(),
    amount: 0,
    type: 'despesa',
    category: '',
    status: 'pendente',
    description: ''
  });
  
  // Obtém os eventos para o dia selecionado
  const getEventsForDay = (day: Date | undefined) => {
    if (!day) return [];
    return events.filter(event => 
      event.date.getDate() === day.getDate() &&
      event.date.getMonth() === day.getMonth() &&
      event.date.getFullYear() === day.getFullYear()
    );
  };
  
  // Manipular o clique em um dia para mostrar os eventos
  const handleDayClick = (day: Date | undefined) => {
    setDate(day);
  };
  
  // Define se um dia no calendário tem eventos
  const isDayWithEvents = (day: Date) => {
    return events.some(event => 
      event.date.getDate() === day.getDate() &&
      event.date.getMonth() === day.getMonth() &&
      event.date.getFullYear() === day.getFullYear()
    );
  };
  
  // Abre o modal de detalhes do evento
  const openEventDetails = (event: FinancialEvent) => {
    setSelectedEvent(event);
  };
  
  // Fecha o modal de detalhes
  const closeEventDetails = () => {
    setSelectedEvent(null);
  };
  
  // Abre o modal de novo evento
  const openNewEvent = () => {
    setNewEvent({
      title: '',
      date: date || new Date(),
      amount: 0,
      type: 'despesa',
      category: '',
      status: 'pendente',
      description: ''
    });
    setNewEventOpen(true);
  };
  
  // Salva um novo evento
  const saveNewEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.amount) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    const eventToAdd: FinancialEvent = {
      id: events.length + 1,
      title: newEvent.title || '',
      date: newEvent.date || new Date(),
      amount: newEvent.amount || 0,
      type: newEvent.type || 'despesa',
      category: newEvent.category || '',
      status: newEvent.status || 'pendente',
      description: newEvent.description || ''
    };
    
    setEvents([...events, eventToAdd]);
    setNewEventOpen(false);
    
    toast({
      title: "Evento adicionado",
      description: "O evento financeiro foi adicionado com sucesso",
      variant: "default",
    });
  };
  
  const handleStatusChange = (eventId: number, newStatus: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return { ...event, status: newStatus as 'pendente' | 'pago' | 'atrasado' | 'cancelado' };
      }
      return event;
    }));
    
    setSelectedEvent(null);
    
    toast({
      title: "Status atualizado",
      description: "O status do evento foi atualizado com sucesso",
      variant: "default",
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Calendário Financeiro</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={openNewEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>
      
      {/* Layout principal */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Calendário */}
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDayClick}
                className="rounded-md border"
                modifiers={{
                  hasEvent: isDayWithEvents,
                }}
                modifiersClassNames={{
                  hasEvent: "bg-primary/10 font-bold text-primary",
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Eventos do dia selecionado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Eventos para {date?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </CardTitle>
            <CardDescription>
              {getEventsForDay(date).length > 0 
                ? `${getEventsForDay(date).length} eventos encontrados` 
                : 'Nenhum evento para esta data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getEventsForDay(date).length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CalendarIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>Nenhum evento financeiro para esta data</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={openNewEvent}>
                    Adicionar Evento
                  </Button>
                </div>
              ) : (
                getEventsForDay(date).map(event => (
                  <div 
                    key={event.id} 
                    className={`p-3 rounded-md border cursor-pointer transition-all hover:shadow-md ${
                      event.type === 'receita' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                    onClick={() => openEventDetails(event)}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium line-clamp-1">{event.title}</div>
                      <div className={`font-semibold ${event.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(event.amount)}
                      </div>
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <div className="text-gray-500">{event.category}</div>
                      <div>{getStatusBadge(event.status)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Lista de eventos futuros */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos Financeiros</CardTitle>
          <CardDescription>Eventos financeiros dos próximos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events
                .filter(event => {
                  const today = new Date();
                  const thirtyDaysFromNow = new Date();
                  thirtyDaysFromNow.setDate(today.getDate() + 30);
                  return event.date >= today && event.date <= thirtyDaysFromNow;
                })
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map(event => (
                  <TableRow key={event.id} className="cursor-pointer" onClick={() => openEventDetails(event)}>
                    <TableCell>
                      {event.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.category}</TableCell>
                    <TableCell className={`font-semibold ${event.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(event.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.type === 'receita' ? 'default' : 'destructive'}>
                        {event.type === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Modal de Detalhes do Evento */}
      <Dialog open={selectedEvent !== null} onOpenChange={closeEventDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Evento Financeiro</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Título</Label>
                  <div className="font-semibold">{selectedEvent.title}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Data</Label>
                  <div className="font-semibold">
                    {selectedEvent.date.toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Valor</Label>
                  <div className={`font-bold text-lg ${selectedEvent.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedEvent.amount)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Tipo</Label>
                  <div>
                    <Badge variant={selectedEvent.type === 'receita' ? 'default' : 'destructive'}>
                      {selectedEvent.type === 'receita' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Categoria</Label>
                  <div>{selectedEvent.category}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div>{getStatusBadge(selectedEvent.status)}</div>
                </div>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <Label className="text-xs text-gray-500">Descrição</Label>
                  <div className="text-gray-700 bg-gray-50 p-3 rounded-md mt-1">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <Label className="text-sm font-medium mb-2 block">Alterar Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedEvent.status === 'pendente' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleStatusChange(selectedEvent.id, 'pendente')}
                  >
                    Pendente
                  </Button>
                  <Button 
                    variant={selectedEvent.status === 'pago' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleStatusChange(selectedEvent.id, 'pago')}
                  >
                    Pago
                  </Button>
                  <Button 
                    variant={selectedEvent.status === 'atrasado' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleStatusChange(selectedEvent.id, 'atrasado')}
                  >
                    Atrasado
                  </Button>
                  <Button 
                    variant={selectedEvent.status === 'cancelado' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleStatusChange(selectedEvent.id, 'cancelado')}
                  >
                    Cancelado
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeEventDetails}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Novo Evento */}
      <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Evento Financeiro</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo evento financeiro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input 
                id="title" 
                value={newEvent.title} 
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Ex: Pagamento de Aluguel"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select 
                  value={newEvent.type} 
                  onValueChange={(value) => setNewEvent({...newEvent, type: value as 'receita' | 'despesa'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="amount">Valor *</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  value={newEvent.amount || ''} 
                  onChange={(e) => setNewEvent({...newEvent, amount: parseFloat(e.target.value) || 0})}
                  placeholder="0,00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="category">Categoria *</Label>
                <Input 
                  id="category" 
                  value={newEvent.category} 
                  onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                  placeholder="Ex: Aluguel, Impostos, etc."
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={newEvent.status} 
                  onValueChange={(value) => setNewEvent({...newEvent, status: value as 'pendente' | 'pago' | 'atrasado' | 'cancelado'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                value={newEvent.description} 
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Detalhes adicionais sobre o evento"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewEventOpen(false)}>Cancelar</Button>
            <Button onClick={saveNewEvent}>Salvar Evento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}