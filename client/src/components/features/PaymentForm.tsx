import React, { useState, FormEvent } from 'react';
import { AlertTriangle } from 'lucide-react';

interface PaymentFormProps {
  token: string;
  onSuccess: (paymentType: string) => void;
}

// Componente de formulário de pagamento simplificado sem Stripe
export default function PaymentForm({ token, onSuccess }: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState('');
  const [paymentType, setPaymentType] = useState('boleto');
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!name) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // Simplesmente chama o callback de sucesso com o tipo de pagamento
      // O processamento real acontecerá no servidor
      onSuccess(paymentType);
    } catch (error: any) {
      console.error('Erro no processamento da solicitação:', error);
      setError(error.message || 'Erro inesperado. Tente novamente mais tarde.');
      setProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome completo
        </label>
        <input
          id="name"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Digite seu nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={processing}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Forma de pagamento
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="payment-boleto"
              name="payment-type"
              type="radio"
              value="boleto"
              checked={paymentType === 'boleto'}
              onChange={() => setPaymentType('boleto')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              disabled={processing}
            />
            <label htmlFor="payment-boleto" className="ml-3 block text-sm font-medium text-gray-700">
              Boleto bancário
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="payment-pix"
              name="payment-type"
              type="radio"
              value="pix"
              checked={paymentType === 'pix'}
              onChange={() => setPaymentType('pix')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              disabled={processing}
            />
            <label htmlFor="payment-pix" className="ml-3 block text-sm font-medium text-gray-700">
              PIX
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="payment-transfer"
              name="payment-type"
              type="radio"
              value="transfer"
              checked={paymentType === 'transfer'}
              onChange={() => setPaymentType('transfer')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              disabled={processing}
            />
            <label htmlFor="payment-transfer" className="ml-3 block text-sm font-medium text-gray-700">
              Transferência bancária
            </label>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Você receberá as instruções de pagamento por e-mail.
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
        disabled={processing}
      >
        {processing ? 'Processando...' : 'Confirmar pedido'}
      </button>
    </form>
  );
}