'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';
import { EquipmentForm } from '@/components/laboratory/equipment/EquipmentForm';

// Função auxiliar para formatar datas
const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
};

// Função auxiliar para status de equipamento
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return <Badge className="bg-green-500">Operacional</Badge>;
    case 'maintenance':
      return <Badge className="bg-yellow-500">Em Manutenção</Badge>;
    case 'out_of_service':
      return <Badge className="bg-red-500">Fora de Serviço</Badge>;
    case 'pending_validation':
      return <Badge className="bg-blue-500">Aguardando Validação</Badge>;
    default:
      return <Badge className="bg-gray-500">Indeterminado</Badge>;
  }
};

export default function Equipments() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Log para debugging
  console.log("Equipments component mounted");

  // Buscar lista de equipamentos
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/laboratory/equipments'],
    retry: 1,
  });

  // Mutação para adicionar equipamento
  const addEquipmentMutation = useMutation({
    mutationFn: (newEquipment: any) => {
      return apiRequest('/api/laboratory/equipments', {
        method: 'POST',
        data: newEquipment,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Equipamento adicionado com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/laboratory/equipments'] });
      setIsAddOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao adicionar equipamento:', error);
      toast({
        title: 'Erro ao adicionar equipamento',
        description: 'Ocorreu um erro ao adicionar o equipamento. Por favor, tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutação para atualizar equipamento
  const updateEquipmentMutation = useMutation({
    mutationFn: (updatedEquipment: any) => {
      return apiRequest(`/api/laboratory/equipments/${updatedEquipment.id}`, {
        method: 'PUT',
        data: updatedEquipment,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Equipamento atualizado com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/laboratory/equipments'] });
      setIsEditOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao atualizar equipamento:', error);
      toast({
        title: 'Erro ao atualizar equipamento',
        description: 'Ocorreu um erro ao atualizar o equipamento. Por favor, tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutação para excluir equipamento
  const deleteEquipmentMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/laboratory/equipments/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Equipamento excluído com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/laboratory/equipments'] });
      setIsDeleteOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao excluir equipamento:', error);
      toast({
        title: 'Erro ao excluir equipamento',
        description: 'Ocorreu um erro ao excluir o equipamento. Por favor, tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Verificar se há equipamentos com manutenção ou calibração próxima
  const equipmentsNeedingAttention = data?.equipments?.filter((equipment: any) => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    // Verificar se a próxima manutenção está dentro de 30 dias
    const nextMaintenance = equipment.nextMaintenanceDate ? new Date(equipment.nextMaintenanceDate) : null;
    const nextCalibration = equipment.nextCalibrationDate ? new Date(equipment.nextCalibrationDate) : null;
    
    return (nextMaintenance && nextMaintenance <= nextMonth) || 
           (nextCalibration && nextCalibration <= nextMonth);
  });

  // Funções de tratamento
  const handleAdd = (formData: any) => {
    addEquipmentMutation.mutate(formData);
  };

  const handleEdit = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsEditOpen(true);
  };

  const handleUpdate = (formData: any) => {
    updateEquipmentMutation.mutate({
      id: selectedEquipment.id,
      ...formData,
    });
  };

  const handleDelete = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEquipment) {
      deleteEquipmentMutation.mutate(selectedEquipment.id);
    }
  };

  const handleViewDetails = (equipment: any) => {
    navigate(`/laboratory/equipment/${equipment.id}`);
  };

  // Se estiver carregando, exibir skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Equipamentos do Laboratório</h1>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  // Se houver erro, exibir mensagem
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Erro ao carregar os equipamentos. Por favor, tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Equipamentos do Laboratório</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
              </DialogHeader>
              <EquipmentForm onSubmit={handleAdd} isLoading={addEquipmentMutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Alertas para equipamentos que precisam de atenção */}
        {equipmentsNeedingAttention && equipmentsNeedingAttention.length > 0 && (
          <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200 mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Atenção!</div>
              <div>
                {equipmentsNeedingAttention.length} equipamento(s) precisam de manutenção ou calibração nos próximos 30 dias.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabela de equipamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Equipamentos Cadastrados</CardTitle>
            <CardDescription>
              Lista de todos os equipamentos do laboratório, incluindo status e próximas datas de manutenção.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.equipments && data.equipments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Próxima Manutenção</TableHead>
                    <TableHead>Próxima Calibração</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.equipments.map((equipment: any) => (
                    <TableRow key={equipment.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(equipment)}>
                      <TableCell className="font-medium">{equipment.name}</TableCell>
                      <TableCell>{equipment.model}</TableCell>
                      <TableCell>{getStatusBadge(equipment.status)}</TableCell>
                      <TableCell>{equipment.location}</TableCell>
                      <TableCell>
                        {formatDate(equipment.nextMaintenanceDate)}
                        {equipment.nextMaintenanceDate && new Date(equipment.nextMaintenanceDate) < new Date(new Date().setMonth(new Date().getMonth() + 1)) && (
                          <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                            Em breve
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(equipment.nextCalibrationDate)}
                        {equipment.nextCalibrationDate && new Date(equipment.nextCalibrationDate) < new Date(new Date().setMonth(new Date().getMonth() + 1)) && (
                          <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                            Em breve
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(equipment)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(equipment)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-xl font-semibold mb-2">Nenhum equipamento cadastrado</p>
                <p className="text-gray-500 mb-6">Adicione equipamentos para gerenciar suas manutenções e calibrações.</p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Equipamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de edição */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Equipamento</DialogTitle>
            </DialogHeader>
            {selectedEquipment && (
              <EquipmentForm 
                onSubmit={handleUpdate} 
                isLoading={updateEquipmentMutation.isPending} 
                initialData={selectedEquipment}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmação de exclusão */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Tem certeza que deseja excluir o equipamento "{selectedEquipment?.name}"?</p>
              <p className="text-sm text-gray-500 mt-2">
                Esta ação não pode ser desfeita e também excluirá todos os registros de manutenção e certificados associados.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteEquipmentMutation.isPending}>
                {deleteEquipmentMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}