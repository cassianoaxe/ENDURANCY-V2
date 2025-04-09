import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, ShoppingCart, ExternalLink, FileText, AlertCircle, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';

interface Prescription {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName: string;
  organizationId: number;
  organizationName: string;
  productId: number;
  productName: string;
  productDescription?: string;
  productPrice?: number;
  productImage?: string;
  dosage: string;
  instructions: string;
  duration: string;
  status: 'approved' | 'pending' | 'rejected';
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  approvalDate?: string;
}

export function PatientPrescriptionList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Fetch patient prescriptions
  const prescriptionsQuery = useQuery({
    queryKey: ['/api/patient/prescriptions'],
    queryFn: () => apiRequest('/api/patient/prescriptions'),
    enabled: true,
  });
  
  // Create order mutation
  const createOrder = useMutation({
    mutationFn: (data: { prescriptionId: number, quantity: number }) => 
      apiRequest('/api/patient/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      toast({
        title: 'Pedido criado com sucesso!',
        description: 'Seu pedido foi registrado e está sendo processado',
        variant: 'default',
      });
      setOrderDialogOpen(false);
      setSelectedPrescription(null);
      setQuantity(1);
      
      // If there's a payment URL, redirect to it
      if (data && data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/patient/prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patient/orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar pedido',
        description: error.message || 'Ocorreu um erro ao processar seu pedido',
        variant: 'destructive',
      });
    }
  });
  
  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Em análise</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Generate PDF of the prescription
  const generatePrescriptionPDF = (prescription: Prescription) => {
    try {
      const doc = new jsPDF();
      
      // Set up the PDF with styling
      doc.setFontSize(20);
      doc.text('Prescrição Médica', 105, 20, { align: 'center' });
      
      // Add organization logo/header
      doc.setFontSize(16);
      doc.text(prescription.organizationName, 105, 30, { align: 'center' });
      
      // Add line separator
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 35, 190, 35);
      
      // Patient information
      doc.setFontSize(12);
      doc.text('Informações do Paciente', 20, 45);
      doc.setFontSize(10);
      doc.text(`Nome: ${prescription.patientName || 'Não especificado'}`, 20, 55);
      doc.text(`Prescrição #: ${prescription.id}`, 20, 60);
      doc.text(`Data: ${format(new Date(prescription.createdAt), 'dd/MM/yyyy', { locale: ptBR })}`, 20, 65);
      
      // Doctor information
      doc.setFontSize(12);
      doc.text('Médico Responsável', 20, 80);
      doc.setFontSize(10);
      doc.text(`Dr(a). ${prescription.doctorName}`, 20, 90);
      doc.text(`Clínica: ${prescription.organizationName}`, 20, 95);
      
      // Prescription details
      doc.setFontSize(12);
      doc.text('Detalhes da Prescrição', 20, 110);
      doc.setFontSize(10);
      doc.text(`Produto: ${prescription.productName}`, 20, 120);
      doc.text(`Dosagem: ${prescription.dosage}`, 20, 125);
      doc.text(`Duração: ${prescription.duration}`, 20, 130);
      
      // Instructions
      doc.setFontSize(12);
      doc.text('Instruções de Uso', 20, 145);
      doc.setFontSize(10);
      
      // Handle wrapping text for longer instructions
      const instructions = prescription.instructions;
      const splitInstructions = doc.splitTextToSize(instructions, 170);
      doc.text(splitInstructions, 20, 155);
      
      // Status information
      doc.setFontSize(12);
      let yPosition = 155 + (splitInstructions.length * 5);
      doc.text('Status', 20, yPosition);
      doc.setFontSize(10);
      
      // Show different information based on status
      if (prescription.status === 'approved') {
        doc.text(`Aprovada em: ${prescription.approvalDate ? 
          format(new Date(prescription.approvalDate), 'dd/MM/yyyy', { locale: ptBR }) : 
          'Data não registrada'}`, 20, yPosition + 10);
      } else if (prescription.status === 'rejected') {
        doc.text(`Rejeitada: ${prescription.rejectionReason || 'Sem motivo específico'}`, 20, yPosition + 10);
      } else {
        doc.text('Em análise pelo farmacêutico', 20, yPosition + 10);
      }
      
      // Notes if available
      if (prescription.notes) {
        yPosition += 20;
        doc.setFontSize(12);
        doc.text('Observações', 20, yPosition);
        doc.setFontSize(10);
        const splitNotes = doc.splitTextToSize(prescription.notes, 170);
        doc.text(splitNotes, 20, yPosition + 10);
      }
      
      // Footer
      doc.setFontSize(8);
      doc.text('Este documento é uma prescrição médica oficial.', 105, 280, { align: 'center' });
      
      // Save with prescription ID and date
      const fileName = `prescricao_${prescription.id}_${format(new Date(), 'ddMMyyyy')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: 'PDF gerado com sucesso',
        description: `O arquivo ${fileName} foi baixado`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o arquivo PDF da prescrição',
        variant: 'destructive',
      });
    }
  };
  
  // Filter prescriptions by search term and status
  const filteredPrescriptions = prescriptionsQuery.data
    ? prescriptionsQuery.data.filter((prescription: Prescription) => {
        // Text search filter
        const matchesSearch = !searchTerm || 
          prescription.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];
  
  // Handle opening the order dialog
  const handleOrderPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setOrderDialogOpen(true);
  };
  
  // Handle creating an order
  const handleCreateOrder = () => {
    if (!selectedPrescription) return;
    
    createOrder.mutate({
      prescriptionId: selectedPrescription.id,
      quantity: quantity
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Minhas Prescrições</CardTitle>
        <CardDescription>Visualize e adquira produtos das suas prescrições médicas aprovadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por produto ou médico..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={statusFilter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Todas
            </Button>
            <Button 
              variant={statusFilter === 'pending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('pending')}
              className="flex items-center gap-1 text-yellow-600"
            >
              <Clock className="h-4 w-4" />
              Em análise
            </Button>
            <Button 
              variant={statusFilter === 'approved' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('approved')}
              className="flex items-center gap-1 text-green-600"
            >
              <FileText className="h-4 w-4" />
              Aprovadas
            </Button>
            <Button 
              variant={statusFilter === 'rejected' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('rejected')}
              className="flex items-center gap-1 text-red-600"
            >
              <AlertCircle className="h-4 w-4" />
              Rejeitadas
            </Button>
          </div>
        </div>

        {prescriptionsQuery.isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : prescriptionsQuery.isError ? (
          <div className="p-4 border rounded-md bg-red-50 text-red-800">
            Erro ao carregar prescrições. Por favor, tente novamente.
          </div>
        ) : filteredPrescriptions?.length === 0 ? (
          <div className="p-4 border rounded-md text-center">
            Nenhuma prescrição encontrada.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médico</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions?.map((prescription: Prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell>{prescription.doctorName}</TableCell>
                    <TableCell>{prescription.productName}</TableCell>
                    <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                    <TableCell>
                      {format(new Date(prescription.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedPrescription(prescription)}
                        >
                          Detalhes
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generatePrescriptionPDF(prescription)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        
                        {prescription.status === 'approved' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleOrderPrescription(prescription)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Adquirir
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Prescription Details Dialog */}
        <Dialog open={!!selectedPrescription && !orderDialogOpen} onOpenChange={(open) => !open && setSelectedPrescription(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Prescrição</DialogTitle>
              <DialogDescription>
                Prescrito em {selectedPrescription && format(new Date(selectedPrescription.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPrescription && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="mt-1">{getStatusBadge(selectedPrescription.status)}</div>
                  </div>
                  
                  {selectedPrescription.approvalDate && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Data de aprovação</h4>
                      <p>{format(new Date(selectedPrescription.approvalDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium">Informações do Médico</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p>{selectedPrescription.doctorName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Organização</p>
                      <p>{selectedPrescription.organizationName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium">Detalhes da Prescrição</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Produto</p>
                      <p>{selectedPrescription.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dosagem</p>
                      <p>{selectedPrescription.dosage}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Instruções</p>
                      <p>{selectedPrescription.instructions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duração</p>
                      <p>{selectedPrescription.duration}</p>
                    </div>
                  </div>
                </div>
                
                {selectedPrescription.notes && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium">Observações</h4>
                    <p className="mt-2 whitespace-pre-line">{selectedPrescription.notes}</p>
                  </div>
                )}
                
                <DialogFooter className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedPrescription(null)}
                  >
                    Fechar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => generatePrescriptionPDF(selectedPrescription)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                  
                  {selectedPrescription.status === 'approved' && (
                    <Button 
                      onClick={() => {
                        setOrderDialogOpen(true);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Adquirir Produto
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Order Dialog */}
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adquirir Produto Prescrito</DialogTitle>
              <DialogDescription>
                Complete seu pedido para o produto prescrito
              </DialogDescription>
            </DialogHeader>
            
            {selectedPrescription && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-4">
                  {selectedPrescription.productImage && (
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img 
                        src={selectedPrescription.productImage} 
                        alt={selectedPrescription.productName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedPrescription.productName}</h3>
                    {selectedPrescription.productDescription && (
                      <p className="text-sm text-muted-foreground">
                        {selectedPrescription.productDescription}
                      </p>
                    )}
                    {selectedPrescription.productPrice && (
                      <p className="text-lg font-semibold mt-1">
                        R$ {selectedPrescription.productPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <Input 
                      id="quantity"
                      type="number"
                      min="1"
                      className="w-20 text-center"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      R$ {selectedPrescription.productPrice 
                        ? (selectedPrescription.productPrice * quantity).toFixed(2) 
                        : '0.00'}
                    </span>
                  </div>
                </div>
                
                <DialogFooter className="flex justify-between items-center sm:justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setOrderDialogOpen(false);
                      setQuantity(1);
                    }}
                  >
                    Cancelar
                  </Button>
                  
                  <Button 
                    onClick={handleCreateOrder}
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Finalizar Pedido
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}