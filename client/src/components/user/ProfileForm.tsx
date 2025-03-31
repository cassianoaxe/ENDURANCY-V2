import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

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

interface ProfileFormProps {
  user: User;
  onProfileUpdate: (updatedUser: Partial<User>) => void;
}

export function ProfileForm({ user, onProfileUpdate }: ProfileFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    bio: user.bio || ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remover o email do objeto formData antes de enviar para evitar que seja alterado
      const { email, ...dataToSend } = formData;
      
      const response = await apiRequest("PUT", "/api/profile", dataToSend);
      
      if (response.ok) {
        const updatedUser = await response.json();
        onProfileUpdate(updatedUser);
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso!",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar perfil");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsPhotoLoading(true);

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A foto não pode ser maior que 5MB.",
        variant: "destructive",
      });
      setIsPhotoLoading(false);
      return;
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Formato de arquivo inválido. Use JPG, JPEG, PNG ou GIF.",
        variant: "destructive",
      });
      setIsPhotoLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        onProfileUpdate(data.user);
        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso!",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar foto");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao fazer upload da foto.",
        variant: "destructive",
      });
    } finally {
      setIsPhotoLoading(false);
      // Limpar o input de arquivo
      e.target.value = '';
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Seu Perfil</CardTitle>
        <CardDescription>
          Atualize suas informações pessoais e foto de perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.profilePhoto || ""} alt={user.name} />
            <AvatarFallback className="text-xl">
              {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="photo" className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              {isPhotoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Alterar Foto"
              )}
            </Label>
            <Input 
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                title="O e-mail só pode ser alterado por um administrador da organização"
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                O e-mail só pode ser alterado por um administrador da organização
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Telefone</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleInputChange}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Sobre Você</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio || ""}
              onChange={handleInputChange}
              placeholder="Uma breve descrição sobre você..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}