import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, RefreshCw, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Esquema de validação do ticket
const ticketSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres",
  }).max(100, {
    message: "O título deve ter no máximo 100 caracteres",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres",
  }),
  category: z.enum([
    'bug', 'melhoria', 'duvida', 'financeiro', 'acesso', 'seguranca', 'performance', 'outros'
  ], {
    message: "Selecione uma categoria válida",
  }),
  priority: z.enum(['baixa', 'media', 'alta', 'critica'], {
    message: "Selecione uma prioridade válida",
  }),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function CreateTicketPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [files, setFiles] = useState<FileList | null>(null);
  
  // Inicializar formulário com validação
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "duvida",
      priority: "media",
    },
  });

  // Mutação para criar ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormValues) => {
      // Se houver arquivos, usamos o FormData para upload
      if (files && files.length > 0) {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("category", data.category);
        formData.append("priority", data.priority);
        
        // Adicionar todos os arquivos
        for (let i = 0; i < files.length; i++) {
          formData.append("attachments", files[i]);
        }
        
        const res = await fetch("/api/tickets", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Erro ao criar ticket");
        }
        
        return res.json();
      } else {
        // Sem arquivos, podemos usar o apiRequest normal
        const res = await apiRequest("POST", "/api/tickets", data);
        return res.json();
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Ticket criado com sucesso",
        description: `O ticket #${data.ticket.id} foi criado e será analisado pela nossa equipe.`,
        duration: 5000,
      });
      setLocation(`/tickets/${data.ticket.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Função de submissão do formulário
  function onSubmit(data: TicketFormValues) {
    createTicketMutation.mutate(data);
  }

  // Manipulador para arquivos
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/tickets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Tickets
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Criar Novo Ticket de Suporte</CardTitle>
          <CardDescription>
            Preencha o formulário abaixo para criar um novo ticket de suporte. Nossa equipe
            irá analisar e responder o mais breve possível.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Ticket</FormLabel>
                    <FormControl>
                      <Input placeholder="Resumo do problema ou solicitação" {...field} />
                    </FormControl>
                    <FormDescription>
                      Um título breve e claro que resume o problema ou solicitação.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug">Bug / Problema</SelectItem>
                        <SelectItem value="melhoria">Sugestão de Melhoria</SelectItem>
                        <SelectItem value="duvida">Dúvida</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="acesso">Acesso / Permissões</SelectItem>
                        <SelectItem value="seguranca">Segurança</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      A categoria ajuda a direcionar seu ticket para a equipe certa.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Indique a urgência do seu problema ou solicitação.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Forneça detalhes sobre o problema ou solicitação..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Inclua todas as informações relevantes, passos para reproduzir o problema, 
                      mensagens de erro, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel htmlFor="attachments">Anexos (opcional)</FormLabel>
                <div className="mt-2">
                  <label 
                    htmlFor="attachments" 
                    className="flex justify-center items-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Clique para selecionar arquivos</span> ou arraste e solte
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Imagens, PDFs, documentos (máx. 10MB)
                      </p>
                    </div>
                    <input
                      id="attachments"
                      name="attachments"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                {files && files.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium">Arquivos selecionados:</h3>
                    <ul className="mt-2 space-y-1">
                      {Array.from(files).map((file, index) => (
                        <li key={index} className="text-sm flex items-center">
                          <span className="mr-2">📎</span>
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Enviando Ticket...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Criar Ticket
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}