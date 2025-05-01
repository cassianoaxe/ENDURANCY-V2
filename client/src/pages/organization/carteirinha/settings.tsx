import { useState } from "react";
import { useLocation } from "wouter";
import { OrganizationShell } from "@/components/shell";
import { MembershipCardSettings } from "@/components/carteirinha/MembershipCardSettings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function MembershipCardSettingsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <OrganizationShell title="">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/organization/carteirinha/membership-cards">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-3xl font-bold">Configurações de Carteirinha</h2>
          </div>
        </div>

        <MembershipCardSettings />
      </div>
    </OrganizationShell>
  );
}