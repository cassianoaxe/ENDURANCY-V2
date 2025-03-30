import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, CreditCard, Info, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Plan, ModulePlan } from "@shared/schema";
import { stripePromise, createPlanPaymentIntent, createModulePaymentIntent, confirmPlanPayment, confirmModulePayment } from "@/lib/stripeClient";

// Componente de formulário de pagamento
function CheckoutForm({ clientSecret, successUrl }: { clientSecret: string, successUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Primeiro, confirme o pagamento com o Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + successUrl,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Se houver erro, exiba o erro
        setErrorMessage(error.message || "Ocorreu um erro ao processar o pagamento.");
        toast({
          title: "Erro no pagamento",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Se o pagamento foi bem-sucedido, atualize o sistema
        try {
          // Obter o tipo e ID da URL
          const urlParams = new URLSearchParams(window.location.search);
          const type = urlParams.get('type') as 'plan' | 'module' || 'plan';
          const organizationId = parseInt(urlParams.get('organizationId') || '0', 10);
          
          // Confirmar o pagamento no backend
          if (type === 'plan') {
            await confirmPlanPayment(paymentIntent.id, organizationId);
          } else {
            await confirmModulePayment(paymentIntent.id);
          }
          
          // Exibe mensagem de sucesso
          toast({
            title: "Pagamento aprovado!",
            description: "Seu pagamento foi processado com sucesso.",
          });
          
          // Redireciona para a página de sucesso
          navigate(successUrl);
        } catch (confirmError: any) {
          setErrorMessage("Pagamento realizado, mas houve um erro ao atualizar o sistema. Entre em contato com o suporte.");
          toast({
            title: "Erro na confirmação",
            description: confirmError.message,
            variant: "destructive",
          });
        }
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
        {isProcessing ? "Processando..." : "Confirmar pagamento"}
      </Button>
    </form>
  );
}

interface CheckoutProps {
  type: 'plan' | 'module';
  itemId: number;
  organizationId?: number;
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [params, setParams] = useLocation();
  const { toast } = useToast();
  
  // Extrair parâmetros da URL
  const urlParams = new URLSearchParams(params.split('?')[1] || '');
  const type = urlParams.get('type') as 'plan' | 'module' || 'plan';
  const itemId = parseInt(urlParams.get('itemId') || '0', 10);
  const organizationId = parseInt(urlParams.get('organizationId') || '0', 10);
  const returnUrl = urlParams.get('returnUrl') || '/';
  
  // Buscar detalhes do plano ou módulo
  const { data: planData } = useQuery<Plan>({
    queryKey: ['/api/plans', itemId],
    enabled: type === 'plan' && itemId > 0,
  });
  
  const { data: modulePlanData } = useQuery<ModulePlan>({
    queryKey: ['/api/module-plans', itemId],
    enabled: type === 'module' && itemId > 0,
  });

  // Criar intent de pagamento ao carregar
  useEffect(() => {
    const createIntent = async () => {
      try {
        let clientSecret = '';
        
        // Usar as funções do cliente Stripe
        if (type === 'plan') {
          clientSecret = await createPlanPaymentIntent(itemId);
        } else {
          clientSecret = await createModulePaymentIntent(itemId, organizationId);
        }
        
        setClientSecret(clientSecret);
      } catch (error: any) {
        setProcessingError(error.message);
        toast({
          title: "Erro de processamento",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (itemId > 0) {
      createIntent();
    }
  }, [itemId, type, organizationId, toast]);

  // Item que está sendo comprado
  const item = type === 'plan' ? planData : modulePlanData;
  
  // Se não tiver Stripe ou item, mostrar erro
  if (!stripePromise) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração de pagamento inválida</AlertTitle>
          <AlertDescription>
            O sistema de pagamento não está configurado corretamente. 
            Entre em contato com o suporte para resolver este problema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!item && !processingError) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => setParams(returnUrl || '/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamento Seguro
              </CardTitle>
              <CardDescription>
                Todos os pagamentos são processados de forma segura pela Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processingError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro de processamento</AlertTitle>
                  <AlertDescription>{processingError}</AlertDescription>
                </Alert>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm clientSecret={clientSecret} successUrl={returnUrl || '/'} />
                </Elements>
              ) : (
                <div className="flex justify-center p-6">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item && (
                <>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="font-medium mb-2">Incluído:</div>
                    <ul className="space-y-1">
                      {Array.isArray(item.features) && item.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center font-medium">
                <span>Total:</span>
                <span className="text-xl">
                  R$ {typeof item?.price === 'number' ? item.price.toFixed(2).replace('.', ',') : item?.price}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Ciclo de cobrança: {type === 'plan' ? 'Mensal' : 
                  modulePlanData?.billing_cycle === 'monthly' ? 'Mensal' : 
                  modulePlanData?.billing_cycle === 'yearly' ? 'Anual' : 'Mensal'}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex-col items-start space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Ao confirmar o pagamento, você concorda com os termos de serviço 
                  e política de privacidade da plataforma.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-500" />
                <span>
                  Sua assinatura será ativada imediatamente após a confirmação do pagamento.
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}