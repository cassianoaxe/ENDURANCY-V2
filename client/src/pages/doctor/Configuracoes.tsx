import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Bell,
  Lock, 
  Shield, 
  Clock, 
  Sliders, 
  Palette, 
  Smartphone, 
  Calendar, 
  Mail,
  Globe,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Configuracoes() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Configurações de notificações
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    browserNotifications: true,
    appointmentReminders: true,
    prescriptionUpdates: true,
    systemUpdates: true,
    marketingEmails: false,
  });
  
  // Configurações de privacidade e segurança
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    showProfileToPatients: true,
    showProfileToPublic: false,
    twoFactorAuth: false,
    allowDataCollection: true,
    sessionTimeout: "30",
  });
  
  // Configurações de aparência
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    fontSize: "medium",
    reducedMotion: false,
    highContrast: false,
    language: "pt-BR",
  });
  
  // Configurações de calendário e agenda
  const [calendarSettings, setCalendarSettings] = useState({
    defaultView: "week",
    startOfWeek: "monday",
    workingHoursStart: "08:00",
    workingHoursEnd: "18:00",
    slotDuration: "30",
    showWeekends: true,
  });
  
  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handlePrivacyChange = (name: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [name]: typeof value === 'boolean' ? value : value
    }));
  };
  
  const handleAppearanceChange = (name: string, value: any) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCalendarChange = (name: string, value: any) => {
    setCalendarSettings(prev => ({
      ...prev,
      [name]: typeof value === 'boolean' ? value : value
    }));
  };
  
  const saveSettings = () => {
    setIsLoading(true);
    
    // Simulação de salvar configurações
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
        duration: 3000,
      });
    }, 800);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
      
      <Tabs defaultValue="notificacoes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="privacidade" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacidade e Segurança
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="calendario" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendário e Agenda
          </TabsTrigger>
        </TabsList>
        
        {/* Configurações de Notificações */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como e quando deseja receber notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Canais de Notificação</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="emailNotifications" className="cursor-pointer">
                        Notificações por Email
                      </Label>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="smsNotifications" className="cursor-pointer">
                        Notificações por SMS
                      </Label>
                    </div>
                    <Switch 
                      id="smsNotifications" 
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="browserNotifications" className="cursor-pointer">
                        Notificações no Navegador
                      </Label>
                    </div>
                    <Switch 
                      id="browserNotifications" 
                      checked={notificationSettings.browserNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('browserNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Eventos para Notificação</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="appointmentReminders" className="cursor-pointer">
                        Lembretes de Consultas
                      </Label>
                    </div>
                    <Switch 
                      id="appointmentReminders" 
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) => handleNotificationChange('appointmentReminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="prescriptionUpdates" className="cursor-pointer">
                        Atualizações de Prescrições
                      </Label>
                    </div>
                    <Switch 
                      id="prescriptionUpdates" 
                      checked={notificationSettings.prescriptionUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('prescriptionUpdates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="systemUpdates" className="cursor-pointer">
                        Atualizações do Sistema
                      </Label>
                    </div>
                    <Switch 
                      id="systemUpdates" 
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('systemUpdates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="marketingEmails" className="cursor-pointer">
                        Emails de Marketing e Novidades
                      </Label>
                    </div>
                    <Switch 
                      id="marketingEmails" 
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <p className="text-sm text-gray-500">
                Você pode alterar suas preferências a qualquer momento.
              </p>
              <Button variant="outline" size="sm" onClick={() => {
                setNotificationSettings({
                  emailNotifications: true,
                  smsNotifications: true,
                  browserNotifications: true,
                  appointmentReminders: true,
                  prescriptionUpdates: true,
                  systemUpdates: true,
                  marketingEmails: false,
                });
              }}>
                Restaurar Padrões
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configurações de Privacidade e Segurança */}
        <TabsContent value="privacidade">
          <Card>
            <CardHeader>
              <CardTitle>Privacidade e Segurança</CardTitle>
              <CardDescription>
                Gerencie suas configurações de privacidade e segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Perfil e Visibilidade</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showOnlineStatus" className="cursor-pointer">
                        Mostrar status online
                      </Label>
                      <p className="text-sm text-gray-500">
                        Permite que outros usuários vejam quando você está online
                      </p>
                    </div>
                    <Switch 
                      id="showOnlineStatus" 
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showProfileToPatients" className="cursor-pointer">
                        Visibilidade para pacientes
                      </Label>
                      <p className="text-sm text-gray-500">
                        Permite que seus pacientes vejam seu perfil completo
                      </p>
                    </div>
                    <Switch 
                      id="showProfileToPatients" 
                      checked={privacySettings.showProfileToPatients}
                      onCheckedChange={(checked) => handlePrivacyChange('showProfileToPatients', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showProfileToPublic" className="cursor-pointer">
                        Perfil público
                      </Label>
                      <p className="text-sm text-gray-500">
                        Torna seu perfil visível para todos, incluindo mecanismos de busca
                      </p>
                    </div>
                    <Switch 
                      id="showProfileToPublic" 
                      checked={privacySettings.showProfileToPublic}
                      onCheckedChange={(checked) => handlePrivacyChange('showProfileToPublic', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Segurança da Conta</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorAuth" className="cursor-pointer">
                        Autenticação de dois fatores
                      </Label>
                      <p className="text-sm text-gray-500">
                        Adiciona uma camada extra de segurança ao solicitar um código além da senha
                      </p>
                    </div>
                    <Switch 
                      id="twoFactorAuth" 
                      checked={privacySettings.twoFactorAuth}
                      onCheckedChange={(checked) => handlePrivacyChange('twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Tempo limite de sessão</Label>
                    <Select 
                      value={privacySettings.sessionTimeout} 
                      onValueChange={(value) => handlePrivacyChange('sessionTimeout', value)}
                    >
                      <SelectTrigger id="sessionTimeout">
                        <SelectValue placeholder="Selecione o tempo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="240">4 horas</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Encerra sua sessão após o período de inatividade selecionado
                    </p>
                  </div>
                  
                  <div>
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowDataCollection" className="cursor-pointer">
                      Coleta de dados de uso
                    </Label>
                    <p className="text-sm text-gray-500">
                      Permite a coleta de dados anônimos para melhorar sua experiência
                    </p>
                  </div>
                  <Switch 
                    id="allowDataCollection" 
                    checked={privacySettings.allowDataCollection}
                    onCheckedChange={(checked) => handlePrivacyChange('allowDataCollection', checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-gray-500">
                Suas informações são protegidas de acordo com nossa política de privacidade e termos de uso.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configurações de Aparência */}
        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência da interface de acordo com suas preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Tema</h3>
                <RadioGroup 
                  value={appearanceSettings.theme} 
                  onValueChange={(value) => handleAppearanceChange('theme', value)}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light" className="cursor-pointer flex items-center gap-2">
                      <Sun className="h-4 w-4 text-orange-500" /> Claro
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark" className="cursor-pointer flex items-center gap-2">
                      <Moon className="h-4 w-4 text-blue-500" /> Escuro
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system" className="cursor-pointer flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-gray-500" /> Sistema
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Tamanho da Fonte</h3>
                <RadioGroup 
                  value={appearanceSettings.fontSize} 
                  onValueChange={(value) => handleAppearanceChange('fontSize', value)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="small" id="font-small" />
                    <Label htmlFor="font-small" className="cursor-pointer text-sm">
                      Pequeno
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="medium" id="font-medium" />
                    <Label htmlFor="font-medium" className="cursor-pointer">
                      Médio
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="large" id="font-large" />
                    <Label htmlFor="font-large" className="cursor-pointer text-lg">
                      Grande
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Acessibilidade</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reducedMotion" className="cursor-pointer">
                        Reduzir movimento
                      </Label>
                      <p className="text-sm text-gray-500">
                        Minimiza animações e efeitos de transição
                      </p>
                    </div>
                    <Switch 
                      id="reducedMotion" 
                      checked={appearanceSettings.reducedMotion}
                      onCheckedChange={(checked) => handleAppearanceChange('reducedMotion', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="highContrast" className="cursor-pointer">
                        Alto contraste
                      </Label>
                      <p className="text-sm text-gray-500">
                        Aumenta o contraste para melhor legibilidade
                      </p>
                    </div>
                    <Switch 
                      id="highContrast" 
                      checked={appearanceSettings.highContrast}
                      onCheckedChange={(checked) => handleAppearanceChange('highContrast', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Idioma</h3>
                <Select 
                  value={appearanceSettings.language} 
                  onValueChange={(value) => handleAppearanceChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <p className="text-sm text-gray-500">
                Algumas alterações podem exigir a atualização da página.
              </p>
              <Button variant="outline" size="sm" onClick={() => {
                setAppearanceSettings({
                  theme: "system",
                  fontSize: "medium",
                  reducedMotion: false,
                  highContrast: false,
                  language: "pt-BR",
                });
              }}>
                Restaurar Padrões
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configurações de Calendário e Agenda */}
        <TabsContent value="calendario">
          <Card>
            <CardHeader>
              <CardTitle>Calendário e Agenda</CardTitle>
              <CardDescription>
                Configure suas preferências para a visualização e gestão da agenda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultView">Visualização padrão</Label>
                  <Select 
                    value={calendarSettings.defaultView} 
                    onValueChange={(value) => handleCalendarChange('defaultView', value)}
                  >
                    <SelectTrigger id="defaultView">
                      <SelectValue placeholder="Selecione a visualização..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Diária</SelectItem>
                      <SelectItem value="week">Semanal</SelectItem>
                      <SelectItem value="month">Mensal</SelectItem>
                      <SelectItem value="agenda">Lista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startOfWeek">Primeiro dia da semana</Label>
                  <Select 
                    value={calendarSettings.startOfWeek} 
                    onValueChange={(value) => handleCalendarChange('startOfWeek', value)}
                  >
                    <SelectTrigger id="startOfWeek">
                      <SelectValue placeholder="Selecione o dia..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Domingo</SelectItem>
                      <SelectItem value="monday">Segunda-feira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workingHoursStart">Horário de início</Label>
                  <Input 
                    id="workingHoursStart" 
                    type="time" 
                    value={calendarSettings.workingHoursStart}
                    onChange={(e) => handleCalendarChange('workingHoursStart', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workingHoursEnd">Horário de término</Label>
                  <Input 
                    id="workingHoursEnd" 
                    type="time" 
                    value={calendarSettings.workingHoursEnd}
                    onChange={(e) => handleCalendarChange('workingHoursEnd', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slotDuration">Duração padrão de consultas</Label>
                  <Select 
                    value={calendarSettings.slotDuration} 
                    onValueChange={(value) => handleCalendarChange('slotDuration', value)}
                  >
                    <SelectTrigger id="slotDuration">
                      <SelectValue placeholder="Selecione a duração..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showWeekends" className="cursor-pointer">
                    Mostrar finais de semana
                  </Label>
                  <Switch 
                    id="showWeekends" 
                    checked={calendarSettings.showWeekends}
                    onCheckedChange={(checked) => handleCalendarChange('showWeekends', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Cores da Agenda</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-md border bg-green-100 border-green-300">
                    <h4 className="font-medium">Consultas agendadas</h4>
                    <p className="text-sm text-gray-700">Verde</p>
                  </div>
                  <div className="p-3 rounded-md border bg-blue-100 border-blue-300">
                    <h4 className="font-medium">Teleconsultas</h4>
                    <p className="text-sm text-gray-700">Azul</p>
                  </div>
                  <div className="p-3 rounded-md border bg-yellow-100 border-yellow-300">
                    <h4 className="font-medium">Retornos</h4>
                    <p className="text-sm text-gray-700">Amarelo</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <p className="text-sm text-gray-500">
                Estas configurações afetam apenas a visualização da sua agenda.
              </p>
              <Button variant="outline" size="sm" onClick={() => {
                setCalendarSettings({
                  defaultView: "week",
                  startOfWeek: "monday",
                  workingHoursStart: "08:00",
                  workingHoursEnd: "18:00",
                  slotDuration: "30",
                  showWeekends: true,
                });
              }}>
                Restaurar Padrões
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}