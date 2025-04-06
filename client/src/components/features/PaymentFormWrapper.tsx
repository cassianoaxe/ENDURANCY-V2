"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentFormWrapperProps {
  clientSecret: string;
  onSuccess: (paymentIntent: string) => void;
  onCancel: () => void;
  planName: string;
  planPrice: string;
}

// Criar a Promise do Stripe uma única vez fora do componente
const stripePromise = loadStripe('pk_live_51QrzgiFWXqtPEhT6MFvVRUedbhVmjvE4i12BdDB5f7pV0Gq453iiv4EOXKJwf6hg9MkINpyNxXYjBpzg1kSH8V5q00fCh3JVGD');

// Componente principal que exportamos
export default function PaymentFormWrapper(props: PaymentFormWrapperProps) {
  console.log("Renderizando PaymentFormWrapper com clientSecret:", props.clientSecret?.substring(0, 10) + "...");
  
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}

// Componente interno para o formulário de pagamento
function PaymentForm({ 
  clientSecret, 
  onSuccess, 
  onCancel, 
  planName, 
  planPrice 
}: PaymentFormWrapperProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registro quando o componente é montado
  useEffect(() => {
    console.log("PaymentForm montado com stripe:", !!stripe, "elements:", !!elements);
  }, [stripe, elements]);

  // Objeto de estilo para o CardElement
  const cardStyle = {
    style: {
      base: {
        color: '#303238',
        fontSize: '16px',
        fontFamily: 'sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#e5424d',
        iconColor: '#e5424d',
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      console.error("Stripe não inicializado");
      toast({
        title: "Erro de inicialização",
        description: "O sistema de pagamento não está pronto. Aguarde alguns segundos e tente novamente.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error("Elemento de cartão não encontrado");
      toast({
        title: "Formulário incompleto",
        description: "Não foi possível encontrar o formulário de cartão. Tente recarregar a página.",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentStatus('processing');
    
    try {
      console.log("Confirmando pagamento com clientSecret:", clientSecret.substring(0, 10) + "...");
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });
      
      if (error) {
        console.error("Erro na confirmação do pagamento:", error);
        setErrorMessage(error.message || 'Houve um erro ao processar o pagamento.');
        setPaymentStatus('error');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log("Pagamento confirmado com sucesso!");
        toast({
          title: "Pagamento confirmado!",
          description: "Sua assinatura foi ativada com sucesso.",
        });
        setPaymentStatus('success');
        onSuccess(paymentIntent.id);
      } else {
        console.log("Status do pagamento:", paymentIntent?.status);
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
            <div className="p-4 border rounded-md min-h-[80px]">
              <CardElement options={cardStyle} />
            </div>
            
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
                <Button type="submit" disabled={!stripe || !elements}>
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