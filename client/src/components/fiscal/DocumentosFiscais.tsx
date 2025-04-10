import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Printer, FileX, Search, Receipt, FileText } from 'lucide-react';
import { apiRequest, queryClient } from '../../lib/queryClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentosFiscaisProps {
  organizationId: number;
  className?: string;
}

export default function DocumentosFiscais({ organizationId, className = '' }: DocumentosFiscaisProps) {
  const { toast } = useToast();
  const [selectedDocumentId, setSelectedDocumentId] = React.useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  
  // Consulta todos os documentos fiscais da organização
  const documentosQuery = useQuery({
    queryKey: ['/api/fiscal/documents', organizationId],
    queryFn: () => apiRequest(`/api/fiscal/documents/${organizationId}`, 'GET'),
    enabled: Boolean(organizationId),
  });
  
  // Consulta os detalhes de um documento específico quando selecionado
  const documentoDetalhesQuery = useQuery({
    queryKey: ['/api/fiscal/documents/detail', selectedDocumentId],
    queryFn: () => apiRequest(`/api/fiscal/documents/detail/${selectedDocumentId}`, 'GET'),
    enabled: Boolean(selectedDocumentId),
  });
  
  // Mutação para cancelar um documento fiscal
  const cancelarDocumentoMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number, reason: string }) => {
      return apiRequest(`/api/fiscal/documents/${id}/cancel`, 'PUT', { cancelReason: reason });
    },
    onSuccess: () => {
      toast({
        title: 'Documento cancelado com sucesso',
        description: 'O documento fiscal foi cancelado.',
      });
      
      // Fecha o diálogo e atualiza as consultas
      setCancelOpen(false);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['/api/fiscal/documents'] });
      
      if (selectedDocumentId) {
        queryClient.invalidateQueries({ queryKey: ['/api/fiscal/documents/detail', selectedDocumentId] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cancelar documento',
        description: error.message || 'Ocorreu um erro ao tentar cancelar o documento fiscal.',
        variant: 'destructive',
      });
    },
  });
  
  // Manipulador para abrir o diálogo de detalhes
  const handleOpenDetails = (id: number) => {
    setSelectedDocumentId(id);
    setDetailsOpen(true);
  };
  
  // Manipulador para abrir o diálogo de cancelamento
  const handleOpenCancel = (id: number) => {
    setSelectedDocumentId(id);
    setCancelOpen(true);
  };
  
  // Manipulador para confirmar o cancelamento
  const handleCancelDocument = () => {
    if (!selectedDocumentId || !cancelReason) return;
    
    cancelarDocumentoMutation.mutate({
      id: selectedDocumentId,
      reason: cancelReason,
    });
  };
  
  // Função auxiliar para formatar o tipo do documento
  const formatDocumentType = (type: string) => {
    switch (type) {
      case 'cupom_fiscal': return 'Cupom Fiscal';
      case 'nfce': return 'NFC-e';
      case 'nfe': return 'NF-e';
      case 'nfse': return 'NFS-e';
      default: return type;
    }
  };
  
  // Função auxiliar para obter a cor da badge de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emitida': return 'success';
      case 'cancelada': return 'destructive';
      case 'pendente': return 'warning';
      default: return 'secondary';
    }
  };
  
  // Função auxiliar para formatar uma data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  // Renderiza o conteúdo com base no estado da consulta
  if (documentosQuery.isLoading) {
    return <div className="text-center p-4">Carregando documentos fiscais...</div>;
  }
  
  if (documentosQuery.isError) {
    return (
      <div className="text-center p-4 text-red-500">
        Erro ao carregar documentos fiscais. Por favor, tente novamente.
      </div>
    );
  }
  
  if (!documentosQuery.data || !documentosQuery.data.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Documentos Fiscais</CardTitle>
          <CardDescription>Nenhum documento fiscal emitido até o momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Documentos Fiscais</CardTitle>
        <CardDescription>Documentos fiscais emitidos pela sua organização.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data de Emissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentosQuery.data.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.documentNumber}</TableCell>
                  <TableCell>{formatDocumentType(doc.type)}</TableCell>
                  <TableCell>{doc.customerName || 'Consumidor Final'}</TableCell>
                  <TableCell>R$ {Number(doc.totalAmount).toFixed(2)}</TableCell>
                  <TableCell>{formatDate(doc.issuedAt)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(doc.status) as any}>
                      {doc.status === 'emitida' ? 'Emitida' : 
                       doc.status === 'cancelada' ? 'Cancelada' : 
                       doc.status === 'pendente' ? 'Pendente' : doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenDetails(doc.id)}
                        title="Ver detalhes"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      
                      {doc.status === 'emitida' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenCancel(doc.id)}
                          title="Cancelar documento"
                        >
                          <FileX className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Reimprimir"
                        // Esta funcionalidade seria implementada posteriormente
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Diálogo de detalhes do documento */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Documento Fiscal</DialogTitle>
              <DialogDescription>
                Informações completas sobre o documento fiscal.
              </DialogDescription>
            </DialogHeader>
            
            {documentoDetalhesQuery.isLoading && (
              <div className="text-center p-4">Carregando detalhes...</div>
            )}
            
            {documentoDetalhesQuery.isError && (
              <div className="text-center p-4 text-red-500">
                Erro ao carregar detalhes do documento.
              </div>
            )}
            
            {documentoDetalhesQuery.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Número</h4>
                    <p>{documentoDetalhesQuery.data.documentNumber}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Tipo</h4>
                    <p>{formatDocumentType(documentoDetalhesQuery.data.type)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Cliente</h4>
                    <p>{documentoDetalhesQuery.data.customerName || 'Consumidor Final'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">CPF/CNPJ</h4>
                    <p>{documentoDetalhesQuery.data.customerDocument || 'Não informado'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Data de Emissão</h4>
                    <p>{formatDate(documentoDetalhesQuery.data.issuedAt)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Status</h4>
                    <Badge variant={getStatusColor(documentoDetalhesQuery.data.status) as any}>
                      {documentoDetalhesQuery.data.status === 'emitida' ? 'Emitida' : 
                       documentoDetalhesQuery.data.status === 'cancelada' ? 'Cancelada' : 
                       documentoDetalhesQuery.data.status === 'pendente' ? 'Pendente' : documentoDetalhesQuery.data.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">Valor Total</h4>
                    <p>R$ {Number(documentoDetalhesQuery.data.totalAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Método de Pagamento</h4>
                    <p>{documentoDetalhesQuery.data.paymentMethod || 'Não informado'}</p>
                  </div>
                </div>
                
                {documentoDetalhesQuery.data.status === 'cancelada' && (
                  <div>
                    <h4 className="font-medium">Motivo do Cancelamento</h4>
                    <p>{documentoDetalhesQuery.data.cancelReason}</p>
                    <p className="text-sm text-gray-500">
                      Cancelado em: {formatDate(documentoDetalhesQuery.data.canceledAt)}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Itens do Documento</h4>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Preço Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documentoDetalhesQuery.data.items && documentoDetalhesQuery.data.items.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">R$ {Number(item.unitPrice).toFixed(2)}</TableCell>
                            <TableCell className="text-right">R$ {Number(item.totalPrice).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDetailsOpen(false)}
              >
                Fechar
              </Button>
              
              {documentoDetalhesQuery.data && documentoDetalhesQuery.data.status === 'emitida' && (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setDetailsOpen(false);
                    setTimeout(() => {
                      handleOpenCancel(documentoDetalhesQuery.data.id);
                    }, 100);
                  }}
                >
                  <FileX className="mr-2 h-4 w-4" />
                  Cancelar Documento
                </Button>
              )}
              
              {documentoDetalhesQuery.data && (
                <Button 
                  onClick={() => {
                    // Reimpressão seria implementada posteriormente
                    toast({
                      title: 'Reimpressão',
                      description: 'Documento enviado para impressão.',
                    });
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Reimprimir
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de cancelamento de documento */}
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cancelar Documento Fiscal</DialogTitle>
              <DialogDescription>
                Insira o motivo para o cancelamento deste documento fiscal.
                O cancelamento não pode ser desfeito.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="cancelReason" className="text-sm font-medium">
                  Motivo do Cancelamento
                </label>
                <textarea
                  id="cancelReason"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  placeholder="Descreva o motivo do cancelamento..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setCancelOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelDocument}
                disabled={!cancelReason || cancelarDocumentoMutation.isPending}
              >
                {cancelarDocumentoMutation.isPending ? (
                  'Processando...'
                ) : (
                  <>
                    <FileX className="mr-2 h-4 w-4" />
                    Confirmar Cancelamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}