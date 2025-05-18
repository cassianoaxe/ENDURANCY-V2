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
  const { toast } = useToast();
  
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
      toast({
        title: "Erro ao buscar dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido"
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
      fetchDataManually();
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar o status. Tente novamente.'
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

  // Determinar qual conjunto de dados usar
  const dataToUse = manualData.length > 0 ? manualData : (preCadastros || []);
  
  // Função para renderizar tabs com dados corretos
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
        <h2 className="text-xl ml-4">Carregando pré-cadastros...</h2>
      </div>
    );
  }
  
  if (isDataError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <XCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-xl mb-4">Erro ao carregar pré-cadastros</h2>
        <p className="text-muted-foreground mb-4">Não foi possível obter os dados do servidor.</p>
        <Button onClick={reloadData}>Tentar novamente</Button>
      </div>
    );
  }
  
  const counts = {
    todos: dataToUse.length || 0,
    novo: dataToUse.filter(item => item.status === 'novo').length || 0,
    contatado: dataToUse.filter(item => item.status === 'contatado').length || 0,
    convertido: dataToUse.filter(item => item.status === 'convertido').length || 0,
    descartado: dataToUse.filter(item => item.status === 'descartado').length || 0,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pré-cadastros</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <p className="text-muted-foreground">
          Gerencie os pré-cadastros realizados através do formulário de contato.
        </p>
        <Button onClick={reloadData} size="sm">
          Atualizar dados
        </Button>
      </div>
      
      <Tabs defaultValue="todos" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">
            Todos ({counts.todos})
          </TabsTrigger>
          <TabsTrigger value="novo">
            Novos ({counts.novo})
          </TabsTrigger>
          <TabsTrigger value="contatado">
            Contatados ({counts.contatado})
          </TabsTrigger>
          <TabsTrigger value="convertido">
            Convertidos ({counts.convertido})
          </TabsTrigger>
          <TabsTrigger value="descartado">
            Descartados ({counts.descartado})
          </TabsTrigger>
        </TabsList>
        
        {renderTab('todos')}
        {renderTab('novo')}
        {renderTab('contatado')}
        {renderTab('convertido')}
        {renderTab('descartado')}
      </Tabs>
      
      {/* Diálogo para atualizar status */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Pré-cadastro</DialogTitle>
            <DialogDescription>
              Atualize o status do pré-cadastro de {selectedItem?.nome}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={newStatus} 
                onValueChange={(value) => setNewStatus(value as 'novo' | 'contatado' | 'convertido' | 'descartado')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contatado">Contatado</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                  <SelectItem value="descartado">Descartado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="observacoes" className="text-right">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="col-span-3"
                placeholder="Notas sobre o contato ou outras informações relevantes"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateStatus}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}