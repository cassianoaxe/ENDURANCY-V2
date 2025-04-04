import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertPlan, Plan, planTierEnum, Module } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle,
  ArrowLeft, 
  Loader2, 
  Plus, 
  Save,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Estender o schema de inserção com validações adicionais
const planFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  tier: z.enum(["free", "seed", "grow", "pro"]),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  price: z.string().refine(val => !isNaN(Number(val)), {
    message: "O preço deve ser um número válido"
  }),
  maxRecords: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "O limite de registros deve ser um número positivo"
  }),
  trialDays: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Os dias de teste devem ser um número não negativo"
  }),
  features: z.array(z.string()).min(1, "Adicione pelo menos uma funcionalidade"),
  isModulePlan: z.boolean().default(false),
  moduleId: z.string().optional(),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

export default function EditPlan() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Extrair ID do plano da URL
  // Formato esperado: /plans/123/edit
  const pathParts = window.location.pathname.split('/');
  const planId = pathParts.length >= 3 ? parseInt(pathParts[2]) : 0;
  
  if (isNaN(planId) || planId <= 0) {
    navigate("/plans");
  }

  // Buscar dados do plano
  const { data: plan, isLoading: isPlanLoading } = useQuery<Plan>({
    queryKey: ['/api/plans', planId],
    enabled: planId > 0,
  });

  // Buscar módulos disponíveis
  const { data: modules = [], isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
  });

  // Inicializar formulário
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      tier: "free",
      description: "",
      price: "0",
      maxRecords: "100",
      trialDays: "0",
      features: [],
      isModulePlan: false,
      moduleId: "",
    },
  });

  // Preencher o formulário quando os dados do plano estiverem disponíveis
  useEffect(() => {
    if (plan && !isPlanLoading) {
      form.reset({
        name: plan.name,
        tier: plan.tier,
        description: plan.description,
        price: plan.price.toString(),
        maxRecords: plan.maxRecords.toString(),
        trialDays: plan.trialDays?.toString() || "0",
        features: plan.features || [],
        isModulePlan: !!plan.isModulePlan,
        moduleId: plan.moduleId ? plan.moduleId.toString() : "",
      });
      
      setFeatures(plan.features || []);
      setLoading(false);
    }
  }, [plan, isPlanLoading, form]);

  // Mutation para atualizar o plano
  const updatePlanMutation = useMutation({
    mutationFn: async (values: PlanFormValues) => {
      // Converter valores de string para números
      const planData = {
        name: values.name,
        tier: values.tier,
        description: values.description,
        price: Number(values.price),
        maxRecords: Number(values.maxRecords),
        trialDays: Number(values.trialDays),
        features: values.features,
        isModulePlan: values.isModulePlan,
        moduleId: values.moduleId ? Number(values.moduleId) : undefined,
      };
      
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar plano');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/plans', planId] });
      toast({
        title: "Plano atualizado com sucesso",
        description: `O plano ${data.name} foi atualizado com sucesso.`,
        variant: "default",
      });
      navigate("/plans");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manipular adição de funcionalidades
  const handleAddFeature = () => {
    if (newFeature.trim() !== "") {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      form.setValue("features", updatedFeatures);
      setNewFeature("");
    }
  };

  // Manipular remoção de funcionalidades
  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
    form.setValue("features", updatedFeatures);
  };

  // Manipular envio do formulário
  const onSubmit = (values: PlanFormValues) => {
    // Garantir que as funcionalidades estão no formulário
    values.features = features;
    updatePlanMutation.mutate(values);
  };

  if (isPlanLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Plano não encontrado. Por favor, verifique se o ID está correto.
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => navigate("/plans")} 
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Planos
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/plans")} 
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Planos
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Plano</h1>
            <p className="text-muted-foreground">
              Atualize os detalhes e características do plano
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Plano</CardTitle>
            <CardDescription>
              Atualize as informações sobre o plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Plano</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Plano Básico" {...field} />
                        </FormControl>
                        <FormDescription>
                          O nome que será exibido para os usuários.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível do Plano</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="free">Freemium</SelectItem>
                            <SelectItem value="seed">Seed</SelectItem>
                            <SelectItem value="grow">Grow</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Define a hierarquia e recursos disponíveis no plano.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o plano em detalhes..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Uma descrição detalhada sobre o que o plano oferece.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="Ex: 99.90" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Preço mensal do plano em reais.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxRecords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Registros</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="Ex: 100" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Máximo de registros permitidos (pacientes/plantas).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trialDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias de Teste</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="Ex: 15" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Período de teste gratuito em dias (0 = sem período de teste).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="features"
                  render={() => (
                    <FormItem>
                      <FormLabel>Funcionalidades</FormLabel>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Ex: 5 usuários"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleAddFeature}
                          variant="secondary"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                      <div className="space-y-2 mt-2">
                        {features.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            Nenhuma funcionalidade adicionada.
                          </p>
                        ) : (
                          features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-secondary/30 rounded-md p-2"
                            >
                              <span className="text-sm">{feature}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFeature(index)}
                                className="h-7 w-7 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                      <FormDescription>
                        Lista de recursos e benefícios incluídos no plano.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isModulePlan"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Plano específico para um módulo</FormLabel>
                        <FormDescription>
                          Marque se este plano estiver associado a um módulo específico.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("isModulePlan") && (
                  <FormField
                    control={form.control}
                    name="moduleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Módulo</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o módulo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingModules ? (
                              <div className="flex justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              modules.map((module) => (
                                <SelectItem 
                                  key={module.id} 
                                  value={module.id.toString()}
                                >
                                  {module.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecione o módulo ao qual este plano estará associado.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/plans")}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updatePlanMutation.isPending}
                  >
                    {updatePlanMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}