import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrganizationConfirmation() {
  const { toast } = useToast();
  
  // Navigation function
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };
  
  // Display success toast when the component mounts
  useEffect(() => {
    toast({
      title: "Organização criada com sucesso!",
      description: "Sua organização foi criada e ativada automaticamente.",
      variant: "default",
    });

    // Após 3 segundos, redirecionar para a página de login
    const timer = setTimeout(() => {
      navigate('/login?status=registered');
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Organização Criada!</CardTitle>
          <CardDescription>
            Sua organização foi registrada e ativada automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Obrigado por se cadastrar na nossa plataforma. Sua organização foi criada e 
            ativada automaticamente. Enviamos um e-mail com as instruções de acesso.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-lg mb-2">Próximos passos:</h3>
            <ul className="text-sm text-left list-disc pl-5 space-y-1">
              <li>Verifique seu e-mail para obter as credenciais de acesso</li>
              <li>Faça login com as credenciais fornecidas</li>
              <li>Configure as informações adicionais da sua organização</li>
              <li>Adicione outros usuários e comece a utilizar o sistema</li>
            </ul>
          </div>
          <div className="flex items-center justify-center bg-blue-50 p-4 rounded-lg text-blue-700 mb-4">
            <Mail className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Um e-mail com as instruções de acesso foi enviado para o seu endereço cadastrado.</span>
          </div>
          <p className="text-sm text-gray-500">
            Você será redirecionado para a página de login em alguns segundos.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/login?status=registered')}
          >
            Ir para o Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}