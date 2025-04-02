import React from "react";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Loader2, ShoppingCart, Clock, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Organization, Module } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type ModuleStatus = "not_contracted" | "pending_approval" | "active";

interface ModuleSubscriptionStatusProps {
  moduleName: string;
  moduleType: string;
  moduleDescription: string;
  modulePrice: number;
  moduleStatus: ModuleStatus;
  organizationId: number;
  onModuleActivated?: () => void;
}

export default function ModuleSubscriptionStatus({
  moduleName,
  moduleType,
  moduleDescription,
  modulePrice,
  moduleStatus,
  organizationId,
  onModuleActivated
}: ModuleSubscriptionStatusProps) {
  const { toast } = useToast();

  // Mutation para solicitar um módulo
  const requestModuleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/organization-modules/request", {
        moduleType: moduleType,
        organizationId: organizationId
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação para ativar o módulo foi enviada com sucesso e está em análise.",
        variant: "default",
      });
      
      // Invalidar queries para atualizar o status do módulo
      queryClient.invalidateQueries({ queryKey: ['/api/organization-modules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', organizationId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao solicitar módulo",
        description: error.message || "Não foi possível enviar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  if (moduleStatus === "active") {
    // Se o módulo estiver ativo, não mostra nada (deixa o conteúdo normal da página ser exibido)
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {moduleStatus === "not_contracted" ? (
              <>
                <ShoppingCart className="h-6 w-6 text-blue-500" />
                <span>Adicionar Módulo: {moduleName}</span>
              </>
            ) : (
              <>
                <Clock className="h-6 w-6 text-amber-500" />
                <span>Módulo em Processamento: {moduleName}</span>
              </>
            )}
          </CardTitle>
          <CardDescription className="text-gray-500 text-base">
            {moduleStatus === "not_contracted"
              ? "Este módulo não está incluído no seu plano atual. Contrate-o para desbloquear mais funcionalidades."
              : "Sua solicitação foi recebida e está em análise. Este processo pode levar de 1 a 2 horas."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {moduleStatus === "not_contracted" && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-lg text-blue-700 mb-2">Benefícios deste módulo</h3>
                <p className="text-blue-700 mb-4">
                  {moduleDescription}
                </p>
                <div className="flex items-center justify-between border-t border-blue-200 pt-4">
                  <div className="text-xl font-bold text-blue-700">
                    R$ {modulePrice.toFixed(2)}<span className="text-sm font-normal">/mês</span>
                  </div>
                  <Button 
                    onClick={() => requestModuleMutation.mutate()}
                    disabled={requestModuleMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {requestModuleMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Contratar agora
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {moduleStatus === "pending_approval" && (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-12 w-12 text-amber-500" />
                  </div>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h3 className="font-semibold text-lg text-amber-700 mb-2 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Aguardando liberação
                  </h3>
                  <div className="space-y-4 text-amber-700">
                    <p>
                      Sua solicitação para o módulo <strong>{moduleName}</strong> está em análise.
                    </p>
                    <p>
                      Este processo normalmente leva de 1 a 2 horas para ser concluído. Você receberá uma notificação quando o módulo estiver disponível.
                    </p>
                    <p>
                      Se precisar de ajuda ou tiver dúvidas, entre em contato com o suporte.
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => window.location.href = "/organization/dashboard"}>
                    Voltar para o Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}