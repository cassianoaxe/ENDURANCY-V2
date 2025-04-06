"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentFormWrapperProps {
  token: string;
  onSuccess: (paymentType: string) => void;
  onCancel: () => void;
  planName: string;
  planPrice: string;
}

// Componente principal que exportamos
export default function PaymentFormWrapper(props: PaymentFormWrapperProps) {
  return <SimplifiedPaymentForm {...props} />;
}

// Componente simplificado para o formulário de pagamento manual
function SimplifiedPaymentForm({ 
  token, 
  onSuccess, 
  onCancel, 
  planName, 
  planPrice 
}: PaymentFormWrapperProps) {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'boleto' | 'pix' | 'transfer'>('pix');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    
    setPaymentStatus('processing');
    
    try {
      toast({
        title: "Processando solicitação",
        description: "Enviando dados para confirmação de pagamento...",
      });
      
      // Simular processamento (normalmente aqui faria uma chamada API)
      setTimeout(() => {
        console.log("Pedido confirmado com sucesso!");
        toast({
          title: "Confirmação enviada!",
          description: "As instruções de pagamento foram enviadas para seu e-mail.",
        });
        setPaymentStatus('success');
        onSuccess(paymentType);
      }, 1500);
    } catch (err: any) {
      console.error("Exceção ao processar a solicitação:", err);
      setErrorMessage(err.message || 'Ocorreu um erro inesperado no processamento.');
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
          <CardTitle className="text-center">Solicitação enviada!</CardTitle>
          <CardDescription className="text-center">
            Enviamos as instruções de pagamento para seu e-mail. Após a confirmação do pagamento, sua assinatura será ativada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => onSuccess('payment-requested')} className="w-full">
            Continuar
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
            <AlertTitle>Erro no processamento</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="fullName">Nome completo</label>
              <input
                type="text"
                id="fullName"
                className="w-full p-2 border rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Forma de pagamento</label>
              <div className="grid grid-cols-3 gap-3">
                <div 
                  className={`border rounded-md p-3 text-center cursor-pointer hover:bg-gray-50 ${paymentType === 'pix' ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => setPaymentType('pix')}
                >
                  <div className="font-medium">PIX</div>
                </div>
                <div 
                  className={`border rounded-md p-3 text-center cursor-pointer hover:bg-gray-50 ${paymentType === 'boleto' ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => setPaymentType('boleto')}
                >
                  <div className="font-medium">Boleto</div>
                </div>
                <div 
                  className={`border rounded-md p-3 text-center cursor-pointer hover:bg-gray-50 ${paymentType === 'transfer' ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => setPaymentType('transfer')}
                >
                  <div className="font-medium">Transferência</div>
                </div>
              </div>
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
                <Button type="submit">
                  Solicitar pagamento
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}