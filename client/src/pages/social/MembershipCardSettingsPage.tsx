import React from 'react';
import { MembershipCardSettings } from '@/components/social/MembershipCardSettings';
import { DashboardShell } from '@/components/shell';
import { useAuth } from '@/hooks/use-auth';

export default function MembershipCardSettingsPage() {
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
      <MembershipCardSettings 
        organizationId={organizationId} 
        onSuccess={() => window.location.href = '/social/membership-cards'}
      />
    </DashboardShell>
  );
}