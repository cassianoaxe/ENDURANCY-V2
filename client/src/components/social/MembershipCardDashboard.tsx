import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, CreditCard, Download, Printer, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Link } from "wouter";

// Status para carteirinhas
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  printed: "bg-blue-100 text-blue-800",
  delivered: "bg-purple-100 text-purple-800",
  expired: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800"
};

// Esta interface precisa corresponder ao formato dos dados retornados pela API
interface MembershipCard {
  id: number;
  beneficiaryId: number;
  organizationId: number;
  cardType: 'digital' | 'physical' | 'both';
  status: 'pending' | 'approved' | 'printed' | 'delivered' | 'expired' | 'cancelled';
  cardNumber: string;
  qrCodeUrl?: string;
  issueDate: string;
  expiryDate: string;
  photoUrl?: string;
  cardImageUrl?: string;
  beneficiaryName?: string; // Adicionamos o nome do beneficiário
}

// Esta interface representa um beneficiário (associado)
interface Beneficiary {
  id: number;
  name: string;
  cpf: string;
  email: string;
  membershipCode?: string;
}

export function MembershipCardDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  // Buscar carteirinhas
  const { data: cards, isLoading: isLoadingCards } = useQuery({
    queryKey: ['/api/social/membership-cards'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/social/membership-cards');
        if (!response.ok) throw new Error('Falha ao carregar carteirinhas');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar carteirinhas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as carteirinhas",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Função para gerar QR Code
  const generateQrCode = async (cardId: number) => {
    try {
      const response = await fetch(`/api/social/membership-cards/${cardId}/generate-qr`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Falha ao gerar QR Code');
      
      toast({
        title: "Sucesso",
        description: "QR Code gerado com sucesso!",
      });
      
      // Recarregar os dados
      // queryClient.invalidateQueries(['/api/social/membership-cards']);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code",
        variant: "destructive",
      });
    }
  };

  // Função para marcar carteirinha como impressa
  const markAsPrinted = async (cardId: number) => {
    try {
      const response = await fetch(`/api/social/membership-cards/${cardId}/mark-printed`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Falha ao marcar como impressa');
      
      toast({
        title: "Sucesso",
        description: "Carteirinha marcada como impressa",
      });
      
      // Recarregar os dados
      // queryClient.invalidateQueries(['/api/social/membership-cards']);
    } catch (error) {
      console.error('Erro ao marcar como impressa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da carteirinha",
        variant: "destructive",
      });
    }
  };

  // Função para marcar carteirinha como entregue
  const markAsDelivered = async (cardId: number) => {
    try {
      const response = await fetch(`/api/social/membership-cards/${cardId}/mark-delivered`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Falha ao marcar como entregue');
      
      toast({
        title: "Sucesso",
        description: "Carteirinha marcada como entregue",
      });
      
      // Recarregar os dados
      // queryClient.invalidateQueries(['/api/social/membership-cards']);
    } catch (error) {
      console.error('Erro ao marcar como entregue:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da carteirinha",
        variant: "destructive",
      });
    }
  };

  // Mockup de dados enquanto não temos a API real
  const mockCards: MembershipCard[] = [
    {
      id: 1,
      beneficiaryId: 101,
      organizationId: 1,
      cardType: 'digital',
      status: 'approved',
      cardNumber: 'A10112023001',
      qrCodeUrl: 'https://via.placeholder.com/200x200.png?text=QR+Code',
      issueDate: '2023-11-01T00:00:00Z',
      expiryDate: '2024-11-01T00:00:00Z',
      photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      cardImageUrl: 'https://via.placeholder.com/400x250.png?text=Card+Image',
      beneficiaryName: 'Maria Silva',
    },
    {
      id: 2,
      beneficiaryId: 102,
      organizationId: 1,
      cardType: 'physical',
      status: 'pending',
      cardNumber: 'A10112023002',
      issueDate: '2023-11-02T00:00:00Z',
      expiryDate: '2024-11-02T00:00:00Z',
      beneficiaryName: 'João Santos',
    },
    {
      id: 3,
      beneficiaryId: 103,
      organizationId: 1,
      cardType: 'both',
      status: 'delivered',
      cardNumber: 'A10112023003',
      qrCodeUrl: 'https://via.placeholder.com/200x200.png?text=QR+Code',
      issueDate: '2023-11-03T00:00:00Z',
      expiryDate: '2024-11-03T00:00:00Z',
      photoUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
      cardImageUrl: 'https://via.placeholder.com/400x250.png?text=Card+Image',
      beneficiaryName: 'Pedro Oliveira',
    }
  ];

  // Escolher os dados reais ou o mockup
  const displayCards = cards || mockCards;
  
  // Filtrar carteirinhas por status
  const filteredCards = activeTab === 'all' 
    ? displayCards 
    : displayCards.filter(card => card.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Carteirinhas</h2>
          <p className="text-muted-foreground">
            Gerencie as carteirinhas de associados da sua organização
          </p>
        </div>
        <Link href="/social/membership-cards/new">
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Nova Carteirinha
          </Button>
        </Link>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total de Carteirinhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{displayCards.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Válidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {displayCards.filter(card => 
                ['approved', 'printed', 'delivered'].includes(card.status)).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {displayCards.filter(card => card.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="printed">Impressas</TabsTrigger>
          <TabsTrigger value="delivered">Entregues</TabsTrigger>
          <TabsTrigger value="expired">Expiradas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoadingCards ? (
            <div className="flex justify-center p-8">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">Nenhuma carteirinha encontrada com este status.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Associado</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell>{card.id}</TableCell>
                      <TableCell>{card.beneficiaryName}</TableCell>
                      <TableCell>{card.cardNumber}</TableCell>
                      <TableCell>
                        {card.cardType === 'digital' && 'Digital'}
                        {card.cardType === 'physical' && 'Física'}
                        {card.cardType === 'both' && 'Digital + Física'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[card.status] || "bg-gray-100"}>
                          {card.status === 'pending' && 'Pendente'}
                          {card.status === 'approved' && 'Aprovada'}
                          {card.status === 'printed' && 'Impressa'}
                          {card.status === 'delivered' && 'Entregue'}
                          {card.status === 'expired' && 'Expirada'}
                          {card.status === 'cancelled' && 'Cancelada'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(card.issueDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{new Date(card.expiryDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => generateQrCode(card.id)}
                            disabled={card.qrCodeUrl}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => markAsPrinted(card.id)}
                            disabled={card.status !== 'approved'}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsDelivered(card.id)}
                            disabled={card.status !== 'printed'}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Link href={`/social/membership-cards/${card.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}