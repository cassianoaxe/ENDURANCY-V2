import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  Download, 
  Eye, 
  Plus, 
  Printer, 
  QrCode, 
  RefreshCw, 
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface MembershipCardDashboardProps {
  organizationId: number;
}

export function MembershipCardDashboard({ organizationId }: MembershipCardDashboardProps) {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardTypeFilter, setCardTypeFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Buscar configurações das carteirinhas
  const { 
    data: settings,
    isLoading: isLoadingSettings
  } = useQuery({
    queryKey: ['/api/social/membership-cards/settings/current'],
    refetchOnWindowFocus: false,
  });

  // Buscar carteirinhas com filtros e paginação
  const {
    data: cardsData,
    isLoading: isLoadingCards,
    refetch: refetchCards
  } = useQuery({
    queryKey: [
      '/api/social/membership-cards', 
      { status: currentTab, cardType: cardTypeFilter, query: searchQuery, page: currentPage, limit: pageSize }
    ],
    refetchOnWindowFocus: false,
  });

  // Função para atualizar o status de uma carteirinha
  const updateCardStatus = async (cardId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/social/membership-cards/${cardId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status da carteirinha');
      }

      const data = await response.json();
      toast({
        title: 'Status atualizado',
        description: data.message,
      });

      // Atualizar dados
      refetchCards();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Função para gerar imagem da carteirinha
  const generateCardImage = async (cardId: number) => {
    try {
      const response = await fetch(`/api/social/membership-cards/${cardId}/generate-image`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar imagem da carteirinha');
      }

      const data = await response.json();
      toast({
        title: 'Imagem gerada',
        description: 'Imagem da carteirinha gerada com sucesso!',
      });

      // Atualizar dados
      refetchCards();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Renderizar status da carteirinha como badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Aprovada</Badge>;
      case 'printed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Impressa</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Entregue</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Expirada</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Renderizar tipo da carteirinha como badge
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'digital':
        return <Badge variant="outline" className="bg-sky-50 text-sky-600 border-sky-200">Digital</Badge>;
      case 'physical':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Física</Badge>;
      case 'both':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">Digital e Física</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Renderizar ações disponíveis com base no status
  const renderActions = (card) => {
    const actions = [];

    // Ver detalhes (sempre disponível)
    actions.push(
      <Button 
        key="view" 
        variant="ghost" 
        size="icon"
        onClick={() => window.location.href = `/social/membership-cards/${card.id}`}
      >
        <Eye size={16} />
      </Button>
    );

    // Gerar imagem (disponível para aprovadas)
    if (card.status === 'approved' || card.status === 'pending') {
      actions.push(
        <Button 
          key="generate"
          variant="ghost"
          size="icon"
          onClick={() => generateCardImage(card.id)}
        >
          <QrCode size={16} />
        </Button>
      );
    }

    // Imprimir (disponível para aprovadas com imagem gerada)
    if ((card.status === 'approved' || card.status === 'pending') && card.cardImageUrl) {
      actions.push(
        <Button 
          key="print"
          variant="ghost"
          size="icon"
          onClick={() => {
            const printUrl = card.cardImageUrl;
            window.open(printUrl, '_blank');
          }}
        >
          <Printer size={16} />
        </Button>
      );
    }

    // Marcar como impressa (para aprovadas)
    if (card.status === 'approved') {
      actions.push(
        <Button 
          key="markPrinted"
          variant="ghost"
          size="icon"
          onClick={() => updateCardStatus(card.id, 'printed')}
        >
          <CreditCard size={16} />
        </Button>
      );
    }

    // Marcar como entregue (para impressas)
    if (card.status === 'printed') {
      actions.push(
        <Button 
          key="markDelivered"
          variant="ghost"
          size="icon"
          onClick={() => updateCardStatus(card.id, 'delivered')}
        >
          <Download size={16} />
        </Button>
      );
    }

    return actions;
  };

  // Extrair dados das carteirinhas e da paginação
  const cards = cardsData?.data || [];
  const pagination = cardsData?.pagination || { total: 0, page: 1, limit: pageSize, totalPages: 1 };

  // Calcular intervalo de itens exibidos
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  if (isLoadingSettings) {
    return <div className="flex items-center justify-center p-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Carteirinhas de Associados</CardTitle>
              <CardDescription>
                Gerencie carteirinhas digitais e físicas para seus associados
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/social/membership-cards/settings'}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
              <Button onClick={() => window.location.href = '/social/membership-cards/new'}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Carteirinha
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <Tabs defaultValue={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid grid-cols-5 w-[600px]">
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="approved">Aprovadas</TabsTrigger>
                <TabsTrigger value="printed">Impressas</TabsTrigger>
                <TabsTrigger value="delivered">Entregues</TabsTrigger>
                <TabsTrigger value="expired">Expiradas</TabsTrigger>
              </TabsList>

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Buscar por nome, CPF ou número da carteirinha"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80"
                  />
                  <Select
                    value={cardTypeFilter}
                    onValueChange={setCardTypeFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="physical">Física</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => refetchCards()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="pending" className="mt-6">
                {renderCardsTable()}
              </TabsContent>
              <TabsContent value="approved" className="mt-6">
                {renderCardsTable()}
              </TabsContent>
              <TabsContent value="printed" className="mt-6">
                {renderCardsTable()}
              </TabsContent>
              <TabsContent value="delivered" className="mt-6">
                {renderCardsTable()}
              </TabsContent>
              <TabsContent value="expired" className="mt-6">
                {renderCardsTable()}
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
      </Card>
    </div>
  );

  // Função para renderizar a tabela de carteirinhas
  function renderCardsTable() {
    if (isLoadingCards) {
      return <div className="py-8 text-center">Carregando carteirinhas...</div>;
    }

    if (cards.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Nenhuma carteirinha encontrada com os filtros atuais.</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.href = '/social/membership-cards/new'}
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar nova carteirinha
          </Button>
        </div>
      );
    }

    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Associado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.card.id}>
                <TableCell className="font-medium">{card.card.cardNumber}</TableCell>
                <TableCell>{card.beneficiary.name}</TableCell>
                <TableCell>{renderTypeBadge(card.card.cardType)}</TableCell>
                <TableCell>
                  {card.card.issueDate && format(new Date(card.card.issueDate), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {card.card.expiryDate && format(new Date(card.card.expiryDate), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{renderStatusBadge(card.card.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    {renderActions(card.card)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <CardFooter className="flex justify-between items-center border-t p-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startItem} a {endItem} de {pagination.total} carteirinhas
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </>
    );
  }
}