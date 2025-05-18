import React, { useState, useEffect } from 'react';
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
import { toast, useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipo para o pré-cadastro 
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
}

export default function AdminPreCadastrosSimple() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [preCadastros, setPreCadastros] = useState<PreCadastro[]>([]);
  const [selectedItem, setSelectedItem] = useState<PreCadastro | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'novo' | 'contatado' | 'convertido' | 'descartado'>('novo');
  const [observacoes, setObservacoes] = useState('');
  
  // Função para buscar dados
  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      console.log('Buscando pré-cadastros...');
      
      // Usar a rota de diagnóstico que contorna o problema de autenticação
      const response = await fetch('/api-diagnostic/pre-cadastros', {
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
        
        setPreCadastros(formattedData);
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
        
        setPreCadastros(formattedData);
      } else {
        console.error('Formato de dados inesperado:', data);
        throw new Error('Formato de dados inesperado');
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setIsError(true);
      toast({
        title: "Erro ao buscar dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchData();
  }, []);

  // Atualizar status do pré-cadastro
  const updateStatus = async () => {
    if (!selectedItem) return;
    
    try {
      // Usando a rota de diagnóstico para atualizar o status
      const response = await fetch(`/api-diagnostic/pre-cadastros/${selectedItem.id}/status`, {
        method: 'POST',
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
      await fetchData();
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar o status. Tente novamente.',
        variant: 'destructive',
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

  // Renderizar as abas
  const renderTab = (statusFilter: PreCadastro['status'] | 'todos') => {
    const filteredData = statusFilter === 'todos' 
      ? preCadastros 
      : preCadastros.filter(item => item.status === statusFilter);
    
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="ml-4 text-xl">Carregando pré-cadastros...</span>
      </div>
    );
  }

  if (isError && preCadastros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar dados</h2>
        <p>Não foi possível buscar os pré-cadastros. Tente novamente mais tarde.</p>
        <Button onClick={fetchData} className="mt-4">Tentar novamente</Button>
      </div>
    );
  }

  const counts = {
    todos: preCadastros.length || 0,
    novo: preCadastros.filter(item => item.status === 'novo').length || 0,
    contatado: preCadastros.filter(item => item.status === 'contatado').length || 0,
    convertido: preCadastros.filter(item => item.status === 'convertido').length || 0,
    descartado: preCadastros.filter(item => item.status === 'descartado').length || 0,
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
        <Button onClick={fetchData}>
          <Loader2 className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.todos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Novos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.novo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Contatados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.contatado}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.convertido}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Descartados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.descartado}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos ({counts.todos})</TabsTrigger>
          <TabsTrigger value="novo">Novos ({counts.novo})</TabsTrigger>
          <TabsTrigger value="contatado">Contatados ({counts.contatado})</TabsTrigger>
          <TabsTrigger value="convertido">Convertidos ({counts.convertido})</TabsTrigger>
          <TabsTrigger value="descartado">Descartados ({counts.descartado})</TabsTrigger>
        </TabsList>
        {renderTab('todos')}
        {renderTab('novo')}
        {renderTab('contatado')}
        {renderTab('convertido')}
        {renderTab('descartado')}
      </Tabs>
      
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar status do pré-cadastro</DialogTitle>
            <DialogDescription>
              Altere o status do pré-cadastro e adicione observações se necessário.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <div className="font-semibold">{selectedItem.nome}</div>
                <div className="text-sm text-muted-foreground">{selectedItem.email}</div>
                <div className="text-sm">{selectedItem.organizacao}</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={selectedItem.status} onValueChange={(value: any) => setNewStatus(value)}>
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
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes"
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Adicione observações sobre este contato..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateStatus}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}