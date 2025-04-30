import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// UI Components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon, 
  Target,
  ArrowLeft,
  Upload,
  RefreshCw,
} from "lucide-react";

// Esquema de validação para o formulário
const campaignSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(100, "O título deve ter no máximo 100 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  goal: z.string().refine((val) => {
    const num = parseFloat(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, "O valor da meta deve ser um número válido maior que zero"),
  startDate: z.date({
    required_error: "A data de início é obrigatória",
  }),
  endDate: z.date().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export default function NovaCampanha() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Inicializa o formulário com valores padrão
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: "",
      startDate: new Date(),
      isActive: true,
    },
  });

  // Função para simular o upload de imagem (em um cenário real, isso enviaria para o servidor)
  const handleFileUpload = async () => {
    setIsUploading(true);
    
    // Simula um atraso de upload
    setTimeout(() => {
      form.setValue("imageUrl", "https://source.unsplash.com/random/800x600/?charity");
      setIsUploading(false);
      toast({
        title: "Imagem carregada",
        description: "A imagem foi carregada com sucesso.",
      });
    }, 1500);
  };

  // Função para enviar o formulário
  const onSubmit = async (data: CampaignFormValues) => {
    try {
      // Converte o valor da meta para número
      const formattedData = {
        ...data,
        goal: parseFloat(data.goal.replace(',', '.')),
        currentAmount: 0,
      };

      // Envia os dados para a API
      const response = await apiRequest({
        method: "POST",
        url: "/api/social/campaigns",
        data: formattedData
      });

      if (!response.ok) {
        throw new Error("Erro ao criar campanha");
      }

      const result = await response.json();

      toast({
        title: "Campanha criada",
        description: "A campanha foi criada com sucesso!",
      });

      // Redireciona para a página de campanhas
      setLocation("/organization/social/campanhas");
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a campanha. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Campanha</h1>
          <p className="text-muted-foreground">
            Crie uma nova campanha de arrecadação
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/organization/social/campanhas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Campanha</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar uma nova campanha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Campanha*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Campanha de Natal" {...field} />
                      </FormControl>
                      <FormDescription>
                        Um título atrativo e descritivo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Financeira (R$)*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 5000,00"
                          type="text"
                          {...field}
                          onChange={(e) => {
                            // Permite apenas números e vírgula
                            const value = e.target.value.replace(/[^0-9,]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor total a ser arrecadado
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
                    <FormLabel>Descrição*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva os objetivos e a importância desta campanha..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explique detalhadamente o propósito da campanha
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Início*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => date && field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Data de início da campanha
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Término (opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                            fromDate={form.getValues("startDate")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Data prevista para encerramento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem da Campanha</FormLabel>
                    <div className="flex flex-col space-y-3">
                      {field.value && (
                        <div className="relative w-full h-40 rounded-md overflow-hidden">
                          <img
                            src={field.value}
                            alt="Prévia da imagem"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            placeholder="URL da imagem"
                            {...field}
                            className="flex-1"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleFileUpload}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <FormDescription>
                      Adicione uma imagem atrativa para sua campanha
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Ativar Imediatamente</FormLabel>
                      <FormDescription>
                        A campanha ficará disponível para doações assim que for criada
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/organization/social/campanhas")}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Target className="mr-2 h-4 w-4" />
                  Criar Campanha
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}