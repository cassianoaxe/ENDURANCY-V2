import { useEffect, useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripeClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Plan } from '@shared/schema';

// Wrapper component that provides Stripe context
export function PaymentFormWrapper({
  planId,
  onPaymentSuccess,
  onBack,
  selectedPlan,
}: {
  planId: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  selectedPlan: Plan;
}) {
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Handle case when Stripe is not initialized
  useEffect(() => {
    // Check if Stripe key is available
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setStripeError("Chave Stripe não encontrada. Por favor, configure a chave VITE_STRIPE_PUBLISHABLE_KEY.");
    }
  }, []);

  if (stripeError) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Erro de Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{stripeError}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={onBack}>Voltar</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        planId={planId}
        onPaymentSuccess={onPaymentSuccess}
        onBack={onBack}
        selectedPlan={selectedPlan}
      />
    </Elements>
  );
}

// Card input styling options
const cardStyle = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

function PaymentForm({
  planId,
  onPaymentSuccess,
  onBack,
  selectedPlan,
}: {
  planId: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  selectedPlan: Plan;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Fetch payment intent when component mounts
  useEffect(() => {
    async function fetchPaymentIntent() {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Erro ao iniciar o pagamento. Por favor, tente novamente.');
      }
    }
    
    fetchPaymentIntent();
  }, [planId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }
    
    if (!cardComplete) {
      setError('Por favor, preencha os dados do cartão.');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Erro ao processar o cartão. Recarregue a página e tente novamente.');
      setProcessing(false);
      return;
    }
    
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });
      
      if (error) {
        setError(error.message || 'Erro ao processar o pagamento.');
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful
        onPaymentSuccess(paymentIntent.id);
      } else {
        setError(`Pagamento ${paymentIntent.status}. Por favor, tente novamente.`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Erro ao processar o pagamento. Por favor, tente novamente.');
    }
    
    setProcessing(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Pagamento do Plano</CardTitle>
        <CardDescription>
          Preencha os dados do cartão para concluir o pagamento do plano {selectedPlan?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="payment-form" onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6">
            <p className="mb-2 font-semibold">Resumo:</p>
            <div className="flex justify-between">
              <span>Plano:</span>
              <span>{selectedPlan?.name}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Valor:</span>
              <span>R$ {selectedPlan?.price}</span>
            </div>
            
            <div className="p-4 border rounded-md bg-slate-50 mb-4">
              <CardElement 
                options={cardStyle} 
                onChange={(e) => setCardComplete(e.complete)} 
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={processing}>
          Voltar
        </Button>
        <Button 
          type="submit" 
          form="payment-form" 
          disabled={!stripe || processing || !cardComplete}
        >
          {processing ? <Spinner className="mr-2" /> : null}
          {processing ? 'Processando...' : 'Pagar'}
        </Button>
      </CardFooter>
    </Card>
  );
}