"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Plan } from '@shared/schema';

// Importação condicional de stripe para funcionar com SSR
let loadStripe: any;

if (typeof window !== "undefined") {
  import('@stripe/stripe-js').then((module) => {
    loadStripe = module.loadStripe;
  });
}

interface PaymentFormWrapperProps {
  clientSecret: string;
  onSuccess: (paymentIntent: string) => void;
  onCancel: () => void;
  planName: string;
  planPrice: string;
}

export default function PaymentFormWrapper({
  clientSecret,
  onSuccess,
  onCancel,
  planName,
  planPrice
}: PaymentFormWrapperProps) {
  const { toast } = useToast();
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [stripeElements, setStripeElements] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Esta inicialização foi movida para o efeito abaixo
  // para evitar duplicação

  useEffect(() => {
    // Só tentar inicializar o Stripe quando tivermos certeza de que loadStripe está disponível
    if (typeof window !== "undefined" && !stripePromise && loadStripe) {
      console.log("Inicializando Stripe...");
      // Usar a chave pública do Stripe das variáveis de ambiente
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      
      console.log("Verificando chave pública do Stripe:", 
        stripePublicKey ? "Chave encontrada (começa com " + stripePublicKey.substring(0, 5) + "...)" : "Chave não encontrada");
      
      if (!stripePublicKey) {
        console.error("VITE_STRIPE_PUBLIC_KEY não está definida nas variáveis de ambiente");
        setErrorMessage("Erro de configuração do Stripe - Entre em contato com o suporte");
        setPaymentStatus('error');
        return;
      }
      
      try {
        console.log("Inicializando Stripe com a chave pública");
        const promise = loadStripe(stripePublicKey);
        console.log("Promise do Stripe criada com sucesso:", promise ? "OK" : "Falha");
        setStripePromise(promise);
      } catch (error) {
        console.error("Erro ao inicializar Stripe:", error);
        setErrorMessage("Erro ao inicializar o sistema de pagamento. Por favor, tente novamente mais tarde.");
        setPaymentStatus('error');
      }
    }
  }, [loadStripe, stripePromise]);

  useEffect(() => {
    if (!stripePromise || !clientSecret) {
      if (!clientSecret) {
        console.error("Client Secret está indefinido");
        setErrorMessage('Erro de configuração do Stripe. Client Secret não fornecido.');
        setPaymentStatus('error');
      }
      return;
    }

    let mounted = true;
    
    // Validar formato do Client Secret
    if (typeof clientSecret !== 'string') {
      console.error("Client Secret não é uma string:", typeof clientSecret);
      setErrorMessage('Erro de configuração do Stripe. Client Secret em formato inválido.');
      setPaymentStatus('error');
      return;
    }
    
    // Validar se o formato parece com um client secret do Stripe
    // Client secrets podem começar com pi_ (payment intent), seti_ (setup intent), etc.
    // O que importa é que tenha um prefixo válido ou _secret_ no meio
    const isValidStripeSecret = 
      clientSecret.startsWith('pi_') || 
      clientSecret.startsWith('seti_') || 
      clientSecret.includes('_secret_');
      
    if (!isValidStripeSecret) {
      console.error("Client Secret em formato inválido (valor completo):", clientSecret);
      setErrorMessage('Formato de token de pagamento inválido. Por favor, tente novamente.');
      setPaymentStatus('error');
      return;
    }
    
    const setupElements = async () => {
      try {
        console.log("Setting up Stripe Elements with clientSecret:", clientSecret);
        const stripe = await stripePromise;
        
        if (!stripe) {
          console.error("Stripe não foi carregado corretamente");
          setErrorMessage('Erro na inicialização do Stripe. Verifique suas configurações.');
          setPaymentStatus('error');
          return;
        }

        const options = {
          clientSecret,
          appearance: {
            theme: 'stripe',
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

        console.log("Creating elements with options:", options);
        
        try {
          const elements = stripe.elements(options);
          
          // Usar setTimeout para garantir que o DOM esteja pronto
          setTimeout(() => {
            if (!mounted) return;
            
            try {
              // Verificar se o elemento existe no DOM
              const paymentElementContainer = document.getElementById('payment-element');
              
              if (!paymentElementContainer) {
                console.error("Container #payment-element não encontrado no DOM");
                setErrorMessage('Erro na montagem do formulário. Elemento de pagamento não encontrado.');
                setPaymentStatus('error');
                return;
              }
              
              console.log("Mounting payment element to:", paymentElementContainer);
              
              // Limpar o conteúdo anterior, se houver
              paymentElementContainer.innerHTML = '';
              
              // Criar e montar o formulário de pagamento
              try {
                const paymentElement = elements.create('payment');
                paymentElement.mount('#payment-element');
                
                setStripeElements({ stripe, elements, paymentElement });
              } catch (elemError) {
                console.error('Erro ao criar ou montar elemento de pagamento:', elemError);
                setErrorMessage('Não foi possível inicializar o formulário de pagamento. Erro interno.');
                setPaymentStatus('error');
              }
            } catch (domError) {
              console.error('Erro ao interagir com o DOM:', domError);
              setErrorMessage('Erro de interface. Tente recarregar a página.');
              setPaymentStatus('error');
            }
          }, 100);
        } catch (elementsError) {
          console.error('Erro ao criar Stripe Elements:', elementsError);
          setErrorMessage('Erro na criação do formulário de pagamento. Verifique o Client Secret.');
          setPaymentStatus('error');
        }
      } catch (error) {
        console.error('Erro ao configurar Stripe Elements:', error);
        setErrorMessage('Não foi possível carregar o formulário de pagamento. Por favor, tente novamente.');
        setPaymentStatus('error');
      }
    };

    setupElements();
    
    return () => {
      mounted = false;
    };
  }, [stripePromise, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripeElements) {
      return;
    }
    
    const { stripe, elements } = stripeElements;
    
    if (!stripe || !elements) {
      return;
    }
    
    setPaymentStatus('processing');
    
    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-callback',
        },
        redirect: 'if_required',
      });
      
      if (submitError) {
        console.error('Erro no pagamento:', submitError);
        setErrorMessage(submitError.message || 'Houve um erro ao processar o pagamento.');
        setPaymentStatus('error');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Pagamento confirmado!",
          description: "Sua assinatura foi ativada com sucesso.",
        });
        setPaymentStatus('success');
        onSuccess(paymentIntent.id);
      } else {
        // Pagamento em andamento ou com autenticação
        toast({
          title: "Processando pagamento",
          description: "Estamos processando seu pagamento. Por favor, aguarde.",
        });
      }
    } catch (err: any) {
      console.error('Erro ao confirmar pagamento:', err);
      setErrorMessage(err.message || 'Houve um erro ao processar o pagamento.');
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
            <div id="payment-element" className="p-4 border rounded-md" />
            
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
                <Button type="submit" disabled={!stripeElements}>
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