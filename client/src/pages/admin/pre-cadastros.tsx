import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone, 
  Building2, 
  User, 
  Mail, 
  Calendar,
  MessageSquare,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipo para o pré-cadastro conforme schema do banco de dados
interface PreCadastro {
  id: number;
  nome: string;
  email: string;
  organizacao: string;
  tipoOrganizacao: string;
  telefone?: string;
  cargo?: string;
  interesse: string;
  comentarios?: string;
  modulos?: string[];
  aceitaTermos: boolean;
  status: 'novo' | 'contatado' | 'convertido' | 'descartado';
  observacoes?: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  contatadoEm?: string;
  convertidoEm?: string;
  organizacaoId?: number;
}

export default function PreCadastrosAdmin() {
  const [selectedItem, setSelectedItem] = useState<PreCadastro | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'novo' | 'contatado' | 'convertido' | 'descartado'>('novo');
  const [observacoes, setObservacoes] = useState('');
  
  // Estado para controle de carregamento manual
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState(false);
  const [manualData, setManualData] = useState<PreCadastro[]>([]);

  // Função para buscar dados manualmente
  const fetchDataManually = async () => {
    setManualLoading(true);
    setManualError(false);
    
    try {
      console.log('Buscando pré-cadastros manualmente...');
      
      // Usando a rota de diagnóstico
      const response = await fetch('/api-diagnostic/pre-cadastros', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao buscar pré-cadastros:', response.status, errorText);
        throw new Error(`Falha ao buscar pré-cadastros: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      // Verificar o formato da resposta e ajustar conforme necessário
      if (data && data.recentEntries && Array.isArray(data.recentEntries.rows)) {
        // Formato da rota de diagnóstico
        const formattedData = data.recentEntries.rows.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          email: item.email,
          organizacao: item.organizacao,
          tipoOrganizacao: item.tipo_organizacao || '',
          telefone: item.telefone || '',
          cargo: item.cargo || '',
          interesse: item.interesse || '',
          comentarios: item.comentarios || '',
          modulos: Array.isArray(item.modulos) ? item.modulos : [],
          aceitaTermos: !!item.aceita_termos,
          status: item.status || 'novo',
          observacoes: item.observacoes || '',
          ip: item.ip || '',
          userAgent: item.user_agent || '',
          createdAt: item.created_at || new Date().toISOString(),
          contatadoEm: item.contatado_em,
          convertidoEm: item.convertido_em
        }));
        
        setManualData(formattedData);
      } else if (Array.isArray(data)) {
        // Formato direto de array
        const formattedData = data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          email: item.email,
          organizacao: item.organizacao,
          tipoOrganizacao: item.tipoOrganizacao || item.tipo_organizacao || '',
          telefone: item.telefone || '',
          cargo: item.cargo || '',
          interesse: item.interesse || '',
          comentarios: item.comentarios || '',
          modulos: Array.isArray(item.modulos) ? item.modulos : [],
          aceitaTermos: !!item.aceitaTermos || !!item.aceita_termos,
          status: item.status || 'novo',
          observacoes: item.observacoes || '',
          ip: item.ip || '',
          userAgent: item.userAgent || item.user_agent || '',
          createdAt: item.createdAt || item.created_at || new Date().toISOString(),
          contatadoEm: item.contatadoEm || item.contatado_em,
          convertidoEm: item.convertidoEm || item.convertido_em
        }));
        
        setManualData(formattedData);
      } else {
        console.error('Formato de dados inesperado:', data);
        throw new Error('Formato de dados inesperado');
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setManualError(true);
      const { toast } = useToast();
      toast({
        title: "Erro ao buscar dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setManualLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchDataManually();
  }, []);

  // Também manter o React Query para compatibilidade
  const { data: preCadastros, isLoading, isError, refetch } = useQuery<PreCadastro[]>({
    queryKey: ['/api-diagnostic/pre-cadastros'],
    queryFn: async () => {
      try {
        // Usando a rota de diagnóstico que sabemos que funciona
        const response = await fetch('/api-diagnostic/pre-cadastros', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro ao buscar pré-cadastros:', response.status, errorText);
          throw new Error(`Falha ao buscar pré-cadastros: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        
        // Se a resposta tem o formato esperado da nova rota
        if (data && data.recentEntries && Array.isArray(data.recentEntries.rows)) {
          // Converter o formato da resposta para o esperado pela interface
          return data.recentEntries.rows.map((item: any) => ({
            id: item.id,
            nome: item.nome,
            email: item.email,
            organizacao: item.organizacao,
            tipoOrganizacao: item.tipo_organizacao || '',
            telefone: item.telefone || '',
            cargo: item.cargo || '',
            interesse: item.interesse || '',
            comentarios: item.comentarios || '',
            modulos: item.modulos || [],
            aceitaTermos: !!item.aceita_termos,
            status: item.status || 'novo',
            observacoes: item.observacoes || '',
            ip: item.ip || '',
            userAgent: item.user_agent || '',
            createdAt: item.created_at || new Date().toISOString(),
            contatadoEm: item.contatado_em,
            convertidoEm: item.convertido_em
          }));
        }
        
        // Se chegou aqui, não temos o formato esperado
        console.error('Resposta da API não tem o formato esperado:', data);
        return [];
      } catch (error) {
        console.error('Exceção ao buscar pré-cadastros:', error);
        throw error;
      }
    },
    retry: 1 // Limitar a 1 tentativa
  });

  // Atualizar status do pré-cadastro
  const updateStatus = async () => {
    if (!selectedItem) return;
    
    try {
      // Usando a rota de diagnóstico para atualizar o status
      const response = await fetch(`/api-diagnostic/pre-cadastros/${selectedItem.id}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          observacoes: observacoes || ''
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar status');
      }
      
      toast({
        title: 'Status atualizado',
        description: `Pré-cadastro de ${selectedItem.nome} atualizado com sucesso.`,
      });
      
      // Recarregar dados após atualização
      await refetch();
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar o status. Tente novamente.',
        variant: 'destructive' as const,
      });
    }
  };

  const openUpdateDialog = (item: PreCadastro) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setObservacoes(item.observacoes || '');
    setIsUpdateDialogOpen(true);
  };

  // Definição das colunas para a tabela
  const columns: ColumnDef<PreCadastro>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 60,
    },
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <div className="font-medium">{row.original.nome}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {row.original.email}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "organizacao",
      header: "Organização",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <div className="font-medium">{row.original.organizacao}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {row.original.tipoOrganizacao}
              {row.original.cargo && (
                <>
                  <span className="mx-1">•</span>
                  <User className="h-3 w-3" />
                  {row.original.cargo}
                </>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "telefone",
      header: "Contato",
      cell: ({ row }) => {
        return row.original.telefone ? (
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            {row.original.telefone}
          </div>
        ) : (
          <span className="text-muted-foreground italic">Não informado</span>
        );
      },
    },
    {
      accessorKey: "interesse",
      header: "Interesse",
      cell: ({ row }) => {
        return (
          <div>
            <Badge variant="outline" className="text-xs">
              {row.original.interesse}
            </Badge>
            {row.original.modulos && row.original.modulos.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {row.original.modulos.map((modulo, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {modulo}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Data",
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(row.original.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {new Date(row.original.createdAt).toLocaleDateString('pt-BR')} às{' '}
                {new Date(row.original.createdAt).toLocaleTimeString('pt-BR')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        let statusIcon;
        let statusText;
        let variant: "default" | "outline" | "secondary" | "destructive" = "default";
        
        switch (row.original.status) {
          case 'novo':
            statusIcon = <Clock className="h-4 w-4" />;
            statusText = "Novo";
            variant = "outline";
            break;
          case 'contatado':
            statusIcon = <MessageSquare className="h-4 w-4" />;
            statusText = "Contatado";
            variant = "secondary";
            break;
          case 'convertido':
            statusIcon = <CheckCircle2 className="h-4 w-4" />;
            statusText = "Convertido";
            variant = "default";
            break;
          case 'descartado':
            statusIcon = <XCircle className="h-4 w-4" />;
            statusText = "Descartado";
            variant = "destructive";
            break;
        }
        
        return (
          <Badge variant={variant} className="flex items-center gap-1">
            {statusIcon}
            {statusText}
          </Badge>
        );
      },
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => {
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => openUpdateDialog(row.original)}
          >
            Atualizar
          </Button>
        );
      },
    },
  ];

  // Função para renderizar tabs com dados corretos (manual ou query)
  const renderTab = (statusFilter: PreCadastro['status'] | 'todos') => {
    // Usar os dados definidos acima
    const filteredData = statusFilter === 'todos' 
      ? dataToUse 
      : dataToUse.filter(item => item.status === statusFilter);
    
    return (
      <TabsContent value={statusFilter}>
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter === 'todos' ? 'Todos os pré-cadastros' : 
               statusFilter === 'novo' ? 'Novos pré-cadastros' :
               statusFilter === 'contatado' ? 'Pré-cadastros contatados' :
               statusFilter === 'convertido' ? 'Pré-cadastros convertidos' : 
               'Pré-cadastros descartados'}
            </CardTitle>
            <CardDescription>
              {filteredData.length} {filteredData.length === 1 ? 'registro' : 'registros'} encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={filteredData}
              searchField="nome"
              searchPlaceholder="Buscar por nome..."
            />
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  // Usar o estado de carregamento de qualquer uma das abordagens
  const isDataLoading = manualLoading || isLoading;
  const isDataError = (manualError || isError) && manualData.length === 0 && (!preCadastros || preCadastros.length === 0);
  
  // Função para recarregar dados
  const reloadData = () => {
    fetchDataManually();
    refetch();
  };
  
  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h2 className="text-xl font-medium ml-4">Carregando pré-cadastros...</h2>
      </div>
    );
  }

  // Se temos dados para exibir, não mostrar a tela de erro mesmo se houver erro
  if (isDataError && manualData.length === 0 && (!preCadastros || preCadastros.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar dados</h2>
        <p>Não foi possível buscar os pré-cadastros. Tente novamente mais tarde.</p>
        <Button onClick={reloadData} className="mt-4">Tentar novamente</Button>
      </div>
    );
  }

  // Usar dados do carregamento manual ou React Query
  const dataToUse = manualData.length > 0 ? manualData : (preCadastros || []);
  
  const counts = {
    todos: dataToUse.length || 0,
    novo: dataToUse.filter(item => item.status === 'novo').length || 0,
    contatado: dataToUse.filter(item => item.status === 'contatado').length || 0,
    convertido: dataToUse.filter(item => item.status === 'convertido').length || 0,
    descartado: dataToUse.filter(item => item.status === 'descartado').length || 0,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Pré-cadastros</h1>
          <p className="text-muted-foreground">
            Gerencie os pré-cadastros recebidos para o lançamento do sistema
          </p>
        </div>
        <Button onClick={() => refetch()}>Atualizar dados</Button>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">
            Todos <Badge variant="outline" className="ml-2">{counts.todos}</Badge>
          </TabsTrigger>
          <TabsTrigger value="novo">
            Novos <Badge variant="outline" className="ml-2">{counts.novo}</Badge>
          </TabsTrigger>
          <TabsTrigger value="contatado">
            Contatados <Badge variant="secondary" className="ml-2">{counts.contatado}</Badge>
          </TabsTrigger>
          <TabsTrigger value="convertido">
            Convertidos <Badge className="ml-2">{counts.convertido}</Badge>
          </TabsTrigger>
          <TabsTrigger value="descartado">
            Descartados <Badge variant="destructive" className="ml-2">{counts.descartado}</Badge>
          </TabsTrigger>
        </TabsList>
        
        {renderTab('todos')}
        {renderTab('novo')}
        {renderTab('contatado')}
        {renderTab('convertido')}
        {renderTab('descartado')}
      </Tabs>

      {/* Dialog para atualizar status */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status do Pré-cadastro</DialogTitle>
            <DialogDescription>
              {selectedItem && (
                <div className="mt-2">
                  <div className="font-medium">{selectedItem.nome}</div>
                  <div className="text-sm">{selectedItem.email}</div>
                  <div className="text-sm">{selectedItem.organizacao}</div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newStatus} 
                onValueChange={(value) => setNewStatus(value as PreCadastro['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contatado">Contatado</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                  <SelectItem value="descartado">Descartado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre este pré-cadastro..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateStatus}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}