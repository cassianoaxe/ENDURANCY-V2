import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Camera, Check, Key, Save, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PharmacistPerfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bio: '',
    specialization: '',
    license: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState('');

  // Buscar informações do perfil
  const { data: userData, isLoading } = useQuery({
    queryKey: ['pharmacist-profile', user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Buscar dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId,
  });

  // Atualizar dados do perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.patch(`/api/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist-profile'] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar seu perfil. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Atualizar senha
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(`/api/users/${user?.id}/change-password`, data);
      return response.data;
    },
    onSuccess: () => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: "Erro ao atualizar senha",
        description: "Verifique se a senha atual está correta",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Atualizar foto de perfil
  const updatePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const response = await axios.post(`/api/users/${user?.id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist-profile'] });
      setSelectedFile(null);
      setPreviewUrl(null);
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar foto:', error);
      toast({
        title: "Erro ao atualizar foto",
        description: "Ocorreu um erro ao atualizar sua foto de perfil",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Atualizar os campos do formulário quando os dados do usuário são carregados
  useEffect(() => {
    if (userData) {
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        bio: userData.bio || '',
        specialization: userData.specialization || '',
        license: userData.license || '',
        address: userData.address || '',
      });
    }
  }, [userData]);

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handlePhotoUpdate = () => {
    if (selectedFile) {
      updatePhotoMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
        <p className="text-gray-500">
          Gerencie suas informações pessoais e senha • Farmácia {organizationName}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card de perfil */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center">
            <div className="relative mb-5">
              <Avatar className="w-32 h-32 border-4 border-background">
                <AvatarImage src={previewUrl || (userData?.profilePhoto ? `/uploads/${userData.profilePhoto}` : undefined)} />
                <AvatarFallback className="text-3xl">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : <User />}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90">
                <Camera className="h-5 w-5" />
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {selectedFile && (
              <div className="flex flex-col gap-3 items-center w-full mb-4">
                <p className="text-sm text-center">{selectedFile.name}</p>
                <Button 
                  onClick={handlePhotoUpdate}
                  disabled={updatePhotoMutation.isPending}
                  className="w-full"
                >
                  {updatePhotoMutation.isPending ? "Atualizando..." : "Salvar Nova Foto"}
                </Button>
              </div>
            )}
            
            <div className="w-full pt-2 border-t">
              <div className="flex flex-col gap-1.5">
                <div className="text-sm text-muted-foreground">Nome</div>
                <div className="font-medium">{userData?.name || 'Não informado'}</div>
              </div>
              
              <div className="flex flex-col gap-1.5 mt-4">
                <div className="text-sm text-muted-foreground">Função</div>
                <div className="font-medium">Farmacêutico</div>
              </div>
              
              <div className="flex flex-col gap-1.5 mt-4">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{userData?.email || 'Não informado'}</div>
              </div>
              
              <div className="flex flex-col gap-1.5 mt-4">
                <div className="text-sm text-muted-foreground">Telefone</div>
                <div className="font-medium">{userData?.phoneNumber || 'Não informado'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs de edição */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informações
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Senha
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-0">
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={profileData.name} 
                      onChange={handleInputChange} 
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={profileData.email} 
                      onChange={handleInputChange} 
                      placeholder="seu.email@exemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Telefone</Label>
                    <Input 
                      id="phoneNumber" 
                      name="phoneNumber" 
                      value={profileData.phoneNumber} 
                      onChange={handleInputChange} 
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="license">CRF (Registro Profissional)</Label>
                    <Input 
                      id="license" 
                      name="license" 
                      value={profileData.license} 
                      onChange={handleInputChange} 
                      placeholder="Número do CRF"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <Label htmlFor="address">Endereço</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={profileData.address} 
                    onChange={handleInputChange} 
                    placeholder="Seu endereço completo"
                  />
                </div>
                
                <div className="space-y-2 mb-6">
                  <Label htmlFor="bio">Sobre Mim</Label>
                  <Textarea 
                    id="bio" 
                    name="bio" 
                    rows={4}
                    value={profileData.bio} 
                    onChange={handleInputChange} 
                    placeholder="Fale um pouco sobre você, sua experiência e especialidades..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" /> Salvando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" /> Salvar Alterações
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="password" className="mt-0">
              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-2 mb-4">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input 
                    id="currentPassword" 
                    name="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword} 
                    onChange={handlePasswordChange} 
                    placeholder="Digite sua senha atual"
                  />
                </div>
                
                <div className="space-y-2 mb-4">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword" 
                    type="password" 
                    value={passwordData.newPassword} 
                    onChange={handlePasswordChange} 
                    placeholder="Digite a nova senha"
                  />
                </div>
                
                <div className="space-y-2 mb-6">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    value={passwordData.confirmPassword} 
                    onChange={handlePasswordChange} 
                    placeholder="Confirme a nova senha"
                  />
                </div>
                
                {passwordData.newPassword !== passwordData.confirmPassword && 
                  passwordData.newPassword && passwordData.confirmPassword && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                      As senhas digitadas não coincidem.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={
                    updatePasswordMutation.isPending || 
                    !passwordData.currentPassword || 
                    !passwordData.newPassword || 
                    !passwordData.confirmPassword || 
                    passwordData.newPassword !== passwordData.confirmPassword
                  }
                >
                  {updatePasswordMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Key className="h-4 w-4" /> Atualizando Senha...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Key className="h-4 w-4" /> Atualizar Senha
                    </span>
                  )}
                </Button>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="mb-2 font-medium">Recomendações para uma senha segura:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use no mínimo 8 caracteres</li>
                    <li>Combine letras maiúsculas e minúsculas</li>
                    <li>Inclua números e símbolos</li>
                    <li>Evite informações pessoais óbvias</li>
                  </ul>
                </div>
              </form>
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}