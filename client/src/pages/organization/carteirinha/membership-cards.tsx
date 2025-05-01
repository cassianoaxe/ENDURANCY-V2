import { useState } from "react";
import { useLocation } from "wouter";
import { OrganizationShell } from "@/components/shell";
import { MembershipCardDashboard } from "@/components/carteirinha/MembershipCardDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function MembershipCardsPage() {
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

  return (
    <OrganizationShell title="">
      <MembershipCardDashboard />
    </OrganizationShell>
  );
}