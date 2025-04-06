import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { LoaderCircle, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PaymentForm from '../components/features/PaymentForm';
import { apiRequest } from '../lib/queryClient';

// Componente de estado de erro
const ErrorState = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div className="text-red-500 text-4xl mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <h2 className="text-xl font-semibold text-red-800 mb-2">Problemas com a solicitação</h2>
    <p className="text-red-700">{message}</p>
    <a href="/" className="mt-4 inline-block py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
      Voltar para o início
    </a>
  </div>
);

// Componente de pedido concluído
const OrderSuccess = () => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
    <div className="text-green-500 text-4xl mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    </div>
    <h2 className="text-xl font-semibold text-green-800 mb-2">Pedido recebido com sucesso!</h2>
    <p className="text-green-700">As instruções para pagamento foram enviadas para seu e-mail.</p>
    <p className="text-green-700 mt-2">Sua organização já está ativa e você pode acessar o sistema.</p>
    <a href="/login" className="mt-4 inline-block py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
      Ir para o login
    </a>
  </div>
);

// Componente principal de pagamento
export default function Payment() {
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'processing' | 'success' | 'error'>('waiting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [tokenData, setTokenData] = useState<any>(null);
  const params = useParams<{ token: string }>();
  const [, setLocation] = useLocation();

  // Validar token de pagamento
  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment-token', params.token],
    queryFn: async () => {
      if (!params.token) throw new Error('Token não fornecido');
      return apiRequest(`/api/payment-links/validate/${params.token}`);
    },
    enabled: !!params.token,
    retry: false,
    staleTime: 0 // Sempre buscar dados frescos
  });

  useEffect(() => {
    // Quando receber os dados da validação do token
    if (data && data.success) {
      setTokenData(data.data);
    }
    // Se o token for inválido, mostrar erro
    else if (data && !data.success) {
      setPaymentStatus('error');
      setErrorMessage(data.message || 'Link de pagamento inválido ou expirado.');
    }
  }, [data]);

  // Função para confirmar o pedido e informar o tipo de pagamento
  const handlePayment = async (paymentType: string) => {
    setPaymentStatus('processing');
    
    try {
      const response = await apiRequest('/api/payment-links/process', {
        method: 'POST',
        body: JSON.stringify({
          token: params.token,
          paymentType
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.success) {
        // Pedido confirmado com sucesso
        setPaymentStatus('success');
      } else {
        // Erro no processamento do pedido
        setPaymentStatus('error');
        setErrorMessage(response.message || 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
      setPaymentStatus('error');
      setErrorMessage('Erro de comunicação com o servidor. Tente novamente mais tarde.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white shadow-lg rounded-lg text-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Validando link de pagamento...</h2>
        </div>
      </div>
    );
  }

  if (isError || paymentStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <ErrorState message={errorMessage || 'Ocorreu um erro ao validar o link de pagamento.'} />
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <OrderSuccess />
        </div>
      </div>
    );
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white shadow-lg rounded-lg text-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Processando sua solicitação...</h2>
          <p className="text-gray-500 mt-2">Por favor, aguarde enquanto confirmamos seu pedido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 bg-primary text-white">
          <h1 className="text-2xl font-bold">Confirmar Assinatura</h1>
          <p className="opacity-90">Escolha sua forma de pagamento para ativar sua conta.</p>
        </div>
        
        {tokenData && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Detalhes da assinatura</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Organização:</span>
                  <span className="font-medium">{tokenData.organizationName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Plano:</span>
                  <span className="font-medium">{tokenData.planName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Valor mensal:</span>
                  <span className="font-medium">R$ {typeof tokenData.planPrice === 'number' ? 
                    tokenData.planPrice.toFixed(2).replace('.', ',') : 
                    parseFloat(tokenData.planPrice).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    <span>Sua conta será ativada imediatamente.</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    <span>Você receberá as instruções de pagamento por e-mail.</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Forma de pagamento</h2>
              <PaymentForm token={params.token} onSuccess={handlePayment} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}