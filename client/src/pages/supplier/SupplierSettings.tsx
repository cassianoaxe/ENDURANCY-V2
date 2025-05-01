import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  User, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  Upload, 
  Plus,
  Pencil,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  CreditCard as CreditCardIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Layout do fornecedor
import SupplierLayout from "@/components/layout/supplier/SupplierLayout";

export default function SupplierSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState({
    orders: true,
    payments: true,
    messages: true,
    promotions: false,
    system: true
  });

  // Dados simulados do perfil
  const profileData = {
    id: 41,
    name: "Fornecedor Demo",
    email: "fornecedor@exemplo.com",
    phone: "(11) 98765-4321",
    photo: null,
    company: {
      name: "Fornecedor ABC Ltda",
      description: "Fornecedora de produtos e insumos para o mercado de cannabis medicinal, atuando desde 2020 com foco em qualidade e inovação.",
      cnpj: "12.345.678/0001-90",
      phone: "(11) 3456-7890",
      email: "contato@fornecedorabc.com.br",
      website: "www.fornecedorabc.com.br",
      address: {
        street: "Avenida Paulista",
        number: "1000",
        complement: "Sala 1010",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100"
      }
    },
    bankAccount: {
      bank: "Itaú",
      agency: "1234",
      account: "56789-0",
      type: "Corrente",
      document: "123.456.789-00",
      owner: "Fornecedor ABC Ltda"
    },
    verificationStatus: "verified",
    createdAt: "2025-01-15T10:30:00.000Z"
  };

  // Função para salvar configurações
  const saveSettings = (settingType: string) => {
    toast({
      title: "Configurações salvas",
      description: `As configurações de ${settingType} foram atualizadas com sucesso.`,
    });
  };

  // Função para salvar alterações de perfil
  const saveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "Seu perfil foi atualizado com sucesso.",
    });
  };

  // Função para alterar senha
  const changePassword = () => {
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso.",
    });
  };

  // Função para deletar conta
  const deleteAccount = () => {
    toast({
      title: "Conta deletada",
      description: "Sua conta foi deletada com sucesso.",
      variant: "destructive",
    });
    setShowDeleteConfirm(false);
    setLocation("/supplier/login");
  };

  return (
    <SupplierLayout activeTab="settings">
      <div className="pb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Configurações</h1>
        <p className="text-muted-foreground mb-8">Gerencie suas preferências e informações de conta.</p>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Menu lateral */}
          <Card className="md:w-64 shrink-0">
            <CardContent className="p-0">
              <nav className="flex flex-col">
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 ${activeTab === "profile" ? "bg-red-50 text-red-700 font-medium" : ""}`}
                >
                  <User className="h-4 w-4" />
                  Perfil
                </button>
                <button 
                  onClick={() => setActiveTab("company")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 ${activeTab === "company" ? "bg-red-50 text-red-700 font-medium" : ""}`}
                >
                  <Building className="h-4 w-4" />
                  Empresa
                </button>
                <button 
                  onClick={() => setActiveTab("payment")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 ${activeTab === "payment" ? "bg-red-50 text-red-700 font-medium" : ""}`}
                >
                  <CreditCard className="h-4 w-4" />
                  Dados Bancários
                </button>
                <button 
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 ${activeTab === "notifications" ? "bg-red-50 text-red-700 font-medium" : ""}`}
                >
                  <Bell className="h-4 w-4" />
                  Notificações
                </button>
                <button 
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 ${activeTab === "security" ? "bg-red-50 text-red-700 font-medium" : ""}`}
                >
                  <Shield className="h-4 w-4" />
                  Segurança
                </button>
                <button 
                  onClick={() => setActiveTab("help")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 ${activeTab === "help" ? "bg-red-50 text-red-700 font-medium" : ""}`}
                >
                  <HelpCircle className="h-4 w-4" />
                  Ajuda e Suporte
                </button>
              </nav>
            </CardContent>
          </Card>
          
          {/* Conteúdo principal */}
          <div className="flex-1">
            {/* Perfil */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Perfil</CardTitle>
                  <CardDescription>
                    Gerencie suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex flex-col items-center md:w-1/4">
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Trocar foto
                      </Button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input id="name" defaultValue={profileData.name} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input id="email" defaultValue={profileData.email} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input id="phone" defaultValue={profileData.phone} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Função</Label>
                          <Input id="role" defaultValue="Administrador" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="about">Sobre</Label>
                          <Textarea
                            id="about"
                            className="min-h-[100px]"
                            placeholder="Descreva um pouco sobre você"
                            defaultValue="Administrador responsável pelo gerenciamento de produtos e pedidos."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4 pt-0">
                  <Button variant="outline">Cancelar</Button>
                  <Button onClick={() => saveProfile()} className="bg-red-700 hover:bg-red-800">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Empresa */}
            {activeTab === "company" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Informações da Empresa</CardTitle>
                      <CardDescription>
                        Gerencie os dados da sua empresa
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nome da Empresa</Label>
                      <Input id="company-name" defaultValue={profileData.company.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-cnpj">CNPJ</Label>
                      <Input id="company-cnpj" defaultValue={profileData.company.cnpj} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-email">E-mail Corporativo</Label>
                      <Input id="company-email" defaultValue={profileData.company.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Telefone Comercial</Label>
                      <Input id="company-phone" defaultValue={profileData.company.phone} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-website">Website</Label>
                    <Input id="company-website" defaultValue={profileData.company.website} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-description">Descrição da Empresa</Label>
                    <Textarea
                      id="company-description"
                      className="min-h-[100px]"
                      defaultValue={profileData.company.description}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Logradouro</Label>
                        <Input id="street" defaultValue={profileData.company.address.street} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="number">Número</Label>
                          <Input id="number" defaultValue={profileData.company.address.number} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="complement">Complemento</Label>
                          <Input id="complement" defaultValue={profileData.company.address.complement} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input id="neighborhood" defaultValue={profileData.company.address.neighborhood} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipcode">CEP</Label>
                        <Input id="zipcode" defaultValue={profileData.company.address.zipCode} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" defaultValue={profileData.company.address.city} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Select defaultValue={profileData.company.address.state}>
                          <SelectTrigger id="state">
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AC">Acre</SelectItem>
                            <SelectItem value="AL">Alagoas</SelectItem>
                            <SelectItem value="AP">Amapá</SelectItem>
                            <SelectItem value="AM">Amazonas</SelectItem>
                            <SelectItem value="BA">Bahia</SelectItem>
                            <SelectItem value="CE">Ceará</SelectItem>
                            <SelectItem value="DF">Distrito Federal</SelectItem>
                            <SelectItem value="ES">Espírito Santo</SelectItem>
                            <SelectItem value="GO">Goiás</SelectItem>
                            <SelectItem value="MA">Maranhão</SelectItem>
                            <SelectItem value="MT">Mato Grosso</SelectItem>
                            <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="PA">Pará</SelectItem>
                            <SelectItem value="PB">Paraíba</SelectItem>
                            <SelectItem value="PR">Paraná</SelectItem>
                            <SelectItem value="PE">Pernambuco</SelectItem>
                            <SelectItem value="PI">Piauí</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                            <SelectItem value="RO">Rondônia</SelectItem>
                            <SelectItem value="RR">Roraima</SelectItem>
                            <SelectItem value="SC">Santa Catarina</SelectItem>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="SE">Sergipe</SelectItem>
                            <SelectItem value="TO">Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Documentação Legal</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium">Contrato Social</p>
                            <p className="text-sm text-gray-500">PDF, 2.5MB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Visualizar</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium">Certificado CNPJ</p>
                            <p className="text-sm text-gray-500">PDF, 1.2MB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Visualizar</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium">Certidão Negativa de Débitos</p>
                            <p className="text-sm text-gray-500">PDF, 850KB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Visualizar</Button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Documento
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4 pt-0">
                  <Button variant="outline">Cancelar</Button>
                  <Button onClick={() => saveSettings('empresa')} className="bg-red-700 hover:bg-red-800">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Pagamento */}
            {activeTab === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados Bancários</CardTitle>
                  <CardDescription>
                    Gerencie suas informações bancárias para recebimento de pagamentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Importante</p>
                      <p className="text-sm text-yellow-700">
                        Os dados bancários devem estar em nome da empresa ou do responsável legal cadastrado. Alterações estão sujeitas a verificação.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank">Banco</Label>
                      <Select defaultValue={profileData.bankAccount.bank}>
                        <SelectTrigger id="bank">
                          <SelectValue placeholder="Selecione o banco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
                          <SelectItem value="Bradesco">Bradesco</SelectItem>
                          <SelectItem value="Caixa">Caixa Econômica Federal</SelectItem>
                          <SelectItem value="Itaú">Itaú</SelectItem>
                          <SelectItem value="Santander">Santander</SelectItem>
                          <SelectItem value="Nubank">Nubank</SelectItem>
                          <SelectItem value="Inter">Banco Inter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-type">Tipo de Conta</Label>
                      <Select defaultValue={profileData.bankAccount.type}>
                        <SelectTrigger id="account-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corrente">Conta Corrente</SelectItem>
                          <SelectItem value="Poupança">Conta Poupança</SelectItem>
                          <SelectItem value="Pagamento">Conta de Pagamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agency">Agência</Label>
                      <Input id="agency" defaultValue={profileData.bankAccount.agency} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account">Conta</Label>
                      <Input id="account" defaultValue={profileData.bankAccount.account} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-name">Nome do Titular</Label>
                      <Input id="account-name" defaultValue={profileData.bankAccount.owner} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-document">CPF/CNPJ do Titular</Label>
                      <Input id="account-document" defaultValue={profileData.bankAccount.document} />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Configurações de Pagamento</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-withdraw" />
                        <Label htmlFor="auto-withdraw">Transferência automática de saldo</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="instant-withdraw" checked />
                        <Label htmlFor="instant-withdraw">Habilitar saque instantâneo (PIX)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="fee-notification" checked />
                        <Label htmlFor="fee-notification">Notificar sobre taxas de processamento</Label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Métodos de Pagamento Aceitos</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <p className="font-medium">Cartão de Crédito</p>
                            <p className="text-sm text-gray-500">Taxa: 2.49% + R$0,50 por transação</p>
                          </div>
                        </div>
                        <Switch checked />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <p className="font-medium">Boleto Bancário</p>
                            <p className="text-sm text-gray-500">Taxa: R$3,80 por boleto</p>
                          </div>
                        </div>
                        <Switch checked />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 text-purple-500 mr-3" />
                          <div>
                            <p className="font-medium">PIX</p>
                            <p className="text-sm text-gray-500">Taxa: 0.99% por transação</p>
                          </div>
                        </div>
                        <Switch checked />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4 pt-0">
                  <Button variant="outline">Cancelar</Button>
                  <Button onClick={() => saveSettings('pagamento')} className="bg-red-700 hover:bg-red-800">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Notificações */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Notificações</CardTitle>
                  <CardDescription>
                    Gerencie como e quando você recebe notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notificações por E-mail</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">Novos pedidos</p>
                          <p className="text-sm text-gray-500">Receba notificações quando novos pedidos forem feitos</p>
                        </div>
                        <Switch 
                          checked={emailNotifications.orders} 
                          onCheckedChange={(checked) => setEmailNotifications({...emailNotifications, orders: checked})} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">Pagamentos</p>
                          <p className="text-sm text-gray-500">Receba notificações sobre pagamentos e saques</p>
                        </div>
                        <Switch 
                          checked={emailNotifications.payments} 
                          onCheckedChange={(checked) => setEmailNotifications({...emailNotifications, payments: checked})} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">Mensagens</p>
                          <p className="text-sm text-gray-500">Receba notificações quando receber novas mensagens</p>
                        </div>
                        <Switch 
                          checked={emailNotifications.messages} 
                          onCheckedChange={(checked) => setEmailNotifications({...emailNotifications, messages: checked})} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">Promoções e novidades</p>
                          <p className="text-sm text-gray-500">Receba conteúdos informativos e oportunidades promocionais</p>
                        </div>
                        <Switch 
                          checked={emailNotifications.promotions} 
                          onCheckedChange={(checked) => setEmailNotifications({...emailNotifications, promotions: checked})} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between pb-3">
                        <div>
                          <p className="font-medium">Atualizações do sistema</p>
                          <p className="text-sm text-gray-500">Receba informações sobre novos recursos e manutenções</p>
                        </div>
                        <Switch 
                          checked={emailNotifications.system} 
                          onCheckedChange={(checked) => setEmailNotifications({...emailNotifications, system: checked})} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Preferências de Notificação</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="daily-summary" />
                        <Label htmlFor="daily-summary">Receber resumo diário de atividades</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="urgent-only" />
                        <Label htmlFor="urgent-only">Receber apenas notificações urgentes fora do horário comercial</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notification-frequency">Frequência de notificações</Label>
                        <Select defaultValue="immediate">
                          <SelectTrigger id="notification-frequency">
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Imediato</SelectItem>
                            <SelectItem value="hourly">Resumo por hora</SelectItem>
                            <SelectItem value="daily">Resumo diário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4 pt-0">
                  <Button variant="outline">Cancelar</Button>
                  <Button onClick={() => saveSettings('notificações')} className="bg-red-700 hover:bg-red-800">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Segurança */}
            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Segurança e Acesso</CardTitle>
                  <CardDescription>
                    Gerencie suas configurações de segurança e autenticação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      
                      <Button onClick={() => changePassword()} className="w-full bg-red-700 hover:bg-red-800">
                        <Lock className="mr-2 h-4 w-4" />
                        Alterar Senha
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Configurações de Autenticação</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">Verificação em duas etapas</p>
                          <p className="text-sm text-gray-500">Adicione uma camada extra de segurança à sua conta</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">Sessões ativas</p>
                          <p className="text-sm text-gray-500">Gerencie os dispositivos conectados à sua conta</p>
                        </div>
                        <Button variant="outline" size="sm">Gerenciar</Button>
                      </div>
                      
                      <div className="flex items-center justify-between pb-3">
                        <div>
                          <p className="font-medium">Histórico de login</p>
                          <p className="text-sm text-gray-500">Veja tentativas de acesso recentes</p>
                        </div>
                        <Button variant="outline" size="sm">Visualizar</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Privacidade e Dados</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="data-collection" checked />
                        <Label htmlFor="data-collection">Permitir coleta de dados para melhoria do serviço</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="share-data" />
                        <Label htmlFor="share-data">Permitir compartilhamento de dados com parceiros</Label>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar meus dados
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium text-red-600 mb-4">Zona de Perigo</h3>
                    <div className="space-y-4">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800">
                          Atenção: As ações abaixo são permanentes e não podem ser desfeitas.
                        </p>
                      </div>
                      
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Excluir minha conta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Ajuda e Suporte */}
            {activeTab === "help" && (
              <Card>
                <CardHeader>
                  <CardTitle>Ajuda e Suporte</CardTitle>
                  <CardDescription>
                    Obtenha ajuda e suporte para suas dúvidas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start">
                      <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Central de Ajuda</p>
                        <p className="text-sm text-blue-700 mb-2">
                          Nossa equipe de suporte está disponível para ajudar com qualquer dúvida.
                        </p>
                        <Button variant="outline" size="sm" className="bg-white">
                          Acessar Centro de Ajuda
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Perguntas Frequentes</h3>
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Como receber meus pagamentos?</p>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Como adicionar ou remover produtos?</p>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Como gerenciar estoque?</p>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Como emitir notas fiscais?</p>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Como participar de licitações?</p>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Contato</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-500 mr-3" />
                          <p>suporte@endurancy.com</p>
                        </div>
                        
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-500 mr-3" />
                          <p>(11) 4321-1234</p>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                          <p>Av. Paulista, 1000 - São Paulo, SP</p>
                        </div>
                        
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-gray-500 mr-3" />
                          <p>www.endurancy.com</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Abrir Ticket de Suporte</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="support-type">Tipo de Suporte</Label>
                          <Select defaultValue="technical">
                            <SelectTrigger id="support-type">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Suporte Técnico</SelectItem>
                              <SelectItem value="financial">Questões Financeiras</SelectItem>
                              <SelectItem value="account">Conta e Acesso</SelectItem>
                              <SelectItem value="orders">Pedidos e Entregas</SelectItem>
                              <SelectItem value="other">Outros Assuntos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="support-subject">Assunto</Label>
                          <Input id="support-subject" placeholder="Digite o assunto do seu ticket" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="support-message">Mensagem</Label>
                          <Textarea 
                            id="support-message" 
                            placeholder="Descreva seu problema ou dúvida em detalhes"
                            className="min-h-[150px]"
                          />
                        </div>
                        
                        <Button className="w-full bg-red-700 hover:bg-red-800">
                          Enviar Ticket
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmação para excluir conta */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação de Exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir sua conta. Esta ação é permanente e não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                Ao excluir sua conta, você perderá:
              </p>
              <ul className="list-disc ml-5 mt-2 text-sm text-red-800">
                <li>Todos os dados do seu perfil</li>
                <li>Histórico de vendas e transações</li>
                <li>Acesso aos relatórios e análises</li>
                <li>Configurações personalizadas</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Digite "excluir" para confirmar</Label>
              <Input id="delete-confirm" placeholder="excluir" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteAccount}>
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SupplierLayout>
  );
}