import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, MailCheck, Loader, AlertTriangle, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

// Esquema de validação do formulário
const formSchema = z.object({
  organizationId: z.string().min(1, 'Selecione uma organização'),
  planId: z.string().min(1, 'Selecione um plano'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório')
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Página para gerar um link de pagamento por email
 */
export default function ConfirmarPagamento() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({
    loading: false
  });
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Inicializar o formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: '',
      planId: '',
      email: '',
      name: ''
    }
  });

  // Função para buscar organizações
  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const response = await axios.get('/api/organizations');
      setOrganizations(response.data.organizations || []);
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  // Função para buscar planos disponíveis
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await axios.get('/api/plans');
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Função para obter detalhes da organização
  const fetchOrganizationDetails = async (orgId: string) => {
    if (!orgId) return;
    
    try {
      const response = await axios.get(`/api/organizations/${orgId}`);
      const org = response.data.organization;
      
      if (org) {
        form.setValue('name', org.name || '');
        form.setValue('email', org.email || '');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da organização:', error);
    }
  };

  // Observar mudanças no campo de organização
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'organizationId' && value.organizationId) {
        fetchOrganizationDetails(value.organizationId as string);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Carregar organizações e planos ao iniciar a página
  useEffect(() => {
    fetchOrganizations();
    fetchPlans();
  }, []);

  // Função para enviar o formulário
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setStatus({ loading: true });
    
    try {
      const response = await axios.post('/api/payment-email/generate', {
        organizationId: parseInt(values.organizationId, 10),
        planId: parseInt(values.planId, 10),
        email: values.email,
        name: values.name
      });
      
      setStatus({
        loading: false,
        success: response.data.success,
        message: response.data.message
      });
      
      if (response.data.success) {
        // Resetar formulário em caso de sucesso
        form.reset();
      }
    } catch (error: any) {
      console.error('Erro ao gerar link de pagamento:', error);
      setStatus({
        loading: false,
        success: false,
        message: error.response?.data?.message || 'Erro ao gerar link de pagamento. Por favor, tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="w-full shadow-lg">
          <CardHeader className="bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center mb-2">
              <img src="/assets/logo.svg" alt="Endurancy Logo" className="h-8 mr-2" />
              <CardTitle className="text-2xl">Gerar Link de Pagamento</CardTitle>
            </div>
            <CardDescription>
              Envie um link de pagamento por email para que a organização possa assinar um plano.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {status.message && (
              <Alert 
                className={status.success 
                  ? "bg-green-50 border-green-200 mb-4" 
                  : "bg-red-50 border-red-200 mb-4"
                }
              >
                {status.success ? (
                  <MailCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <AlertTitle className={status.success ? "text-green-800" : "text-red-800"}>
                  {status.success ? "Email Enviado" : "Erro no Envio"}
                </AlertTitle>
                <AlertDescription className={status.success ? "text-green-700" : "text-red-700"}>
                  {status.message}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organização</FormLabel>
                      <FormControl>
                        <Select
                          disabled={loadingOrgs || isSubmitting}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={loadingOrgs ? "Carregando..." : "Selecione uma organização"} />
                          </SelectTrigger>
                          <SelectContent>
                            {organizations.map((org) => (
                              <SelectItem key={org.id} value={org.id.toString()}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano</FormLabel>
                      <FormControl>
                        <Select
                          disabled={loadingPlans || isSubmitting}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={loadingPlans ? "Carregando..." : "Selecione um plano"} />
                          </SelectTrigger>
                          <SelectContent>
                            {plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id.toString()}>
                                {plan.name} - R$ {parseFloat(plan.price).toFixed(2).replace('.', ',')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Nome do cliente" 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email para Envio</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="email@exemplo.com" 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Gerar Link e Enviar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="pt-2 pb-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin/dashboard')}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar ao Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}