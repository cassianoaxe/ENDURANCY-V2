import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface Organization {
  id: number;
  name: string;
}

interface Patient {
  id: number;
  name: string;
  dateOfBirth?: string;
  gender?: string;
  cpf?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
}

interface PrescriptionFormData {
  patientId: number;
  organizationId: number;
  productId: number;
  dosage: string;
  instructions: string;
  duration: string;
  notes?: string;
}

export function PrescriptionForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<PrescriptionFormData>();
  
  // Fetch doctor organizations
  const { data: organizations, isLoading: isLoadingOrgs } = useQuery({ 
    queryKey: ['/api/doctor/organizations'],
    enabled: true,
  });
  
  // Fetch patients based on selected organization
  const { data: patients, isLoading: isLoadingPatients } = useQuery({ 
    queryKey: ['/api/doctor/organizations', selectedOrg, 'patients'],
    queryFn: () => selectedOrg ? apiRequest(`/api/doctor/organizations/${selectedOrg}/patients`) : null,
    enabled: !!selectedOrg,
  });
  
  // Fetch products based on selected organization
  const { data: products, isLoading: isLoadingProducts } = useQuery({ 
    queryKey: ['/api/doctor/organizations', selectedOrg, 'products'],
    queryFn: () => selectedOrg ? apiRequest(`/api/doctor/organizations/${selectedOrg}/products`) : null,
    enabled: !!selectedOrg,
  });
  
  // Handle organization change
  const handleOrgChange = (orgId: string) => {
    const id = parseInt(orgId);
    setSelectedOrg(id);
    setValue('organizationId', id);
    // Reset patient and product selections when org changes
    setValue('patientId', undefined as any);
    setValue('productId', undefined as any);
  };
  
  // Create prescription mutation
  const createPrescription = useMutation({
    mutationFn: (data: PrescriptionFormData) => apiRequest('/api/doctor/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: 'Prescrição criada com sucesso',
        description: 'A prescrição foi enviada para revisão farmacêutica',
        variant: 'default',
      });
      reset(); // Reset form
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/doctor/prescriptions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar prescrição',
        description: error.message || 'Ocorreu um erro ao criar a prescrição',
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = (data: PrescriptionFormData) => {
    createPrescription.mutate(data);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nova Prescrição</CardTitle>
        <CardDescription>Crie uma nova prescrição para um paciente</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="prescription-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organização</Label>
              <Select 
                onValueChange={handleOrgChange} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a organização" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingOrgs ? (
                    <SelectItem value="loading" disabled>Carregando organizações...</SelectItem>
                  ) : (
                    organizations?.map((org: Organization) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.organizationId && <p className="text-sm text-red-500">Organização é obrigatória</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patient">Paciente</Label>
              <Select 
                onValueChange={(value) => setValue('patientId', parseInt(value))} 
                disabled={!selectedOrg || isLoadingPatients}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPatients ? (
                    <SelectItem value="loading" disabled>Carregando pacientes...</SelectItem>
                  ) : patients?.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhum paciente encontrado</SelectItem>
                  ) : (
                    patients?.map((patient: Patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name} {patient.cpf ? `(CPF: ${patient.cpf})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.patientId && <p className="text-sm text-red-500">Paciente é obrigatório</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product">Produto</Label>
              <Select 
                onValueChange={(value) => setValue('productId', parseInt(value))} 
                disabled={!selectedOrg || isLoadingProducts}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProducts ? (
                    <SelectItem value="loading" disabled>Carregando produtos...</SelectItem>
                  ) : products?.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhum produto encontrado</SelectItem>
                  ) : (
                    products?.map((product: Product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.productId && <p className="text-sm text-red-500">Produto é obrigatório</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosagem</Label>
              <Input 
                id="dosage"
                placeholder="Ex: 10mg, 2 comprimidos, etc."
                {...register('dosage', { required: 'Dosagem é obrigatória' })}
              />
              {errors.dosage && <p className="text-sm text-red-500">{errors.dosage.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Instruções de Uso</Label>
              <Textarea 
                id="instructions"
                placeholder="Ex: Tomar 1 comprimido a cada 8 horas"
                {...register('instructions', { required: 'Instruções são obrigatórias' })}
              />
              {errors.instructions && <p className="text-sm text-red-500">{errors.instructions.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duração do Tratamento</Label>
              <Input 
                id="duration"
                placeholder="Ex: 7 dias, 2 semanas, etc."
                {...register('duration', { required: 'Duração é obrigatória' })}
              />
              {errors.duration && <p className="text-sm text-red-500">{errors.duration.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea 
                id="notes"
                placeholder="Observações adicionais para o farmacêutico ou paciente"
                {...register('notes')}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => reset()}>Limpar</Button>
        <Button 
          type="submit" 
          form="prescription-form" 
          disabled={createPrescription.isPending}
        >
          {createPrescription.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : "Criar Prescrição"}
        </Button>
      </CardFooter>
    </Card>
  );
}