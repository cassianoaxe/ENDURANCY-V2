"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Search, 
  Send, 
  AlertCircle, 
  Check, 
  Clock, 
  CreditCard, 
  PieChart, 
  RefreshCw,
  Bell,
  Package,
  List
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipo para os templates disponíveis
type EmailTemplateType = 
  | 'organization_registration'
  | 'organization_approved'
  | 'organization_rejected'
  | 'user_welcome'
  | 'password_reset'
  | 'plan_purchase_confirmation'
  | 'module_purchase_confirmation'
  | 'payment_failed'
  | 'subscription_expiring'
  | 'limit_warning'
  | 'new_module_available'
  | 'module_status_update';

// Informações de cada template
interface TemplateInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'organization' | 'user' | 'payment' | 'module' | 'notification';
}

export default function EmailTemplates() {
  const { toast } = useToast();
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Definindo os templates disponíveis e suas informações
  const templates: Record<EmailTemplateType, TemplateInfo> = {
    organization_registration: {
      name: "Registro de Organização",
      description: "Enviado quando uma nova organização se registra na plataforma",
      icon: <Mail className="h-4 w-4" />,
      category: 'organization'
    },
    organization_approved: {
      name: "Organização Aprovada",
      description: "Enviado quando uma organização é aprovada",
      icon: <Check className="h-4 w-4 text-green-500" />,
      category: 'organization'
    },
    organization_rejected: {
      name: "Organização Rejeitada",
      description: "Enviado quando uma organização não é aprovada",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      category: 'organization'
    },
    user_welcome: {
      name: "Boas-vindas ao Usuário",
      description: "Enviado quando um novo usuário é criado",
      icon: <Mail className="h-4 w-4" />,
      category: 'user'
    },
    password_reset: {
      name: "Redefinição de Senha",
      description: "Enviado quando um usuário solicita redefinição de senha",
      icon: <RefreshCw className="h-4 w-4" />,
      category: 'user'
    },
    plan_purchase_confirmation: {
      name: "Confirmação de Compra de Plano",
      description: "Enviado após a confirmação de pagamento de um plano",
      icon: <CreditCard className="h-4 w-4 text-green-500" />,
      category: 'payment'
    },
    module_purchase_confirmation: {
      name: "Confirmação de Compra de Módulo",
      description: "Enviado após a confirmação de pagamento de um módulo",
      icon: <Package className="h-4 w-4 text-green-500" />,
      category: 'payment'
    },
    payment_failed: {
      name: "Falha no Pagamento",
      description: "Enviado quando um pagamento não é aprovado",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      category: 'payment'
    },
    subscription_expiring: {
      name: "Assinatura Expirando",
      description: "Enviado quando uma assinatura está prestes a expirar",
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      category: 'payment'
    },
    limit_warning: {
      name: "Alerta de Limite",
      description: "Enviado quando o cliente está se aproximando do limite do plano",
      icon: <PieChart className="h-4 w-4 text-amber-500" />,
      category: 'notification'
    },
    new_module_available: {
      name: "Novo Módulo Disponível",
      description: "Enviado quando um novo módulo é lançado",
      icon: <Bell className="h-4 w-4 text-blue-500" />,
      category: 'module'
    },
    module_status_update: {
      name: "Atualização de Status de Módulo",
      description: "Enviado quando o status de um módulo é alterado",
      icon: <RefreshCw className="h-4 w-4 text-blue-500" />,
      category: 'module'
    }
  };

  // Função para enviar e-mail de teste
  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um template e informe um e-mail para o teste",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await apiRequest("POST", "/api/email/test", {
        template: selectedTemplate,
        email: testEmail
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "E-mail enviado com sucesso",
          description: `O e-mail de teste foi enviado para ${testEmail}`,
          variant: "default"
        });
        setIsTestDialogOpen(false);
      } else {
        toast({
          title: "Erro ao enviar e-mail",
          description: result.message || "Ocorreu um erro ao tentar enviar o e-mail de teste",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao enviar e-mail de teste:", error);
      toast({
        title: "Erro ao enviar e-mail",
        description: "Não foi possível conectar ao servidor para enviar o e-mail",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar templates com base na busca e categoria
  const filteredTemplates = Object.entries(templates)
    .filter(([key, template]) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = template.name.toLowerCase().includes(searchLower) || 
                           template.description.toLowerCase().includes(searchLower);
      
      const matchesCategory = activeTab === "all" || template.category === activeTab;
      
      return matchesSearch && matchesCategory;
    })
    .map(([key, value]) => ({ id: key as EmailTemplateType, ...value }));

  // Contagem de templates por categoria
  const templateCounts = {
    total: Object.keys(templates).length,
    organization: Object.values(templates).filter(t => t.category === 'organization').length,
    user: Object.values(templates).filter(t => t.category === 'user').length,
    payment: Object.values(templates).filter(t => t.category === 'payment').length,
    module: Object.values(templates).filter(t => t.category === 'module').length,
    notification: Object.values(templates).filter(t => t.category === 'notification').length
  };

  // Helper para obter a cor do badge
  const getCategoryBadgeColor = (category: string) => {
    switch(category) {
      case 'organization': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'payment': return 'bg-purple-100 text-purple-800';
      case 'module': return 'bg-amber-100 text-amber-800';
      case 'notification': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper para obter o nome da categoria
  const getCategoryName = (category: string) => {
    switch(category) {
      case 'organization': return 'Organização';
      case 'user': return 'Usuário';
      case 'payment': return 'Pagamento';
      case 'module': return 'Módulo';
      case 'notification': return 'Notificação';
      default: return category;
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Templates de Email</h1>
          <p className="text-gray-600 mt-2">
            Gerencie e teste os templates de email utilizados na plataforma
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Button onClick={() => {
            setSelectedTemplate(null);
            setTestEmail("");
            setIsTestDialogOpen(true);
          }}>
            <Send className="h-4 w-4 mr-2" />
            Testar E-mail
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Templates</p>
                <p className="text-2xl font-bold">{templateCounts.total}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-full">
                <List className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Organização</p>
                <p className="text-2xl font-bold">{templateCounts.organization}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pagamento</p>
                <p className="text-2xl font-bold">{templateCounts.payment}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Módulos</p>
                <p className="text-2xl font-bold">{templateCounts.module}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Package className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Notificações</p>
                <p className="text-2xl font-bold">{templateCounts.notification + templateCounts.user}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle>Templates Disponíveis</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  type="search" 
                  placeholder="Buscar templates..." 
                  className="pl-8 w-full sm:w-[250px]" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="organization">Org.</TabsTrigger>
                  <TabsTrigger value="user">Usuário</TabsTrigger>
                  <TabsTrigger value="payment">Pagamento</TabsTrigger>
                  <TabsTrigger value="module">Módulo</TabsTrigger>
                  <TabsTrigger value="notification">Notif.</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-full mt-1">
                    {template.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline" className={getCategoryBadgeColor(template.category)}>
                        {getCategoryName(template.category)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <p className="text-xs text-gray-500 mt-1">ID do template: {template.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setTestEmail("");
                      setIsTestDialogOpen(true);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                </div>
              </div>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Mail className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum template encontrado</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? 'Não encontramos nenhum template correspondente à sua pesquisa.' 
                    : 'Não há templates disponíveis nesta categoria.'}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Limpar busca
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para envio de e-mail de teste */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar E-mail de Teste</DialogTitle>
            <DialogDescription>
              Selecione um template e informe um e-mail para receber o teste.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template">Template</Label>
              <Select 
                value={selectedTemplate || ""} 
                onValueChange={(value) => setSelectedTemplate(value as EmailTemplateType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail para teste</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTestDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={sendTestEmail}
              disabled={isLoading || !selectedTemplate || !testEmail}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Teste
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}