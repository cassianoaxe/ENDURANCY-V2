import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";

interface InvitationData {
  id: number;
  email: string;
  role: string;
  organizationId: number;
  invitedBy: number;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  organizationName: string;
  isValid: boolean;
}

export default function AcceptInvitation() {
  const { token } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Buscar os detalhes do convite
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user-invitations/verify/${token}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Convite inválido ou expirado");
        }
        
        const invitationData = await response.json();
        setInvitation(invitationData);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchInvitation();
    } else {
      setError("Token de convite inválido");
      setLoading(false);
    }
  }, [token]);

  // Handler para atualização dos inputs do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler para submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira seu nome completo",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação devem ser idênticas",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await apiRequest("POST", `/api/user-invitations/accept/${token}`, {
        name: formData.name,
        password: formData.password,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao aceitar convite");
      }
      
      setSuccess(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        setLocation("/auth");
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Erro ao aceitar convite",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Exibir tela de carregamento enquanto busca dados do convite
  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-medium">Verificando convite...</h2>
        </div>
      </div>
    );
  }

  // Exibir mensagem de erro se o convite for inválido
  if (error || !invitation) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            </div>
            <CardTitle className="text-2xl text-center">Convite Inválido</CardTitle>
            <CardDescription className="text-center">
              {error || "Este convite não existe ou já expirou."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/")}>
              Voltar para página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Exibir mensagem de erro se o convite já estiver sido usado ou expirado
  if (!invitation.isValid) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mb-2" />
            </div>
            <CardTitle className="text-2xl text-center">Convite Expirado</CardTitle>
            <CardDescription className="text-center">
              Este convite já foi utilizado ou expirou. Entre em contato com o administrador para solicitar um novo convite.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/")}>
              Voltar para página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Exibir mensagem de sucesso após aceitar o convite
  if (success) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            </div>
            <CardTitle className="text-2xl text-center">Bem-vindo!</CardTitle>
            <CardDescription className="text-center">
              Sua conta foi criada com sucesso. Você será redirecionado para a página de login em alguns instantes.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/auth")}>
              Ir para o login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Exibir formulário para aceitar o convite
  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-primary mb-2" />
          </div>
          <CardTitle className="text-2xl text-center">Aceitar Convite</CardTitle>
          <CardDescription className="text-center">
            Você foi convidado para participar da organização <span className="font-medium">{invitation.organizationName}</span> como <span className="font-medium">{invitation.role === "org_admin" ? "Administrador" : invitation.role}</span>.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={invitation.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Seu nome completo" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Crie uma senha" 
                value={formData.password} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha *</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirme sua senha" 
                value={formData.confirmPassword} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>Aceitar convite e criar conta</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}