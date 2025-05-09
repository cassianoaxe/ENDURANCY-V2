import { useState } from "react";
import { useLocation } from "wouter";
import { PartnerForm } from "@/components/carteirinha/PartnerForm";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function PartnerNewPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Função para redirecionar após sucesso
  const handleSuccess = () => {
    navigate("/organization/carteirinha/partners");
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/organization/carteirinha/partners">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold">Novo Parceiro</h2>
        </div>
      </div>

      <PartnerForm onSuccess={handleSuccess} />
    </div>
  );
}