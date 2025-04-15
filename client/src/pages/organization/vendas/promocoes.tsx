import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  MoreVertical,
  Copy, 
  Edit, 
  Trash,
  Tag,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';
import { format } from 'date-fns';

// Dados de exemplo
const promocoes = [
  {
    nome: 'Black Friday 40%',
    codigo: 'BLACK40',
    tipo: 'Percentual',
    valor: '40%',
    inicio: new Date('2023-11-24'),
    termino: new Date('2023-11-26'),
    status: 'Agendada',
    usos: '0 / 300'
  },
  {
    nome: 'Desconto CBD 30%',
    codigo: 'CBD30',
    tipo: 'Percentual',
    valor: '30%',
    inicio: new Date('2023-10-15'),
    termino: new Date('2023-10-31'),
    status: 'Expirada',
    usos: '105 / 100'
  },
  {
    nome: 'Cupom R$50 Off',
    codigo: 'PROMO50',
    tipo: 'Valor Fixo',
    valor: 'R$ 50,00',
    inicio: new Date('2023-01-01'),
    termino: new Date('2023-12-31'),
    status: 'Ativa',
    usos: '42 / 150'
  },
  {
    nome: 'Frete Grátis',
    codigo: 'FRETEFREE',
    tipo: 'Frete Grátis',
    valor: 'Frete Grátis',
    inicio: new Date('2023-01-01'),
    termino: new Date('2023-10-31'),
    status: 'Ativa',
    usos: '87 / 200'
  },
  {
    nome: 'Desconto Primavera',
    codigo: 'PRIMAVERA23',
    tipo: 'Percentual',
    valor: '15%',
    inicio: new Date('2023-09-23'),
    termino: new Date('2023-12-21'),
    status: 'Ativa',
    usos: '249 / 500'
  },
  {
    nome: 'Desconto Primeira Compra',
    codigo: 'WELCOME10',
    tipo: 'Percentual',
    valor: '10%',
    inicio: new Date('2023-01-01'),
    termino: new Date('2023-12-31'),
    status: 'Ativa',
    usos: '435 / ∞'
  }
];

// Função para obter a cor do status da promoção
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ativa':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Agendada':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Expirada':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function Promocoes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todas');
  const { toast } = useToast();
  const [, navigate] = useNavigate();

  // Use React Query para buscar as promoções
  const { data: promocoesData, isLoading } = useQuery({
    queryKey: ['/api/vendas/promocoes'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  const filteredPromocoes = promocoes.filter(promocao => {
    const matchesSearch = searchTerm === '' || 
      promocao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promocao.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'todas' || 
      (activeTab === 'ativas' && promocao.status === 'Ativa') ||
      (activeTab === 'agendadas' && promocao.status === 'Agendada') ||
      (activeTab === 'expiradas' && promocao.status === 'Expirada');
    
    return matchesSearch && matchesTab;
  });

  const handleCreatePromotion = () => {
    toast({
      title: "Nova promoção",
      description: "Criando nova promoção",
    });
  };

  const handleCopyCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast({
      title: "Código copiado",
      description: `O código ${codigo} foi copiado para a área de transferência`,
    });
  };

  const handleEditPromotion = (codigo: string) => {
    toast({
      title: "Editando promoção",
      description: `Editando promoção ${codigo}`,
    });
  };

  const handleDeletePromotion = (codigo: string) => {
    toast({
      title: "Confirmação necessária",
      description: `Deseja realmente excluir a promoção ${codigo}?`,
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Promoções</h1>
          <p className="text-muted-foreground">Gerencie promoções, descontos e cupons para seus clientes</p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={handleCreatePromotion}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Promoção
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar promoções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Tabs defaultValue="todas" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="ativas">Ativas</TabsTrigger>
                <TabsTrigger value="agendadas">Agendadas</TabsTrigger>
                <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Código</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Início</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Término</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Usos</th>
                  <th className="text-center py-3 px-4 text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromocoes.map((promocao, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{promocao.nome}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {promocao.codigo}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-1" 
                          onClick={() => handleCopyCode(promocao.codigo)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 px-4">{promocao.tipo}</td>
                    <td className="py-3 px-4">{promocao.valor}</td>
                    <td className="py-3 px-4">{format(promocao.inicio, 'dd/MM/yyyy')}</td>
                    <td className="py-3 px-4">{format(promocao.termino, 'dd/MM/yyyy')}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(promocao.status)}>
                        {promocao.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{promocao.usos}</td>
                    <td className="py-3 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopyCode(promocao.codigo)}>
                            <Copy className="h-4 w-4 mr-2" />
                            <span>Copiar código</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPromotion(promocao.codigo)}>
                            <Edit className="h-4 w-4 mr-2" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePromotion(promocao.codigo)} className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredPromocoes.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-muted-foreground">
                      Nenhuma promoção encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}