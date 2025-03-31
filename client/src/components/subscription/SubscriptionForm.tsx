import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createSubscriptionPayment } from '@/lib/subscriptionClient';
import { Plan } from '@shared/schema';

// Carregar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Componente de formulário de pagamento
function SubscriptionCheckoutForm({ 
  clientSecret, 
  onSuccess 
}: { 
  clientSecret: string, 
  onSuccess: () => void 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirmar o pagamento com o Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || "Ocorreu um erro ao processar o pagamento.");
        toast({
          title: "Erro no pagamento",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Pagamento bem-sucedido
        toast({
          title: "Assinatura ativada!",
          description: "Seu pagamento foi processado com sucesso.",
        });
        
        // Chamar callback de sucesso
        onSuccess();
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Ocorreu um erro ao processar o pagamento.");
      toast({
        title: "Erro no pagamento",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no pagamento</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processando..." : "Iniciar assinatura"}
      </Button>
    </form>
  );
}

interface SubscriptionFormProps {
  plan: Plan;
  organizationId: number;
  onSuccess: () => void;
}

export default function SubscriptionForm({ plan, organizationId, onSuccess }: SubscriptionFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const initializeSubscription = async () => {
      try {
        // Criar um intent de pagamento de assinatura
        const result = await createSubscriptionPayment(plan.id, organizationId);
        setClientSecret(result.clientSecret);
      } catch (error: any) {
        console.error('Erro ao inicializar assinatura:', error);
        setError(error.message || 'Ocorreu um erro ao inicializar o pagamento da assinatura.');
        toast({
          title: "Erro ao criar assinatura",
          description: error.message || 'Ocorreu um erro ao inicializar a assinatura.',
          variant: "destructive",
        });
      }
    };

    initializeSubscription();
  }, [plan.id, organizationId, toast]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao configurar assinatura</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          Assinatura: {plan.name}
        </CardTitle>
        <CardDescription>
          Assinatura mensal com renovação automática
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <SubscriptionCheckoutForm 
            clientSecret={clientSecret}
            onSuccess={onSuccess}
          />
        </Elements>
      </CardContent>
      <CardFooter className="bg-muted/30 flex-col space-y-2 text-xs">
        <p>
          Ao confirmar, você autoriza que seja cobrado R$ {plan.price.toFixed(2).replace('.', ',')} 
          mensalmente pelo plano {plan.name} até que você cancele a assinatura.
        </p>
      </CardFooter>
    </Card>
  );
}