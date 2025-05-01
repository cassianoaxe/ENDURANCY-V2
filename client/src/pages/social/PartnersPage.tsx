import React from 'react';
import { PartnersDiscountClub } from '@/components/social/PartnersDiscountClub';
import { DashboardShell } from '@/components/shell';
import { useAuth } from '@/hooks/use-auth';

export default function PartnersPage() {
  const { user } = useAuth();
  const organizationId = user?.organizationId;

  if (!organizationId) {
    return (
      <DashboardShell>
        <div className="p-4 border rounded-lg bg-orange-50 text-orange-700">
          <h2 className="text-lg font-semibold">Organização não encontrada</h2>
          <p>Você precisa estar vinculado a uma organização para acessar esta funcionalidade.</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PartnersDiscountClub organizationId={organizationId} />
    </DashboardShell>
  );
}