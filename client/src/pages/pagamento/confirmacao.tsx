import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import axios from 'axios';
import { Check, ChevronLeft, AlertTriangle, Loader } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

/**
 * Página para confirmar um pagamento através do token
 */
export default function ConfirmacaoPagamento() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/pagamento/confirmacao/:token');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    orderDetails?: any;
  }>({
    loading: true
  });

  // Função para buscar detalhes do pagamento
  const fetchPaymentDetails = async () => {
    if (!params?.token) {
      setStatus({
        loading: false,
        success: false,
        message: "Token de pagamento inválido ou não fornecido."
      });
      return;
    }

    try {
      const response = await axios.get(`/api/payment-email/details/${params.token}`);
      
      setStatus({
        loading: false,
        success: true,
        orderDetails: response.data.order
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes do pagamento:', error);
      setStatus({
        loading: false,
        success: false,
        message: "Não foi possível obter os detalhes do pagamento. O token pode ser inválido ou expirado."
      });
    }
  };

  // Função para confirmar pagamento
  const confirmPayment = async () => {
    if (!params?.token) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await axios.post('/api/payment-email/confirm', {
        token: params.token
      });
      
      setStatus({
        loading: false,
        success: response.data.success,
        message: response.data.message,
        orderDetails: response.data.order
      });
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      setStatus({
        loading: false,
        success: false,
        message: "Erro ao processar a confirmação de pagamento. Por favor, tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Carregar detalhes do pagamento ao iniciar a página
  useEffect(() => {
    if (match && params?.token) {
      fetchPaymentDetails();
    }
  }, [match, params?.token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="w-full shadow-lg">
          <CardHeader className="bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center mb-2">
              <img src="/assets/logo.svg" alt="Endurancy Logo" className="h-8 mr-2" />
              <CardTitle className="text-2xl">Confirmação de Pagamento</CardTitle>
            </div>
            <CardDescription>
              Confirme o pagamento do seu plano para ativar os módulos contratados.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 pb-4">
            {status.loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-gray-600">Carregando detalhes do pagamento...</p>
              </div>
            ) : status.success === false ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  {status.message || "Ocorreu um erro ao processar o pagamento."}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {status.message ? (
                  <Alert className={status.success ? "bg-green-50 border-green-200 mb-4" : "bg-red-50 border-red-200 mb-4"}>
                    {status.success ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <AlertTitle className={status.success ? "text-green-800" : "text-red-800"}>
                      {status.success ? "Sucesso" : "Atenção"}
                    </AlertTitle>
                    <AlertDescription className={status.success ? "text-green-700" : "text-red-700"}>
                      {status.message}
                    </AlertDescription>
                  </Alert>
                ) : null}
                
                {status.orderDetails && (
                  <div className="space-y-4 mt-4">
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                      <h3 className="font-semibold text-lg mb-2">Detalhes do Pedido</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Organização:</span>
                          <span className="font-medium">{status.orderDetails.organizationName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Plano:</span>
                          <span className="font-medium">{status.orderDetails.planName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Valor:</span>
                          <span className="font-medium">R$ {(status.orderDetails.total || 0).toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className={`font-medium ${status.orderDetails.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                            {status.orderDetails.status === 'completed' ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {status.orderDetails.status !== 'completed' && (
                      <Button 
                        className="w-full" 
                        onClick={confirmPayment}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Processando...
                          </>
                        ) : (
                          <>
                            Confirmar Pagamento
                            <Check className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
          
          <CardFooter className="pt-2 pb-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar ao Início
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}