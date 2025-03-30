import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
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
      title: "Solicitação enviada com sucesso!",
      description: "Sua solicitação de cadastro foi recebida e está sendo processada.",
      variant: "default",
    });
  }, [toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Cadastro Realizado!</CardTitle>
          <CardDescription>
            Sua solicitação de registro foi enviada com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Obrigado por se registrar na nossa plataforma. Sua solicitação está agora
            pendente de aprovação. Nossa equipe administrativa irá revisar a documentação
            enviada e demais informações antes de aprovar o acesso.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-lg mb-2">Próximos passos:</h3>
            <ul className="text-sm text-left list-disc pl-5 space-y-1">
              <li>Validação das informações da organização</li>
              <li>Análise da documentação enviada</li>
              <li>Aprovação administrativa da solicitação</li>
              <li>Configuração do ambiente da organização</li>
              <li>Geração do código de acesso único</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-blue-700 text-sm mb-4">
            <p className="font-medium mb-1">Informações importantes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>O processo de análise documental pode levar até 5 dias úteis.</li>
              <li>A aprovação dá acesso a um ambiente exclusivo para sua organização.</li>
              <li>Após aprovação, você receberá um código único de acesso ao sistema.</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500">
            Você receberá uma notificação por e-mail assim que seu cadastro for aprovado.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            Voltar ao Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/organizations')}
          >
            Ver Organizações
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}