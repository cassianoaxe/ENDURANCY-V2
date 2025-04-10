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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Building, 
  Shield, 
  Bell, 
  Clock, 
  Upload,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Perfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Dados do perfil
  const [formData, setFormData] = useState({
    name: user?.name || 'Dr. Nome Completo',
    email: user?.email || 'medico@endurancy.com',
    phoneNumber: user?.phoneNumber || '(11) 98765-4321',
    crm: 'CRM/SP 123456',
    specialty: 'Clínico Geral',
    bio: 'Médico com mais de 10 anos de experiência em medicina integrativa e cannabis medicinal.',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100',
    birthDate: '15/06/1980',
  });
  
  // Afiliações do médico
  const affiliations = [
    {
      id: 1,
      name: 'Clínica Saúde e Bem-estar',
      role: 'Médico Titular',
      address: 'Av. Paulista, 1000 - São Paulo',
      active: true
    },
    {
      id: 2,
      name: 'Hospital São Lucas',
      role: 'Médico Colaborador',
      address: 'Rua Augusta, 500 - São Paulo',
      active: true
    },
    {
      id: 3,
      name: 'Centro Médico Esperança',
      role: 'Médico Especialista',
      address: 'Rua Oscar Freire, 200 - São Paulo',
      active: false
    }
  ];
  
  // Configurações de notificação
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appNotifications: true,
    newPatients: true,
    appointmentReminders: true,
    prescriptionUpdates: true,
    systemUpdates: false,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
      duration: 3000,
    });
    setIsEditing(false);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCancelEdit = () => {
    // Restaurar os dados originais
    setFormData({
      name: user?.name || 'Dr. Nome Completo',
      email: user?.email || 'medico@endurancy.com',
      phoneNumber: user?.phoneNumber || '(11) 98765-4321',
      crm: 'CRM/SP 123456',
      specialty: 'Clínico Geral',
      bio: 'Médico com mais de 10 anos de experiência em medicina integrativa e cannabis medicinal.',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100',
      birthDate: '15/06/1980',
    });
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveProfile}>
              <Check className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="mb-4 relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileImage || ''} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {formData.name?.[0]?.toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <Label htmlFor="picture" className="cursor-pointer">
                      <div className="bg-primary text-white p-2 rounded-full">
                        <Upload className="h-4 w-4" />
                      </div>
                    </Label>
                    <Input 
                      id="picture" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold">{formData.name}</h2>
              <p className="text-gray-500">{formData.specialty}</p>
              <p className="text-sm text-gray-500 mt-1">{formData.crm}</p>
              
              <Separator className="my-4" />
              
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.birthDate}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button variant="outline" className="w-full" disabled={!isEditing}>
                <Lock className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="informacoes" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="informacoes">Informações Pessoais</TabsTrigger>
              <TabsTrigger value="afiliacoes">Afiliações</TabsTrigger>
              <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informacoes">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais e de contato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={formData.name} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Telefone</Label>
                      <Input 
                        id="phoneNumber" 
                        name="phoneNumber"
                        value={formData.phoneNumber} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input 
                        id="birthDate" 
                        name="birthDate"
                        value={formData.birthDate} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crm">CRM</Label>
                      <Input 
                        id="crm" 
                        name="crm"
                        value={formData.crm} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Especialidade</Label>
                      <Input 
                        id="specialty" 
                        name="specialty"
                        value={formData.specialty} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input 
                        id="address" 
                        name="address"
                        value={formData.address} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea 
                        id="bio" 
                        name="bio"
                        value={formData.bio} 
                        onChange={handleInputChange}
                        rows={4}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Algumas informações podem exigir verificação adicional antes de serem atualizadas.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="afiliacoes">
              <Card>
                <CardHeader>
                  <CardTitle>Afiliações</CardTitle>
                  <CardDescription>
                    Organizações e clínicas com as quais você está afiliado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {affiliations.map((affiliation) => (
                      <div 
                        key={affiliation.id} 
                        className={`p-4 rounded-lg border ${
                          !affiliation.active ? 'bg-gray-50 opacity-70' : 'bg-white'
                        }`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{affiliation.name}</h3>
                            <p className="text-sm text-gray-500">{affiliation.role}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Building className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{affiliation.address}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              affiliation.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {affiliation.active ? 'Ativo' : 'Inativo'}
                            </span>
                            {isEditing && (
                              <Button variant="ghost" size="sm" className="mt-2">
                                {affiliation.active ? 'Desativar' : 'Ativar'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t p-4">
                  <p className="text-sm text-gray-500">
                    Total: {affiliations.filter(a => a.active).length} afiliações ativas
                  </p>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      Solicitar Nova Afiliação
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notificacoes">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Notificação</CardTitle>
                  <CardDescription>
                    Gerencie como deseja receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Canais de Notificação</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="emailNotifications" className="cursor-pointer">Email</Label>
                          </div>
                          <Switch 
                            id="emailNotifications" 
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="smsNotifications" className="cursor-pointer">SMS</Label>
                          </div>
                          <Switch 
                            id="smsNotifications" 
                            checked={notificationSettings.smsNotifications}
                            onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="appNotifications" className="cursor-pointer">Notificações no Aplicativo</Label>
                          </div>
                          <Switch 
                            id="appNotifications" 
                            checked={notificationSettings.appNotifications}
                            onCheckedChange={(checked) => handleNotificationChange('appNotifications', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-3">Tipos de Notificação</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="newPatients" className="cursor-pointer">Novos Pacientes</Label>
                          </div>
                          <Switch 
                            id="newPatients" 
                            checked={notificationSettings.newPatients}
                            onCheckedChange={(checked) => handleNotificationChange('newPatients', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="appointmentReminders" className="cursor-pointer">Lembretes de Consulta</Label>
                          </div>
                          <Switch 
                            id="appointmentReminders" 
                            checked={notificationSettings.appointmentReminders}
                            onCheckedChange={(checked) => handleNotificationChange('appointmentReminders', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="prescriptionUpdates" className="cursor-pointer">Atualizações de Prescrição</Label>
                          </div>
                          <Switch 
                            id="prescriptionUpdates" 
                            checked={notificationSettings.prescriptionUpdates}
                            onCheckedChange={(checked) => handleNotificationChange('prescriptionUpdates', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-500" />
                            <Label htmlFor="systemUpdates" className="cursor-pointer">Atualizações do Sistema</Label>
                          </div>
                          <Switch 
                            id="systemUpdates" 
                            checked={notificationSettings.systemUpdates}
                            onCheckedChange={(checked) => handleNotificationChange('systemUpdates', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      Restaurar Padrões
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="seguranca">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança da Conta</CardTitle>
                  <CardDescription>
                    Gerencie as configurações de segurança da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Alteração de Senha</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Senha Atual</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          placeholder="••••••••"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          placeholder="••••••••"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          placeholder="••••••••"
                          disabled={!isEditing}
                        />
                      </div>
                      {isEditing && (
                        <Button className="mt-2" size="sm">
                          Atualizar Senha
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-3">Sessões Ativas</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Este dispositivo</p>
                            <p className="text-sm text-gray-500">Último acesso: Hoje, 14:32</p>
                          </div>
                          <div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Ativo Agora
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <Button variant="outline" size="sm" className="mt-2">
                          Encerrar Todas as Outras Sessões
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}