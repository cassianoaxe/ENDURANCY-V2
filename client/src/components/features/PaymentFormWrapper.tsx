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

  // Inicializar Stripe apenas no lado do cliente
  useEffect(() => {
    if (typeof window !== "undefined" && loadStripe) {
      // Substituir pela chave pública do Stripe disponível nas variáveis de ambiente
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_yourkey';
      const promise = loadStripe(stripePublicKey);
      setStripePromise(promise);
    }
  }, []);

  useEffect(() => {
    if (!stripePromise || !clientSecret) return;

    const setupElements = async () => {
      try {
        const stripe = await stripePromise;
        
        if (!stripe) {
          console.error("Stripe não foi carregado corretamente");
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

        const elements = stripe.elements(options);
        
        // Criar e montar o formulário de pagamento
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        
        setStripeElements({ stripe, elements, paymentElement });
      } catch (error) {
        console.error('Erro ao configurar Stripe Elements:', error);
        setErrorMessage('Não foi possível carregar o formulário de pagamento. Por favor, tente novamente.');
        setPaymentStatus('error');
      }
    };

    setupElements();
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