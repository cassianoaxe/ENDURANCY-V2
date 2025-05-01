import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationSidebar from "./layout/OrganizationSidebar";

interface ShellProps {
  children: ReactNode;
  title?: string;
}

export function OrganizationShell({ children, title }: ShellProps) {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex">
      <OrganizationSidebar />
      <div className="ml-64 p-6 flex-1 max-w-full">
        {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
        {children}
      </div>
    </div>
  );
}