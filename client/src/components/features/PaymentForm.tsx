import React, { useState, FormEvent } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertTriangle } from 'lucide-react';

// Inicializar o Stripe.js com a chave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormWrapperProps {
  token: string;
  onSuccess: (paymentMethodId: string) => void;
}

interface PaymentFormInnerProps {
  token: string;
  onSuccess: (paymentMethodId: string) => void;
}

// Estilos para o componente CardElement
const cardElementStyle = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: 'antialiased',
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

// Componente interno que usa os hooks do Stripe
const PaymentFormInner = ({ token, onSuccess }: PaymentFormInnerProps) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // O Stripe.js ainda não foi carregado
      return;
    }
    
    if (!cardholderName) {
      setError('Por favor, informe o nome do titular do cartão.');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Erro ao obter os dados do cartão. Tente novamente.');
      setProcessing(false);
      return;
    }
    
    try {
      // Criar um Payment Method
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });
      
      if (createError) {
        setError(createError.message || 'Erro ao processar o cartão. Verifique os dados e tente novamente.');
        setProcessing(false);
        return;
      }
      
      if (!paymentMethod || !paymentMethod.id) {
        setError('Erro ao processar o cartão. Tente novamente mais tarde.');
        setProcessing(false);
        return;
      }
      
      // Passar o ID do método de pagamento para o callback de sucesso
      onSuccess(paymentMethod.id);
    } catch (error: any) {
      console.error('Erro no processamento do pagamento:', error);
      setError(error.message || 'Erro inesperado. Tente novamente mais tarde.');
      setProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
          Nome no cartão
        </label>
        <input
          id="cardholderName"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Nome impresso no cartão"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          disabled={processing}
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-1">
          Dados do cartão
        </label>
        <div className="border border-gray-300 rounded-md p-3 shadow-sm">
          <CardElement id="card-element" options={cardElementStyle} />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Processado com segurança pela Stripe. Seus dados são criptografados.
        </p>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded p-3 flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}
      
      <button
        type="submit"
        className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        disabled={!stripe || processing}
      >
        {processing ? 'Processando...' : 'Pagar agora'}
      </button>
    </form>
  );
};

// Componente wrapper que inicializa o Stripe
export default function PaymentForm({ token, onSuccess }: PaymentFormWrapperProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner token={token} onSuccess={onSuccess} />
    </Elements>
  );
}