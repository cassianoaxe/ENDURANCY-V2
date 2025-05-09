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
        // Implementação de estratégia de fallback para múltiplas URLs
        const fetchWithStrategy = async (urls) => {
          // Iteração sobre um array de URLs para tentativa sequencial
          for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            console.log(`Tentativa ${i+1}/${urls.length}: ${url}`);
            
            try {
              const response = await fetch(url, {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache'
                },
                credentials: 'include'
              });
              
              // Verificamos o tipo de conteúdo antes mesmo de verificar se a resposta é ok
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('text/html')) {
                console.warn(`URL ${url} retornou HTML. Tentando próxima URL...`);
                continue; // Tenta a próxima URL
              }
              
              if (!response.ok) {
                // Se o erro for 401, 403 ou 500, tentamos a próxima URL
                if (response.status === 401 || response.status === 403 || response.status === 500) {
                  console.warn(`URL ${url} retornou ${response.status}. Tentando próxima URL...`);
                  continue; // Tenta a próxima URL
                }
                
                // Para outros códigos de erro, lançamos exceção
                throw new Error(`Resposta não ok: ${response.status}`);
              }
              
              // Se chegou aqui, a resposta é ok e não é HTML
              console.log(`URL ${url} retornou com sucesso!`);
              return response;
            } catch (error) {
              console.error(`Erro ao buscar de ${url}:`, error);
              
              // Se não for a última URL, continua para a próxima
              if (i < urls.length - 1) {
                continue;
              }
              
              // Se for a última URL e falhou, lança o erro
              throw error;
            }
          }
          
          // Se chegou aqui, todas as URLs falharam
          throw new Error('Todas as tentativas de fetch falharam');
        };
        
        // Adicionar timestamp para evitar cache
        const timestamp = new Date().getTime();
        
        // Array de URLs para tentar em sequência - agora a API normal é a primária
        const urls = [
          `/api/carteirinha/membership-cards?_t=${timestamp}`, // Agora primária
          `/api-json/carteirinha/membership-cards?_t=${timestamp}` // Agora secundária
        ];
        
        const response = await fetchWithStrategy(urls);
        
        if (!response.ok) {
          const responseText = await response.text();
          console.error('Resposta não ok:', response.status, responseText);
          throw new Error(`Falha ao carregar carteirinhas: ${response.status}`);
        }
        
        // Verifica se a resposta é HTML (geralmente acontece quando a sessão expirou)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.error('Resposta retornou HTML em vez de JSON - sessão pode ter expirado');
          throw new Error('Sessão expirada ou resposta inválida');
        }
        
        const result = await response.json();
        console.log('Dados de carteirinhas recebidos:', result);
        
        // A API está retornando um objeto { data: [...], pagination: {...} }
        if (result && result.data && Array.isArray(result.data)) {
          console.log('Carteirinhas encontradas:', result.data.length);
          return result.data;
        } else if (Array.isArray(result)) {
          // Fallback para o caso da API retornar diretamente um array
          console.log('Carteirinhas encontradas (array direto):', result.length);
          return result;
        } else if (result && typeof result === 'object') {
          // Se for um objeto mas sem propriedade data, considerar como um array vazio
          console.log('Recebido objeto sem propriedade data:', result);
          return [];
        } else {
          console.error('Resposta não contém dados válidos:', result);
          return []; // Retorna array vazio para não quebrar o restante do componente
        }
      } catch (error) {
        console.error('Erro ao buscar carteirinhas:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 1, // Limita a 1 retry para evitar ciclos infinitos
    staleTime: 60000, // Cache por 1 minuto
    onError: (err) => {
      console.error('Erro na query de carteirinhas:', err);
      toast({
        title: "Erro ao carregar carteirinhas",
        description: "Não foi possível carregar as carteirinhas. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });
  
  // Carregar configurações de carteirinha
  const { data: settings } = useQuery({
    queryKey: ['/api/carteirinha/membership-cards/settings/current', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        // Implementação de estratégia de fallback para múltiplas URLs
        const fetchWithStrategy = async (urls) => {
          // Iteração sobre um array de URLs para tentativa sequencial
          for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            console.log(`Tentativa ${i+1}/${urls.length} para configurações: ${url}`);
            
            try {
              const response = await fetch(url, {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache'
                },
                credentials: 'include'
              });
              
              // Verificamos o tipo de conteúdo antes mesmo de verificar se a resposta é ok
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('text/html')) {
                console.warn(`URL ${url} para configurações retornou HTML. Tentando próxima URL...`);
                continue; // Tenta a próxima URL
              }
              
              if (!response.ok) {
                // Se o erro for 401, 403 ou 500, tentamos a próxima URL
                if (response.status === 401 || response.status === 403 || response.status === 500) {
                  console.warn(`URL ${url} para configurações retornou ${response.status}. Tentando próxima URL...`);
                  continue; // Tenta a próxima URL
                }
                
                // Para outros códigos de erro, lançamos exceção
                throw new Error(`Resposta não ok: ${response.status}`);
              }
              
              // Se chegou aqui, a resposta é ok e não é HTML
              console.log(`URL ${url} para configurações retornou com sucesso!`);
              return response;
            } catch (error) {
              console.error(`Erro ao buscar configurações de ${url}:`, error);
              
              // Se não for a última URL, continua para a próxima
              if (i < urls.length - 1) {
                continue;
              }
              
              // Se for a última URL e falhou, lança o erro
              throw error;
            }
          }
          
          // Se chegou aqui, todas as URLs falharam
          throw new Error('Todas as tentativas de fetch para configurações falharam');
        };
        
        // Adicionar timestamp para evitar cache
        const timestamp = new Date().getTime();
        
        // Array de URLs para tentar em sequência - agora a API normal é a primária
        const urls = [
          `/api/carteirinha/membership-cards/settings/current?_t=${timestamp}`, // Agora primária
          `/api-json/carteirinha/membership-cards/settings/current?_t=${timestamp}` // Agora secundária
        ];
        
        const response = await fetchWithStrategy(urls);
        
        if (!response.ok) {
          const responseText = await response.text();
          console.error('Erro ao carregar configurações:', response.status, responseText);
          return null;
        }
        
        // Verifica se a resposta é HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.error('Resposta de configurações retornou HTML em vez de JSON');
          return null;
        }
        
        const result = await response.json();
        console.log('Configurações recebidas:', result);
        
        // A API pode retornar um objeto com data ou diretamente os dados
        if (result && result.data) {
          return result.data;
        } else if (result && typeof result === 'object') {
          // Se for um objeto mas sem propriedade data, considerar como o próprio objeto
          return result;
        } else {
          console.error('Formato de configurações inválido:', result);
          return null;
        }
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 60000, // Cache por 1 minuto
    retry: 1
  });
  
  // Função para filtrar carteirinhas com base na pesquisa
  const filterCards = (cards: MembershipCard[] = []) => {
    if (!searchTerm || !cards || !Array.isArray(cards)) return cards || [];
    
    const searchLower = searchTerm.toLowerCase();
    return cards.filter(card => {
      try {
        return (
          (card.beneficiary?.name?.toLowerCase()?.includes(searchLower) || false) ||
          (card.beneficiary?.cpf?.includes(searchTerm) || false) ||
          (card.cardNumber?.toLowerCase()?.includes(searchLower) || false)
        );
      } catch (error) {
        console.error('Erro ao filtrar carteirinha:', error, card);
        return false;
      }
    });
  };
  
  // Função para filtrar carteirinhas com base na aba ativa
  const filterCardsByTab = (cards: MembershipCard[] = []) => {
    if (!cards || !Array.isArray(cards)) return [];
    
    try {
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
    } catch (error) {
      console.error('Erro ao filtrar carteirinhas por aba:', error);
      return [];
    }
  };
  
  // Função para obter a contagem de carteirinhas por status
  const getStatusCounts = (cards: MembershipCard[] = []) => {
    if (!cards || !Array.isArray(cards)) {
      return { all: 0, active: 0, expired: 0, physical: 0, pending: 0 };
    }
    
    try {
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
    } catch (error) {
      console.error('Erro ao obter contagem de carteirinhas:', error);
      return { all: 0, active: 0, expired: 0, physical: 0, pending: 0 };
    }
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