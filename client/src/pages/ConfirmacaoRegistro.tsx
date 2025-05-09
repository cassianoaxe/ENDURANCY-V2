import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Check, Mail, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Página de confirmação após o registro de organização
 * Mostra informações sobre os próximos passos, especialmente 
 * sobre o link de pagamento enviado por email
 */
export default function ConfirmacaoRegistro() {
  const [location, setLocation] = useLocation();
  
  // Extrair parâmetros da URL
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';
  const orgName = params.get('orgName') || 'sua organização';
  const planName = params.get('planName') || 'selecionado';
  
  // Voltar para a página inicial ou de login
  const goToLogin = () => {
    setLocation('/login?status=registered');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Registro Concluído</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            O registro de <span className="font-medium">{orgName}</span> foi recebido com sucesso.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="default" className="bg-blue-50 border-blue-100">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 font-medium">Verifique seu email</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm">
              Enviamos as instruções de pagamento para <span className="font-medium">{email || 'seu email'}</span>. 
              <strong className="block mt-1 text-blue-800">⚠️ IMPORTANTE: Verifique também sua pasta de SPAM ou Lixo Eletrônico!</strong>
            </AlertDescription>
          </Alert>
          
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Próximos passos:</h3>
            <ol className="space-y-2 pl-5 list-decimal text-sm text-gray-700">
              <li>Acesse o link de pagamento enviado para seu email</li>
              <li>Efetue o pagamento do plano <span className="font-medium">{planName}</span></li>
              <li>Após a confirmação, sua conta será ativada automaticamente</li>
              <li>Você receberá um email com as credenciais de acesso</li>
            </ol>
          </div>
          
          <Alert variant="warning" className="bg-yellow-50 border-yellow-100">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 font-medium">Importante</AlertTitle>
            <AlertDescription className="text-yellow-700 text-sm">
              O link de pagamento é válido por 24 horas. Após esse período,
              você precisará solicitar um novo link.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-[#4CAF50] hover:bg-[#43a047]" 
            onClick={goToLogin}
          >
            Acessar Login
          </Button>
        </CardFooter>
      </Card>
      
      <p className="text-sm text-gray-500 mt-8">
        Precisa de ajuda? Entre em contato com nosso suporte em <a href="mailto:suporte@endurancy.com" className="text-blue-600 hover:underline">suporte@endurancy.com</a>
      </p>
    </div>
  );
}