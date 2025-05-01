import React from 'react';
import { MembershipCardForm } from '@/components/social/MembershipCardForm';
import { DashboardShell } from '@/components/shell';
import { useAuth } from '@/hooks/use-auth';

export default function MembershipCardNewPage() {
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
      <MembershipCardForm 
        organizationId={organizationId} 
        onSuccess={() => window.location.href = '/social/membership-cards'}
      />
    </DashboardShell>
  );
}