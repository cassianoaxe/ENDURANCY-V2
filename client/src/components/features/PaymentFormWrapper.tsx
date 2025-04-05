import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Check, CreditCard } from 'lucide-react';

// Inicialize o Stripe com sua chave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface PaymentFormWrapperProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel?: () => void;
  planName?: string;
  planPrice?: string;
}

export default function PaymentFormWrapper({
  clientSecret,
  onSuccess,
  onCancel,
  planName = 'Plano Selecionado',
  planPrice = 'R$ 0,00'
}: PaymentFormWrapperProps) {
  if (!clientSecret) {
    return <div>Carregando formulário de pagamento...</div>;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#4f46e5',
        borderRadius: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm 
        onSuccess={onSuccess} 
        onCancel={onCancel} 
        planName={planName}
        planPrice={planPrice}
      />
    </Elements>
  );
}

interface PaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onCancel?: () => void;
  planName: string;
  planPrice: string;
}

function PaymentForm({ onSuccess, onCancel, planName, planPrice }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js ainda não carregou.
      // Desabilite o botão de envio até que o Stripe.js seja carregado.
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (result.error) {
        // Mostrar erro para o cliente (como, pagamento inválido)
        setPaymentError(result.error.message || 'Houve um erro ao processar o pagamento');
        toast({
          title: 'Erro no pagamento',
          description: result.error.message || 'Houve um erro ao processar o pagamento',
          variant: 'destructive',
        });
      } else if (result.paymentIntent) {
        // O pagamento foi processado com sucesso!
        setIsComplete(true);
        toast({
          title: 'Pagamento confirmado',
          description: 'Seu pagamento foi processado com sucesso!',
        });
        // Extrair o ID do payment intent e retorná-lo para o callback onSuccess
        onSuccess(result.paymentIntent.id);
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Ocorreu um erro ao processar o pagamento');
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message || 'Ocorreu um erro ao processar o pagamento',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Finalizar Pagamento
        </CardTitle>
        <CardDescription>
          Insira os dados do cartão para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-gray-800">{planName}</h3>
          <p className="text-xl font-bold text-primary">{planPrice}</p>
          <div className="text-sm text-gray-500 mt-1">Pagamento mensal</div>
        </div>

        {paymentError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>{paymentError}</div>
          </div>
        )}

        {isComplete ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
            <Check className="h-5 w-5" />
            <div>
              <p className="font-medium">Pagamento confirmado</p>
              <p className="text-sm">Seu cadastro está sendo finalizado...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <PaymentElement />
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isComplete && (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
            >
              Voltar
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={!stripe || !elements || isProcessing}
            >
              {isProcessing ? 'Processando...' : 'Pagar Agora'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}