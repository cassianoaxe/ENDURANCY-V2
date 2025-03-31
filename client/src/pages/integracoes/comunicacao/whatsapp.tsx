import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  MessageSquare, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  Plus, 
  Send, 
  Smartphone,
  ChevronLeft,
  HelpCircle,
  Save,
  Copy,
  Bell,
  BellOff,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Definição de tipo para o template
interface MessageTemplateProps {
  template: {
    id: number;
    name: string;
    content: string;
    type: string;
    category: string;
    active: boolean;
    createdAt: string;
    variables: string[];
  };
  onEdit: (template: any) => void;
  onDelete: (id: number) => void;
}

// Componente para um template de mensagem WhatsApp
const MessageTemplate = ({ template, onEdit, onDelete }: MessageTemplateProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>
              {template.active ? (
                <Badge variant="success" className="mt-1">Ativo</Badge>
              ) : (
                <Badge variant="secondary" className="mt-1">Inativo</Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(template)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(template.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-3 rounded-lg relative mb-2 whitespace-pre-line">
          <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full p-1">
            <MessageSquare size={12} />
          </div>
          {template.content}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <p>Tipo: {template.type}</p>
          <p>Categoria: {template.category}</p>
          <p>Criado em: {new Date(template.createdAt).toLocaleDateString()}</p>
          <p>Variáveis: {template.variables.map(v => `{{${v}}}`).join(", ")}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onEdit(template)}
        >
          Editar Template
        </Button>
      </CardFooter>
    </Card>
  );
};

// Schema de validação para o formulário de template
const templateSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  type: z.string(),
  category: z.string(),
  active: z.boolean().default(true),
  variables: z.array(z.string()).optional(),
});

const apiConfigSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  numberPhoneId: z.string().min(1, "ID do telefone é obrigatório"),
  webhookVerifyToken: z.string().min(1, "Token de verificação do webhook é obrigatório"),
  version: z.string().min(1, "Versão da API é obrigatória"),
  businessAccountId: z.string().min(1, "ID da conta business é obrigatória"),
  callbackUrl: z.string().url("URL de callback inválida"),
});

// Componente principal para a página de integração do WhatsApp
export default function WhatsAppIntegration() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Confirmação de Agendamento",
      content: "Olá {{paciente}}, este é um lembrete para sua consulta com Dr. {{doutor}} amanhã às {{hora}}. Por favor, confirme sua presença respondendo SIM para esta mensagem.",
      type: "confirmation",
      category: "appointment",
      active: true,
      createdAt: "2025-03-15",
      variables: ["paciente", "doutor", "hora"],
    },
    {
      id: 2,
      name: "Lembrete de Medicação",
      content: "Olá {{paciente}}, este é um lembrete para tomar sua medicação {{medicamento}} agora. Lembre-se de seguir as instruções do seu médico.",
      type: "reminder",
      category: "medication",
      active: true,
      createdAt: "2025-03-15",
      variables: ["paciente", "medicamento"],
    },
    {
      id: 3,
      name: "Retorno de Consulta",
      content: "Olá {{paciente}}, informamos que já está disponível o agendamento de retorno para sua consulta. Por favor, entre em contato para agendar na data mais conveniente para você.",
      type: "information",
      category: "follow-up",
      active: false,
      createdAt: "2025-03-15",
      variables: ["paciente"],
    },
  ]);
  
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(true);
  const [currentTab, setCurrentTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [notificationSettings, setNotificationSettings] = useState({
    appointmentReminders: true,
    medicationReminders: true,
    laboratoryResults: false,
    marketingMessages: false
  });
  
  // Inicializar formulário para template
  const templateForm = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      content: "",
      type: "confirmation",
      category: "appointment",
      active: true,
      variables: [],
    }
  });
  
  // Inicializar formulário para configuração da API
  const apiConfigForm = useForm({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      token: "EAAZC8fF2jM1IBANIRgUGUNuLjAjO5H8KF7vbPgjwJSMF5XLZCnJXBQC1jkhZCb8GzUw5e9ZCv7sZBNRQ8M6CzrDdY4qV5AV0iZASdF7EFaZBZCpVTqrU40iELEHHR2QYFySrhOsdU",
      numberPhoneId: "105357472514174",
      webhookVerifyToken: "endurancy-webhook-verification-token",
      version: "v18.0",
      businessAccountId: "114453721607521",
      callbackUrl: "https://webhook.site/9dc16b0a-c5af-49f5-a9e3-4d7f0ec52f78",
    }
  });
  
  // Definição do tipo para o template
  interface Template {
    id: number;
    name: string;
    content: string;
    type: string;
    category: string;
    active: boolean;
    createdAt: string;
    variables: string[];
  }

  // Função para editar um template
  const handleEditTemplate = (template: Template): void => {
    setSelectedTemplate(template);
    setIsEditMode(true);
    templateForm.reset({
      name: template.name,
      content: template.content,
      type: template.type,
      category: template.category,
      active: template.active,
      variables: template.variables || [],
    });
    setIsTemplateDialogOpen(true);
  };
  
  // Função para excluir um template
  const handleDeleteTemplate = (id: number): void => {
    if (confirm("Tem certeza que deseja excluir este template?")) {
      setTemplates(templates.filter(template => template.id !== id));
      toast({
        title: "Template excluído",
        description: "O template foi removido com sucesso.",
      });
    }
  };
  
  // Função para salvar um template (novo ou editado)
  const onSubmitTemplate = (data: {
    name: string;
    content: string;
    type: string;
    category: string;
    active: boolean;
    variables: string[];
  }): void => {
    if (isEditMode && selectedTemplate) {
      // Atualizar template existente
      setTemplates(templates.map(template => 
        template.id === selectedTemplate.id ? { ...template, ...data } : template
      ));
      toast({
        title: "Template atualizado",
        description: "O template foi atualizado com sucesso.",
      });
    } else {
      // Criar novo template
      const newTemplate = {
        id: Math.max(0, ...templates.map(t => t.id)) + 1,
        ...data,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTemplates([...templates, newTemplate]);
      toast({
        title: "Template criado",
        description: "O novo template foi criado com sucesso.",
      });
    }
    setIsTemplateDialogOpen(false);
    resetTemplateForm();
  };
  
  // Função para enviar mensagem de teste
  const handleSendTestMessage = (): void => {
    if (!testNumber || !testMessage) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha o número e a mensagem.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Mensagem enviada",
      description: `Mensagem enviada para ${testNumber} com sucesso!`,
    });
    
    // Limpar campos após envio
    setTestNumber("");
    setTestMessage("");
  };
  
  // Função para salvar configurações de API
  const onSubmitApiConfig = (data: {
    token: string;
    numberPhoneId: string;
    businessAccountId: string;
    version: string;
    callbackUrl: string;
    webhookVerifyToken: string;
  }): void => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da API foram atualizadas com sucesso.",
    });
  };
  
  // Redefine o formulário de template
  const resetTemplateForm = (): void => {
    templateForm.reset({
      name: "",
      content: "",
      type: "confirmation",
      category: "appointment",
      active: true,
      variables: [],
    });
    setSelectedTemplate(null);
    setIsEditMode(false);
  };
  
  // Extrai variáveis do conteúdo do template
  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      variables.push(match[1].trim());
    }
    
    // Remover duplicados
    return Array.from(new Set(variables));
  };
  
  // Atualiza as variáveis quando o conteúdo muda
  const updateVariables = (content: string): void => {
    const variables = extractVariables(content);
    templateForm.setValue("variables", variables);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Link href="/integracoes" className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para Integrações
        </Link>
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <MessageSquare className="mr-3 h-8 w-8 text-primary" />
              Integração WhatsApp
            </h1>
            <p className="text-gray-500 mt-1">
              Configure mensagens automatizadas e notificações via WhatsApp Business API
            </p>
          </div>
          <div className="flex items-center mt-2 md:mt-0">
            <span className="mr-3 text-sm font-medium">
              {isIntegrationEnabled ? "Integração Ativa" : "Integração Inativa"}
            </span>
            <Switch
              checked={isIntegrationEnabled}
              onCheckedChange={setIsIntegrationEnabled}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-8 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-blue-800">Sobre esta integração</h3>
          <p className="text-blue-700 text-sm mt-1">
            Esta integração permite enviar mensagens automatizadas via WhatsApp Business API para seus pacientes e clientes.
            Você pode criar templates personalizados, agendar mensagens e configurar notificações automáticas para diversos eventos.
          </p>
        </div>
      </div>
      
      <Tabs 
        defaultValue="templates" 
        value={currentTab} 
        onValueChange={setCurrentTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="api">Configuração API</TabsTrigger>
          <TabsTrigger value="test">Testar Envio</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Templates de Mensagem</h2>
            <Button 
              onClick={() => {
                resetTemplateForm();
                setIsTemplateDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <MessageTemplate 
                key={template.id} 
                template={template} 
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
              />
            ))}
          </div>
          
          {templates.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sem templates</h3>
              <p className="mt-2 text-sm text-gray-500">
                Você ainda não criou nenhum template de mensagem.
              </p>
              <Button 
                onClick={() => {
                  resetTemplateForm();
                  setIsTemplateDialogOpen(true);
                }}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Template
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="api">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Configurações da API WhatsApp Business</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p>Obtenha esses dados no painel da Meta Business Platform. Para instruções detalhadas, consulte a documentação.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Form {...apiConfigForm}>
              <form onSubmit={apiConfigForm.handleSubmit(onSubmitApiConfig)} className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <Info className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Estas configurações são necessárias para a comunicação com a API do WhatsApp Business.
                        Você precisa ter uma conta verificada no Meta Business Platform e 
                        configurar um aplicativo com acesso à API WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={apiConfigForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token de Acesso</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Input 
                              {...field} 
                              type="password" 
                              placeholder="EA1c2..."
                              className="flex-1"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(field.value);
                                toast({
                                  title: "Copiado!",
                                  description: "Token copiado para a área de transferência",
                                });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiConfigForm.control}
                    name="numberPhoneId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="105357..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiConfigForm.control}
                    name="businessAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID da Conta Business</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="114453..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiConfigForm.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Versão da API</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a versão" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="v18.0">v18.0 (Recomendado)</SelectItem>
                              <SelectItem value="v17.0">v17.0</SelectItem>
                              <SelectItem value="v16.0">v16.0</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border border-gray-200 rounded-md p-6 space-y-6">
                  <h3 className="text-lg font-medium">Configuração de Webhook</h3>
                  <p className="text-sm text-gray-500">
                    Configure o webhook para receber notificações de mensagens e eventos do WhatsApp.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={apiConfigForm.control}
                      name="callbackUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Callback</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://seusite.com/webhook/whatsapp" />
                          </FormControl>
                          <FormDescription>
                            URL que receberá as notificações do WhatsApp
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiConfigForm.control}
                      name="webhookVerifyToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token de Verificação</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="TokenSecreto123" />
                          </FormControl>
                          <FormDescription>
                            Token para verificação do webhook
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>
        
        <TabsContent value="test">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Testar Envio de Mensagem</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagem de Teste</CardTitle>
                <CardDescription>
                  Use esta ferramenta para enviar uma mensagem de teste e verificar a integração.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <FormLabel htmlFor="test-number">Número do Destinatário</FormLabel>
                  <div className="flex mt-1">
                    <div className="bg-gray-100 flex items-center px-3 rounded-l-md border border-r-0 border-gray-300">
                      <span className="text-gray-500">+55</span>
                    </div>
                    <Input
                      id="test-number"
                      placeholder="11987654321"
                      value={testNumber}
                      onChange={(e) => setTestNumber(e.target.value)}
                      className="rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    O número deve estar cadastrado como destinatário de teste na Meta Platform
                  </p>
                </div>
                
                <div>
                  <FormLabel htmlFor="test-message">Mensagem</FormLabel>
                  <div className="mt-1">
                    <Select onValueChange={(value) => {
                      const template = templates.find(t => t.id === parseInt(value));
                      if (template) {
                        setTestMessage(template.content);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um template ou crie do zero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Mensagem personalizada</SelectItem>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-3">
                    <Textarea
                      id="test-message"
                      placeholder="Digite a mensagem de teste aqui..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  Visualizar
                </Button>
                <Button 
                  onClick={handleSendTestMessage}
                  disabled={!testNumber || !testMessage}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensagem de Teste
                </Button>
              </CardFooter>
            </Card>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Histórico de Testes</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>31/03/2025 14:25</TableCell>
                    <TableCell>+5511987654321</TableCell>
                    <TableCell className="max-w-xs truncate">Olá João, este é um lembrete para sua consulta amanhã às 15:00.</TableCell>
                    <TableCell>
                      <Badge variant="success">Entregue</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>31/03/2025 14:19</TableCell>
                    <TableCell>+5511987654321</TableCell>
                    <TableCell className="max-w-xs truncate">Teste de integração do WhatsApp com API.</TableCell>
                    <TableCell>
                      <Badge variant="success">Entregue</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>31/03/2025 14:15</TableCell>
                    <TableCell>+5511999999999</TableCell>
                    <TableCell className="max-w-xs truncate">Teste inicial de configuração.</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Falha</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Configurações de Notificação</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Notificações</CardTitle>
                <CardDescription>
                  Configure quais tipos de notificações automáticas serão enviadas via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">Lembretes de Consulta</span>
                      <span className="text-sm text-gray-500">Enviar lembretes de consultas agendadas</span>
                    </div>
                    <Switch
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, appointmentReminders: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">Lembretes de Medicação</span>
                      <span className="text-sm text-gray-500">Enviar lembretes para tomar medicação</span>
                    </div>
                    <Switch
                      checked={notificationSettings.medicationReminders}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, medicationReminders: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">Resultados de Exames</span>
                      <span className="text-sm text-gray-500">Notificar quando resultados de exames estiverem disponíveis</span>
                    </div>
                    <Switch
                      checked={notificationSettings.laboratoryResults}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, laboratoryResults: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">Mensagens de Marketing</span>
                      <span className="text-sm text-gray-500">Enviar promoções e atualizações de marketing</span>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingMessages}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, marketingMessages: checked})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Política de Opt-in</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Os pacientes precisam concordar explicitamente em receber mensagens via WhatsApp.
                        Certifique-se de que os termos de uso e políticas de privacidade estão atualizados.
                      </p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Agendamento de Mensagens</CardTitle>
                <CardDescription>
                  Configure quando as mensagens automáticas serão enviadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <FormLabel>Lembrete de Consulta</FormLabel>
                    <Select defaultValue="24">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione quando enviar o lembrete" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 horas antes</SelectItem>
                        <SelectItem value="12">12 horas antes</SelectItem>
                        <SelectItem value="48">48 horas antes</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <FormLabel>Lembrete de Medicação</FormLabel>
                    <Select defaultValue="at-time">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione quando enviar o lembrete" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="at-time">No horário exato</SelectItem>
                        <SelectItem value="15-before">15 minutos antes</SelectItem>
                        <SelectItem value="30-before">30 minutos antes</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Configurações salvas",
                      description: "As configurações de notificação foram atualizadas com sucesso.",
                    });
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para criar/editar template */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Template" : "Novo Template"}
            </DialogTitle>
            <DialogDescription>
              Crie ou edite um template de mensagem para uso no WhatsApp Business API.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit(onSubmitTemplate)} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Template</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Confirmação de Consulta" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={templateForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo da Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Ex: Olá {{paciente}}, sua consulta está agendada para {{data}} às {{hora}}."
                        rows={5}
                        onChange={(e) => {
                          field.onChange(e);
                          updateVariables(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Use {{variavel}} para incluir variáveis na mensagem.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={templateForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmation">Confirmação</SelectItem>
                          <SelectItem value="reminder">Lembrete</SelectItem>
                          <SelectItem value="information">Informativo</SelectItem>
                          <SelectItem value="alert">Alerta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={templateForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appointment">Consulta</SelectItem>
                          <SelectItem value="medication">Medicação</SelectItem>
                          <SelectItem value="follow-up">Retorno</SelectItem>
                          <SelectItem value="laboratory">Exames</SelectItem>
                          <SelectItem value="general">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={templateForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Template Ativo</FormLabel>
                      <FormDescription>
                        Templates ativos podem ser usados para envio de mensagens.
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
              
              {templateForm.watch("variables")?.length > 0 && (
                <div className="border rounded-md p-3">
                  <FormLabel className="mb-2 block">Variáveis Detectadas</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {templateForm.watch("variables").map((variable, index) => (
                      <Badge key={index} variant="secondary">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTemplateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditMode ? "Atualizar Template" : "Criar Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}