import { useState } from "react";
import { useLocation } from "wouter";
import { PartnersDiscountClub } from "@/components/carteirinha/PartnersDiscountClub";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export default function PartnersPage() {
  const { user } = useAuth();
  const [location, setLocation] = useState("");

  // Buscar dados da organização se necessário
  const { data: organizationData } = useQuery({
    queryKey: ['/api/organizations', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await fetch(`/api/organizations/${user.organizationId}`);
      if (!response.ok) throw new Error('Falha ao carregar dados da organização');
      return response.json();
    },
    enabled: !!user?.organizationId
  });

  return <PartnersDiscountClub />;
}