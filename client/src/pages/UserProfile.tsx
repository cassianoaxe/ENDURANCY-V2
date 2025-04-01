import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/user/ProfileForm";
import { PasswordChangeForm } from "@/components/user/PasswordChangeForm";
import { Loader2, User as UserIcon, Key, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Definimos a interface User internamente para evitar problemas de importação
interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  profilePhoto?: string;
  role?: string;
  organizationId?: number | null;
}

export default function UserProfile() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/profile");
      if (!response.ok) {
        throw new Error("Falha ao carregar dados do perfil");
      }
      return response.json();
    }
  });

  const handleProfileUpdate = (updatedUser: Partial<User>) => {
    // Atualizar o cache do React Query
    queryClient.setQueryData(["/api/profile"], (oldData: User | undefined) => {
      if (!oldData) return updatedUser;
      return { ...oldData, ...updatedUser };
    });
    
    // Atualizar também o cache do usuário autenticado
    queryClient.setQueryData(["/api/auth/me"], (oldData: User | undefined) => {
      if (!oldData) return updatedUser;
      return { ...oldData, ...updatedUser };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-destructive text-lg mb-2">Erro ao carregar perfil</div>
        <p className="text-muted-foreground">Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Seu Perfil</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Informações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>Segurança</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <ProfileForm 
            user={user} 
            onProfileUpdate={handleProfileUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <PasswordChangeForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}