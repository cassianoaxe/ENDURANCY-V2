import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Building, Bell, ShieldAlert, User, Settings2, Sliders, Database, Mail, HelpCircle, Save } from "lucide-react";

export default function LaboratorySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  
  const handleSaveGeneral = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações do laboratório foram atualizadas com sucesso.",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Preferências de notificações salvas",
      description: "Suas preferências de notificações foram atualizadas.",
    });
  };
  
  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações de perfil foram atualizadas com sucesso.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configurações do Laboratório</h2>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">
            <Settings2 className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Meu Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="laboratory">
            <Building className="h-4 w-4 mr-2" />
            Laboratório
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>
        
        {/* Configurações Gerais */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Gerenciar configurações básicas do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select defaultValue="America/Sao_Paulo">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                    <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                    <SelectItem value="America/Noronha">Fernando de Noronha (GMT-2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Formato de Data</Label>
                <Select defaultValue="dd/MM/yyyy">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um formato de data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                    <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="theme" />
                <Label htmlFor="theme">Modo Escuro</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Meu Perfil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e preferências.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6 mb-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profilePhoto || ""} alt={user?.name} />
                    <AvatarFallback className="text-2xl">
                      {user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 sm:mt-0 w-full space-y-1 text-center sm:text-left">
                  <h3 className="font-medium text-lg">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">Cargo: Administrador de Laboratório</p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input id="fullName" defaultValue={user?.name} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue={user?.phoneNumber || ""} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input id="position" defaultValue="Administrador de Laboratório" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea id="bio" rows={4} defaultValue={user?.bio || ""} placeholder="Descreva brevemente sua experiência e especialidades..." />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Perfil
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Controle quais notificações você deseja receber.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações do Sistema</h4>
                    <p className="text-sm text-muted-foreground">Receba notificações gerais do sistema</p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações por Email</h4>
                    <p className="text-sm text-muted-foreground">Receba emails sobre atualizações importantes</p>
                  </div>
                  <Switch 
                    checked={emailNotificationsEnabled} 
                    onCheckedChange={setEmailNotificationsEnabled} 
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium mb-3">Tipos de Notificações</h4>
                
                <div className="flex items-center space-x-2 ml-1">
                  <Switch id="new-samples" defaultChecked />
                  <Label htmlFor="new-samples">Novas amostras recebidas</Label>
                </div>
                
                <div className="flex items-center space-x-2 ml-1">
                  <Switch id="test-results" defaultChecked />
                  <Label htmlFor="test-results">Resultados de testes concluídos</Label>
                </div>
                
                <div className="flex items-center space-x-2 ml-1">
                  <Switch id="equipment-maintenance" defaultChecked />
                  <Label htmlFor="equipment-maintenance">Alertas de manutenção de equipamentos</Label>
                </div>
                
                <div className="flex items-center space-x-2 ml-1">
                  <Switch id="stock-alerts" defaultChecked />
                  <Label htmlFor="stock-alerts">Alertas de estoque baixo de consumíveis</Label>
                </div>
                
                <div className="flex items-center space-x-2 ml-1">
                  <Switch id="system-updates" defaultChecked />
                  <Label htmlFor="system-updates">Atualizações do sistema</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Preferências
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Laboratório */}
        <TabsContent value="laboratory">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Laboratório</CardTitle>
              <CardDescription>
                Informações e configurações específicas do laboratório.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="labName">Nome do Laboratório</Label>
                  <Input id="labName" defaultValue="Laboratório Analítico Central" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="labCode">Código do Laboratório</Label>
                  <Input id="labCode" defaultValue="LAC-2025" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="labAddress">Endereço</Label>
                  <Input id="labAddress" defaultValue="Av. Paulista, 1578 - Bela Vista" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="labCity">Cidade/Estado</Label>
                  <Input id="labCity" defaultValue="São Paulo - SP" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="labPhone">Telefone</Label>
                  <Input id="labPhone" defaultValue="(11) 3456-7890" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="labEmail">Email de Contato</Label>
                  <Input id="labEmail" defaultValue="contato@laboratoriocentral.com.br" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="labDescription">Descrição do Laboratório</Label>
                <Textarea id="labDescription" rows={4} defaultValue="Laboratório especializado em análises químicas e físicas de Cannabis para fins medicinais, seguindo padrões nacionais e internacionais de qualidade e controle." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="certifications">Certificações e Acreditações</Label>
                <Input id="certifications" defaultValue="ISO 17025, ANVISA, REBLAS" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Informações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança e Privacidade</CardTitle>
              <CardDescription>
                Gerencie configurações de segurança e altere sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Alterar Senha</h4>
                  <div className="grid gap-4">
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
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Segurança da Conta</h4>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h5 className="font-medium">Autenticação de Dois Fatores</h5>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h5 className="font-medium">Histórico de Sessões</h5>
                      <p className="text-sm text-muted-foreground">
                        Veja onde sua conta está logada atualmente
                      </p>
                    </div>
                    <Button variant="outline">Visualizar</Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h5 className="font-medium">Encerrar Todas as Sessões</h5>
                      <p className="text-sm text-muted-foreground">
                        Desconectar de todos os dispositivos
                      </p>
                    </div>
                    <Button variant="outline" className="text-red-500 hover:text-red-600">Encerrar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Atualizar Segurança
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}