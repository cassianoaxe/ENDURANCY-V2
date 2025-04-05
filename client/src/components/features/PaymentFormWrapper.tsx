"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface PaymentFormWrapperProps {
  clientSecret: string;
  onSuccess: (paymentIntent: string) => void;
  onCancel: () => void;
  planName: string;
  planPrice: string;
}

// Criar a Promise do Stripe uma única vez fora do componente
const getStripePromise = () => {
  // Usar a chave pública diretamente para evitar problemas com variáveis de ambiente
  // Para testes, é melhor usar a chave de teste, não a de produção
  const stripePublicKey = 'pk_test_51QrzguFYDCrcCFsoH95bZv29ggT58pLwC3C3PEwOYCXXTNVfCBPH7QUkZZdDCzLuPakAMjRSHbfj3dOQNWVgqJgR005cKz7VSc';
  
  try {
    console.log("Inicializando Stripe com a chave pública fixa");
    return loadStripe(stripePublicKey);
  } catch (error) {
    console.error("Erro ao inicializar Stripe:", error);
    return null;
  }
};

export default function PaymentFormWrapper({
  clientSecret,
  onSuccess,
  onCancel,
  planName,
  planPrice
}: PaymentFormWrapperProps) {
  const { toast } = useToast();
  const stripePromiseRef = useRef<Promise<Stripe | null> | null>(null);
  const elementsRef = useRef<any>(null);
  const [paymentElement, setPaymentElement] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicialização do Stripe - apenas uma vez na montagem do componente
  useEffect(() => {
    console.log("Inicializando Stripe...");
    stripePromiseRef.current = getStripePromise();
    
    return () => {
      // Limpar qualquer recurso do Stripe na desmontagem
      elementsRef.current = null;
      setPaymentElement(null);
    };
  }, []);

  // Configuração dos Elements quando o clientSecret muda
  useEffect(() => {
    let isMounted = true;
    
    // Validações iniciais
    if (!clientSecret) {
      console.error("Client Secret está indefinido");
      setErrorMessage('Erro de configuração. Token de pagamento não fornecido.');
      setPaymentStatus('error');
      return;
    }

    if (typeof clientSecret !== 'string') {
      console.error("Client Secret não é uma string:", typeof clientSecret);
      setErrorMessage('Erro de configuração. Token de pagamento em formato inválido.');
      setPaymentStatus('error');
      return;
    }

    // Validar formato do client secret
    const isValidStripeSecret = 
      clientSecret.startsWith('pi_') || 
      clientSecret.includes('_secret_');
      
    if (!isValidStripeSecret) {
      console.error("Client Secret em formato inválido:", clientSecret.substring(0, 10) + "...");
      setErrorMessage('Formato de token de pagamento inválido. Por favor, tente novamente.');
      setPaymentStatus('error');
      return;
    }

    const setupStripeElements = async () => {
      try {
        if (!stripePromiseRef.current) {
          console.error("Stripe promise não está disponível");
          setErrorMessage('Erro de inicialização do Stripe. Tente recarregar a página.');
          setPaymentStatus('error');
          return;
        }

        console.log("Aguardando promise do Stripe...");
        const stripe = await stripePromiseRef.current;
        
        if (!stripe) {
          console.error("Falha ao carregar o Stripe");
          setErrorMessage('Erro ao carregar o processador de pagamentos. Verifique sua conexão.');
          setPaymentStatus('error');
          return;
        }

        // Definir opções para o Stripe Elements
        const options = {
          clientSecret,
          appearance: {
            theme: 'stripe' as const,
            variables: {
              colorPrimary: '#10b981',
              colorBackground: '#ffffff',
              colorText: '#30313d',
              colorDanger: '#df1b41',
              fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
              borderRadius: '4px',
            },
          },
        };

        console.log("Criando Stripe Elements...");
        const elements = stripe.elements(options);
        elementsRef.current = elements;

        // Dar tempo para o DOM ser renderizado
        setTimeout(() => {
          if (!isMounted) return;

          try {
            const container = document.getElementById('payment-element');
            if (!container) {
              console.error("Container do elemento de pagamento não encontrado");
              setErrorMessage('Erro na interface. Elemento de pagamento não encontrado.');
              setPaymentStatus('error');
              return;
            }

            console.log("Criando e montando Payment Element...");
            // Limpar o contêiner para garantir que não haja elementos anteriores
            container.innerHTML = '';
            
            const element = elements.create('payment');
            element.mount('#payment-element');
            
            if (isMounted) {
              setPaymentElement(element);
              console.log("Payment Element montado com sucesso!");
            }
          } catch (mountError: any) {
            console.error("Erro ao montar Payment Element:", mountError);
            if (isMounted) {
              setErrorMessage(`Erro ao criar formulário de pagamento: ${mountError.message || 'Erro desconhecido'}`);
              setPaymentStatus('error');
            }
          }
        }, 500);

      } catch (error: any) {
        console.error("Erro na configuração do Stripe:", error);
        if (isMounted) {
          setErrorMessage(`Falha na configuração do pagamento: ${error.message || 'Tente novamente mais tarde'}`);
          setPaymentStatus('error');
        }
      }
    };

    setupStripeElements();

    return () => {
      isMounted = false;
      // Não limpar elementsRef.current aqui, pois isso vai acontecer na próxima execução deste efeito
    };
  }, [clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripePromiseRef.current || !elementsRef.current) {
      console.error("Stripe não inicializado:", { 
        stripePromise: !!stripePromiseRef.current, 
        elements: !!elementsRef.current 
      });
      
      toast({
        title: "Erro de inicialização",
        description: "O sistema de pagamento não está pronto. Aguarde alguns segundos e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se o Payment Element está realmente montado
    if (!paymentElement) {
      console.error("Payment Element não está montado");
      toast({
        title: "Formulário não carregado",
        description: "O formulário de pagamento não foi carregado completamente. Atualize a página e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentStatus('processing');
    
    try {
      const stripe = await stripePromiseRef.current;
      if (!stripe) {
        throw new Error("Stripe não foi inicializado corretamente");
      }
      
      console.log("Confirmando pagamento...");
      const result = await stripe.confirmPayment({
        elements: elementsRef.current,
        confirmParams: {
          return_url: window.location.origin + '/payment-callback',
        },
        redirect: 'if_required',
      });
      
      if (result.error) {
        console.error("Erro na confirmação do pagamento:", result.error);
        setErrorMessage(result.error.message || 'Houve um erro ao processar o pagamento.');
        setPaymentStatus('error');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        console.log("Pagamento confirmado com sucesso!");
        toast({
          title: "Pagamento confirmado!",
          description: "Sua assinatura foi ativada com sucesso.",
        });
        setPaymentStatus('success');
        onSuccess(result.paymentIntent.id);
      } else {
        console.log("Status do pagamento:", result.paymentIntent?.status);
        toast({
          title: "Processando pagamento",
          description: "Estamos processando seu pagamento. Por favor, aguarde.",
        });
      }
    } catch (err: any) {
      console.error("Exceção ao confirmar pagamento:", err);
      setErrorMessage(err.message || 'Ocorreu um erro inesperado no processamento do pagamento.');
      setPaymentStatus('error');
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center">Pagamento confirmado!</CardTitle>
          <CardDescription className="text-center">
            Sua assinatura foi ativada com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => onSuccess('payment-succeeded')} className="w-full">
            Continuar para o painel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Finalizar assinatura</CardTitle>
        <CardDescription>
          Plano: {planName} - R$ {planPrice}/mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentStatus === 'error' && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no pagamento</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div id="payment-element" className="p-4 border rounded-md min-h-[200px]" />
            
            {paymentStatus === 'processing' ? (
              <Button disabled className="w-full">
                <Spinner className="mr-2" size="sm" />
                Processando...
              </Button>
            ) : (
              <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Voltar
                </Button>
                <Button type="submit" disabled={!paymentElement}>
                  Confirmar pagamento
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}