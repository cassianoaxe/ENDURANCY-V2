import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { PartnerBenefitForm } from "@/components/carteirinha/PartnerBenefitForm";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function PartnerBenefitNewPage() {
  const { user } = useAuth();
  const { partnerId } = useParams();
  const [, navigate] = useLocation();
  const numericPartnerId = partnerId ? parseInt(partnerId) : undefined;

  // Buscar dados do parceiro
  const { data: partner, isLoading } = useQuery({
    queryKey: ['/api/carteirinha/partners', numericPartnerId],
    queryFn: async () => {
      try {
        if (!numericPartnerId) throw new Error('ID do parceiro inválido');
        const response = await fetch(`/api/carteirinha/partners/${numericPartnerId}`);
        if (!response.ok) throw new Error('Falha ao carregar dados do parceiro');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar parceiro:', error);
        return null;
      }
    },
    enabled: !!numericPartnerId
  });

  // Função para redirecionar após sucesso
  const handleSuccess = () => {
    navigate(`/organization/carteirinha/partners/${partnerId}`);
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={`/organization/carteirinha/partners/${partnerId}`}>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold">Novo Benefício</h2>
            {partner && (
              <p className="text-muted-foreground">Para {partner.name}</p>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <PartnerBenefitForm partnerId={partnerId} onSuccess={handleSuccess} />
      )}
    </div>
  );
}