import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertCircle,
  Check,
  CreditCard,
  Download,
  Loader2,
  Plus,
  Printer,
  QrCode,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Define o tipo de dados da carteirinha
interface MembershipCard {
  id: number;
  organizationId: number;
  beneficiaryId: number;
  beneficiary: {
    id: number;
    name: string;
    email: string;
    cpf: string;
    phone: string;
    birthDate: string;
  };
  cardNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked' | 'pending';
  digitalOnly: boolean;
  physicalCardStatus?: 'pending' | 'approved' | 'printed' | 'delivered' | null;
  qrCodeData: string;
  createdAt: string;
  updatedAt: string;
}

export function MembershipCardDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Carregar carteirinhas
  const { data: cards, isLoading, error } = useQuery({
    queryKey: ['/api/carteirinha/membership-cards', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');
      
      try {
        const response = await fetch('/api/carteirinha/membership-cards', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error('Resposta não ok:', await response.text());
          throw new Error('Falha ao carregar carteirinhas');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar carteirinhas:', error);
        throw new Error('Falha ao carregar carteirinhas');
      }
    },
    enabled: !!user
  });
  
  // Carregar configurações de carteirinha
  const { data: settings } = useQuery({
    queryKey: ['/api/carteirinha/membership-cards/settings/current', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const response = await fetch('/api/carteirinha/membership-cards/settings/current', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Falha ao carregar configurações');
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        return null;
      }
    },
    enabled: !!user
  });
  
  // Função para filtrar carteirinhas com base na pesquisa
  const filterCards = (cards: MembershipCard[]) => {
    if (!searchTerm) return cards;
    
    const searchLower = searchTerm.toLowerCase();
    return cards.filter(card => 
      card.beneficiary.name.toLowerCase().includes(searchLower) ||
      card.beneficiary.cpf.includes(searchTerm) ||
      card.cardNumber.toLowerCase().includes(searchLower)
    );
  };
  
  // Função para filtrar carteirinhas com base na aba ativa
  const filterCardsByTab = (cards: MembershipCard[]) => {
    switch (activeTab) {
      case 'active':
        return cards.filter(card => card.status === 'active');
      case 'expired':
        return cards.filter(card => card.status === 'expired');
      case 'physical':
        return cards.filter(card => !card.digitalOnly);
      case 'pending':
        return cards.filter(card => 
          card.physicalCardStatus === 'pending' || 
          card.physicalCardStatus === 'approved'
        );
      default:
        return cards;
    }
  };
  
  // Função para obter a contagem de carteirinhas por status
  const getStatusCounts = (cards: MembershipCard[] = []) => {
    return {
      all: cards.length,
      active: cards.filter(card => card.status === 'active').length,
      expired: cards.filter(card => card.status === 'expired').length,
      physical: cards.filter(card => !card.digitalOnly).length,
      pending: cards.filter(card => 
        card.physicalCardStatus === 'pending' || 
        card.physicalCardStatus === 'approved'
      ).length,
    };
  };
  
  // Função para verificar se uma carteirinha está expirada
  const isExpired = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return isAfter(today, expiry);
  };
  
  // Função para renderizar o status da carteirinha
  const renderCardStatus = (card: MembershipCard) => {
    switch (card.status) {
      case 'active':
        return <Badge className="bg-green-500">Ativa</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirada</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revogada</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return null;
    }
  };
  
  // Função para renderizar o status da carteirinha física
  const renderPhysicalCardStatus = (status: string | null | undefined) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Aguardando Aprovação</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Aprovada para Impressão</Badge>;
      case 'printed':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Impressa</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="border-green-500 text-green-500">Entregue</Badge>;
      default:
        return <Badge variant="outline">Digital</Badge>;
    }
  };
  
  // Processar carteirinhas para exibição
  let filteredCards: MembershipCard[] = [];
  let statusCounts = { all: 0, active: 0, expired: 0, physical: 0, pending: 0 };
  
  if (cards) {
    filteredCards = filterCardsByTab(filterCards(cards));
    statusCounts = getStatusCounts(cards);
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Carteirinhas de Associado</h2>
          <div className="flex items-center space-x-2">
            <Link href="/organization/carteirinha/settings">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/organization/carteirinha/membership-cards/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Carteirinha
              </Button>
            </Link>
          </div>
        </div>
        
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="pb-2">
            <div className="flex">
              <AlertCircle className="text-red-500 mr-2" />
              <CardTitle className="text-red-800">Erro ao carregar carteirinhas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Ocorreu um erro ao carregar os dados das carteirinhas. Por favor, tente novamente mais tarde.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Carteirinhas de Associado</h2>
          <p className="text-muted-foreground">
            Gerencie carteirinhas digitais e físicas para seus associados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/organization/carteirinha/settings">
            <Button variant="outline" size="icon" title="Configurações">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/organization/carteirinha/membership-cards/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Carteirinha
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Carteirinhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                statusCounts.all
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Carteirinhas emitidas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Carteirinhas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                statusCounts.active
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Dentro da validade
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Carteirinhas Expiradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                statusCounts.expired
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Fora da validade
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Carteirinhas Físicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                statusCounts.physical
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Solicitações totais
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pendentes de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                statusCounts.pending
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="all" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Todas</span>
                <Badge variant="secondary" className="ml-2">{statusCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                <Check className="mr-2 h-4 w-4" />
                <span>Ativas</span>
                <Badge variant="secondary" className="ml-2">{statusCounts.active}</Badge>
              </TabsTrigger>
              <TabsTrigger value="expired">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Expiradas</span>
                <Badge variant="secondary" className="ml-2">{statusCounts.expired}</Badge>
              </TabsTrigger>
              <TabsTrigger value="physical">
                <Printer className="mr-2 h-4 w-4" />
                <span>Físicas</span>
                <Badge variant="secondary" className="ml-2">{statusCounts.physical}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                <Loader2 className="mr-2 h-4 w-4" />
                <span>Pendentes</span>
                <Badge variant="secondary" className="ml-2">{statusCounts.pending}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar carteirinhas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando carteirinhas...</span>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="py-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma carteirinha encontrada</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm 
                    ? "Nenhuma carteirinha corresponde aos critérios de pesquisa."
                    : "Você ainda não emitiu nenhuma carteirinha para associados."}
                </p>
                {!searchTerm && (
                  <Button className="mt-4" asChild>
                    <Link href="/organization/carteirinha/membership-cards/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Emitir Nova Carteirinha
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Carteirinha</TableHead>
                      <TableHead>Associado</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Emissão</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.cardNumber}</TableCell>
                        <TableCell>{card.beneficiary.name}</TableCell>
                        <TableCell>{card.beneficiary.cpf}</TableCell>
                        <TableCell>{format(new Date(card.issueDate), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>
                          <span className={isExpired(card.expiryDate) ? "text-red-600 font-semibold" : ""}>
                            {format(new Date(card.expiryDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </TableCell>
                        <TableCell>{renderCardStatus(card)}</TableCell>
                        <TableCell>{renderPhysicalCardStatus(card.physicalCardStatus)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" title="Ver QR Code">
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" title="Detalhes">
                              <Link href={`/organization/carteirinha/membership-cards/${card.id}`}>
                                <Users className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}