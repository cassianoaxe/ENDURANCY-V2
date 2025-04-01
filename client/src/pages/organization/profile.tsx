import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Upload, User, Building, Mail, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

interface Organization {
  id: number;
  name: string;
  legalName?: string;
  cnpj?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  logo?: string;
  description?: string;
  foundedAt?: string;
  planId?: number | null;
}

interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  role?: string;
  organizationId?: number | null;
}

export default function OrganizationProfile() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useAuth();
  
  // Usar diretamente o user do contexto de autenticação
  const organizationId = user?.organizationId;

  const { data: organization, isLoading: isOrgLoading, error } = useQuery<Organization>({
    queryKey: ["/api/organizations", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("ID da organização não disponível");
      if (!user) throw new Error("Usuário não autenticado");
      
      console.log("Tentando buscar dados da organização:", organizationId);
      console.log("Usuário atual:", JSON.stringify(user));
      
      try {
        // Prossegue com a requisição para obter os dados da organização
        const response = await fetch(`/api/organizations/${organizationId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Importante para enviar cookies
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Erro ao buscar organização: ${response.status} - ${errorText}`);
          throw new Error(`Erro ao buscar dados da organização: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Dados da organização recebidos:", data);
        return data;
      } catch (error) {
        console.error("Erro ao buscar organização:", error);
        throw error;
      }
    },
    enabled: !!organizationId && !!user
  });

  const [profileForm, setProfileForm] = useState<Partial<Organization>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (organization) {
      setProfileForm({
        name: organization.name,
        legalName: organization.legalName || "",
        cnpj: organization.cnpj || "",
        email: organization.email || "",
        phoneNumber: organization.phoneNumber || "",
        address: organization.address || "",
        city: organization.city || "",
        state: organization.state || "",
        zipCode: organization.zipCode || "",
        website: organization.website || "",
        description: organization.description || ""
      });
    }
  }, [organization]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !user) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest(
        "PUT", 
        `/api/organizations/${organizationId}`, 
        profileForm
      );
      
      const updatedOrg = await response.json();
      
      // Atualizar o cache
      queryClient.setQueryData(["/api/organizations", organizationId], updatedOrg);
      
      toast({
        title: "Sucesso!",
        description: "Os dados da organização foram atualizados.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar dados da organização",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !organizationId || !user) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      // Usando fetch diretamente porque apiRequest não suporta FormData adequadamente
      const response = await fetch(
        `/api/organizations/${organizationId}/logo`,
        { 
          method: "POST", 
          body: formData,
          credentials: 'include', // Incluir cookies de sessão na requisição
          // Não definir Content-Type para permitir que o navegador configure o boundary
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao fazer upload do logo: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Atualizar o cache
      queryClient.setQueryData(["/api/organizations", organizationId], (oldData: Organization | undefined) => {
        if (!oldData) return;
        return { ...oldData, logo: result.logoUrl };
      });
      
      // Atualize também o cache do usuário se necessário
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Sucesso!",
        description: "Logo da organização atualizado.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer upload do logo",
        variant: "destructive",
      });
    }
  };

  if (isUserLoading || isOrgLoading) {
    return (
      <OrganizationLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OrganizationLayout>
    );
  }

  if (error || !organization) {
    return (
      <OrganizationLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold text-red-500">Erro ao carregar dados</h1>
          <p className="text-gray-500">{error instanceof Error ? error.message : "Erro desconhecido"}</p>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout>
      <div className="container max-w-6xl mx-auto py-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                      <AvatarImage src={organization.logo || ""} alt={organization.name} />
                      <AvatarFallback className="text-4xl bg-green-100 text-green-700">
                        {organization.name?.charAt(0).toUpperCase() || "O"}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="logo-upload"
                      className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={uploadLogo}
                      />
                    </label>
                  </div>
                  <h2 className="text-xl font-bold text-center">{organization.name}</h2>
                  {organization.cnpj && (
                    <p className="text-sm text-gray-500 text-center">CNPJ: {organization.cnpj}</p>
                  )}
                  <div className="w-full border-t pt-4 mt-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 py-1">
                      <Mail className="h-4 w-4" />
                      <span>{organization.email || "Email não informado"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 py-1">
                      <Phone className="h-4 w-4" />
                      <span>{organization.phoneNumber || "Telefone não informado"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 py-1">
                      <Building className="h-4 w-4" />
                      <span>{organization.address ? `${organization.address}, ${organization.city}/${organization.state}` : "Endereço não informado"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <Tabs defaultValue="profile" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Informações da Organização</TabsTrigger>
                <TabsTrigger value="admin">Administração</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados da Organização</CardTitle>
                    <CardDescription>
                      Atualize as informações sobre sua organização
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome da Organização</Label>
                          <Input
                            id="name"
                            name="name"
                            value={profileForm.name || ""}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="legalName">Razão Social</Label>
                          <Input
                            id="legalName"
                            name="legalName"
                            value={profileForm.legalName || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input
                            id="cnpj"
                            name="cnpj"
                            value={profileForm.cnpj || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileForm.email || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Telefone</Label>
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={profileForm.phoneNumber || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            value={profileForm.website || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Endereço</Label>
                          <Input
                            id="address"
                            name="address"
                            value={profileForm.address || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            name="city"
                            value={profileForm.city || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            name="state"
                            value={profileForm.state || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">CEP</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={profileForm.zipCode || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={profileForm.description || ""}
                          onChange={handleInputChange}
                          rows={4}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : 'Salvar Alterações'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="admin">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações Administrativas</CardTitle>
                    <CardDescription>
                      Gerencie as configurações administrativas da sua organização
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="border p-4 rounded-md">
                        <h3 className="text-lg font-medium">Usuários Administradores</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Lista de usuários com permissões administrativas nesta organização
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            window.history.pushState({}, '', '/organization/administrators');
                            window.dispatchEvent(new Event('popstate'));
                          }}
                        >
                          Gerenciar Administradores
                        </Button>
                      </div>
                      
                      <div className="border p-4 rounded-md">
                        <h3 className="text-lg font-medium">Plano e Assinatura</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Gerencie o plano e a assinatura da sua organização
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            window.history.pushState({}, '', '/organization/meu-plano');
                            window.dispatchEvent(new Event('popstate'));
                          }}
                        >
                          Gerenciar Plano
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos</CardTitle>
                    <CardDescription>
                      Documentos da organização para fins legais e de compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="border p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium">Documentos Cadastrais</h3>
                            <p className="text-sm text-gray-500">
                              Documentos necessários para registro e operação
                            </p>
                          </div>
                          <Button variant="outline">Gerenciar</Button>
                        </div>
                      </div>
                      
                      <div className="border p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium">Certificações</h3>
                            <p className="text-sm text-gray-500">
                              Certificados, licenças e outras documentações
                            </p>
                          </div>
                          <Button variant="outline">Gerenciar</Button>
                        </div>
                      </div>
                      
                      <div className="border p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium">Relatórios</h3>
                            <p className="text-sm text-gray-500">
                              Relatórios periódicos e documentação de compliance
                            </p>
                          </div>
                          <Button variant="outline">Gerenciar</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}