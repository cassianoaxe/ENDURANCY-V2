import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Search, Plus, Copy, ExternalLink, MoreVertical, X, Link as LinkIcon, FileText, CheckCircle } from 'lucide-react';

// Tipos
interface PaymentLink {
  id: number;
  invoiceId: number;
  clientName: string;
  amount: number;
  description: string;
  url: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'paid' | 'canceled';
  createdAt: string;
  paymentDate?: string;
}

export default function FinanceiroLinks() {
  const { toast } = useToast();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<PaymentLink | null>(null);
  
  // Form states para criar um novo link
  const [newLinkClientName, setNewLinkClientName] = useState('');
  const [newLinkAmount, setNewLinkAmount] = useState('');
  const [newLinkDescription, setNewLinkDescription] = useState('');
  const [newLinkExpirationDate, setNewLinkExpirationDate] = useState('');

  useEffect(() => {
    // Carregar dados
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock data para demonstração
    const mockPaymentLinks = [
      {
        id: 1,
        invoiceId: 2,
        clientName: 'CannaPharma Brasil',
        amount: 4200.00,
        description: 'Fatura INV-2025-002 - Análises laboratoriais',
        url: 'https://pagamento.com/link-exemplo-1',
        expirationDate: '2025-05-05',
        status: 'active' as const,
        createdAt: '2025-04-05'
      },
      {
        id: 2,
        invoiceId: 3,
        clientName: 'Associação Esperança',
        amount: 1890.00,
        description: 'Fatura INV-2025-003 - Análises de estabilidade',
        url: 'https://pagamento.com/link-exemplo-2',
        expirationDate: '2025-04-10',
        status: 'expired' as const,
        createdAt: '2025-03-10'
      },
      {
        id: 3,
        invoiceId: 0, // Link direto sem fatura
        clientName: 'Universidade Federal',
        amount: 1200.00,
        description: 'Treinamento HPLC avançado',
        url: 'https://pagamento.com/link-exemplo-3',
        expirationDate: '2025-05-15',
        status: 'active' as const,
        createdAt: '2025-04-15'
      },
      {
        id: 4,
        invoiceId: 0,
        clientName: 'Centro de Pesquisa Canábica',
        amount: 3500.00,
        description: 'Consultoria técnica em análises cromatográficas',
        url: 'https://pagamento.com/link-exemplo-4',
        expirationDate: '2025-04-30',
        status: 'paid' as const,
        createdAt: '2025-04-01',
        paymentDate: '2025-04-05'
      },
      {
        id: 5,
        invoiceId: 0,
        clientName: 'Farmácia de Manipulação Vida',
        amount: 950.00,
        description: 'Análise de amostras para validação',
        url: 'https://pagamento.com/link-exemplo-5',
        expirationDate: '2025-05-20',
        status: 'canceled' as const,
        createdAt: '2025-04-10'
      }
    ];

    setPaymentLinks(mockPaymentLinks);
  };

  // Funções para gerenciar os links
  const viewLink = (link: PaymentLink) => {
    setCurrentLink(link);
    setViewDialogOpen(true);
  };

  const copyLinkToClipboard = (link: PaymentLink) => {
    navigator.clipboard.writeText(link.url);
    toast({
      title: "Link copiado",
      description: "O link de pagamento foi copiado para a área de transferência",
    });
  };

  const markLinkAsPaid = (link: PaymentLink) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedLinks = paymentLinks.map(lnk => 
      lnk.id === link.id ? { ...lnk, status: 'paid' as const, paymentDate: today } : lnk
    );
    setPaymentLinks(updatedLinks);
    
    toast({
      title: "Link marcado como pago",
      description: `O pagamento de R$ ${link.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi registrado`,
    });
  };

  const cancelLink = (link: PaymentLink) => {
    const updatedLinks = paymentLinks.map(lnk => 
      lnk.id === link.id ? { ...lnk, status: 'canceled' as const } : lnk
    );
    setPaymentLinks(updatedLinks);
    
    toast({
      title: "Link cancelado",
      description: "O link de pagamento foi cancelado com sucesso",
    });
  };

  const createNewLink = () => {
    // Validação básica
    if (!newLinkClientName || !newLinkAmount || !newLinkDescription || !newLinkExpirationDate) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Criar novo link
    const amount = parseFloat(newLinkAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    const newLink: PaymentLink = {
      id: Math.max(0, ...paymentLinks.map(link => link.id)) + 1,
      invoiceId: 0, // Link direto sem fatura
      clientName: newLinkClientName,
      amount,
      description: newLinkDescription,
      url: `https://pagamento.com/link-${Date.now()}`,
      expirationDate: newLinkExpirationDate,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPaymentLinks([...paymentLinks, newLink]);
    resetNewLinkForm();
    setCreateDialogOpen(false);
    
    toast({
      title: "Link de pagamento criado",
      description: "O novo link foi criado com sucesso",
    });
  };

  const resetNewLinkForm = () => {
    setNewLinkClientName('');
    setNewLinkAmount('');
    setNewLinkDescription('');
    setNewLinkExpirationDate('');
  };

  // Filtros
  const filteredLinks = paymentLinks.filter(link => {
    const matchesSearch = 
      link.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || link.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Links de Pagamento</h1>
          <p className="text-gray-500">Gerencie links de pagamento para faturas e serviços avulsos</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Link
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between my-4">
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar links..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="paid">Pagos</SelectItem>
              <SelectItem value="expired">Expirados</SelectItem>
              <SelectItem value="canceled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg font-medium text-blue-800">Links de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.clientName}</TableCell>
                  <TableCell>{link.description}</TableCell>
                  <TableCell className="text-right">
                    R$ {link.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{new Date(link.expirationDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        link.status === 'active' && "bg-blue-50 text-blue-700 border-blue-200",
                        link.status === 'paid' && "bg-green-50 text-green-700 border-green-200",
                        link.status === 'expired' && "bg-red-50 text-red-700 border-red-200",
                        link.status === 'canceled' && "bg-gray-50 text-gray-500 border-gray-200 line-through"
                      )}
                    >
                      {
                        link.status === 'active' ? 'Ativo' :
                        link.status === 'paid' ? 'Pago' :
                        link.status === 'expired' ? 'Expirado' :
                        'Cancelado'
                      }
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewLink(link)}>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLinkToClipboard(link)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar Link
                        </DropdownMenuItem>
                        {link.status === 'active' && (
                          <>
                            <DropdownMenuItem onClick={() => markLinkAsPaid(link)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => cancelLink(link)}>
                              <X className="mr-2 h-4 w-4" />
                              Cancelar Link
                            </DropdownMenuItem>
                          </>
                        )}
                        {link.invoiceId > 0 && (
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Fatura
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para criar novo link */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Link de Pagamento</DialogTitle>
            <DialogDescription>
              Preencha as informações para gerar um novo link de pagamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Cliente
              </Label>
              <Input
                id="clientName"
                value={newLinkClientName}
                onChange={(e) => setNewLinkClientName(e.target.value)}
                className="col-span-3"
                placeholder="Nome do cliente"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor (R$)
              </Label>
              <Input
                id="amount"
                value={newLinkAmount}
                onChange={(e) => setNewLinkAmount(e.target.value)}
                className="col-span-3"
                placeholder="0,00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={newLinkDescription}
                onChange={(e) => setNewLinkDescription(e.target.value)}
                className="col-span-3"
                placeholder="Descrição do serviço ou fatura"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expirationDate" className="text-right">
                Validade
              </Label>
              <Input
                id="expirationDate"
                type="date"
                value={newLinkExpirationDate}
                onChange={(e) => setNewLinkExpirationDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createNewLink}>
              Criar Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar link */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Link de Pagamento</DialogTitle>
          </DialogHeader>
          {currentLink && (
            <div className="space-y-4">
              <div>
                <div className="mb-2 font-semibold">Link de pagamento:</div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <div className="truncate flex-1 text-sm">{currentLink.url}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyLinkToClipboard(currentLink)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(currentLink.url, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-500">Cliente</div>
                  <div>{currentLink.clientName}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">Valor</div>
                  <div>R$ {currentLink.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">Criado em</div>
                  <div>{new Date(currentLink.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">Válido até</div>
                  <div>{new Date(currentLink.expirationDate).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">Status</div>
                  <Badge
                    variant="outline"
                    className={cn(
                      currentLink.status === 'active' && "bg-blue-50 text-blue-700 border-blue-200",
                      currentLink.status === 'paid' && "bg-green-50 text-green-700 border-green-200",
                      currentLink.status === 'expired' && "bg-red-50 text-red-700 border-red-200",
                      currentLink.status === 'canceled' && "bg-gray-50 text-gray-500 border-gray-200 line-through"
                    )}
                  >
                    {
                      currentLink.status === 'active' ? 'Ativo' :
                      currentLink.status === 'paid' ? 'Pago' :
                      currentLink.status === 'expired' ? 'Expirado' :
                      'Cancelado'
                    }
                  </Badge>
                </div>
                {currentLink.status === 'paid' && currentLink.paymentDate && (
                  <div>
                    <div className="text-sm font-semibold text-gray-500">Data do Pagamento</div>
                    <div>{new Date(currentLink.paymentDate).toLocaleDateString('pt-BR')}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-500">Descrição</div>
                <div className="text-gray-700">{currentLink.description}</div>
              </div>

              {currentLink.status === 'active' && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => cancelLink(currentLink)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Link
                  </Button>
                  <Button onClick={() => markLinkAsPaid(currentLink)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Pago
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}