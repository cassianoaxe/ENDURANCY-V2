'use client';

import React from 'react';
import { 
  Plus, FileText, Users, Settings, Package, Calendar, 
  CreditCard, MessageSquare, Bell, Briefcase, Database,
  Download, BarChart, PlusCircle, Search, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type QuickAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  className?: string;
};

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function QuickActions({ 
  title = "Ações Rápidas", 
  actions, 
  columns = 3, 
  className 
}: QuickActionsProps) {
  // Mapeamento de colunas para classes Tailwind
  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4'
  };

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="py-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-3", columnClasses[columns])}>
          {actions.map((action, idx) => (
            <Button 
              key={idx}
              variant={action.variant || "outline"} 
              className={cn(
                "h-auto py-3 flex flex-col items-center justify-center gap-1 transition-all hover:shadow-md",
                action.className
              )}
              onClick={action.onClick}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {action.icon}
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de exemplo para pré-definir ações comuns de finaceiro
export function FinanceiroQuickActions({ onAction }: { onAction: (action: string) => void }) {
  const actions: QuickAction[] = [
    {
      label: 'Nova Receita',
      icon: <Plus className="h-5 w-5 text-green-500" />,
      onClick: () => onAction('nova-receita'),
      className: 'border-green-100 hover:border-green-200 hover:bg-green-50'
    },
    {
      label: 'Nova Despesa',
      icon: <CreditCard className="h-5 w-5 text-red-500" />,
      onClick: () => onAction('nova-despesa'),
      className: 'border-red-100 hover:border-red-200 hover:bg-red-50'
    },
    {
      label: 'Transferência',
      icon: <Database className="h-5 w-5 text-blue-500" />,
      onClick: () => onAction('transferencia'),
      className: 'border-blue-100 hover:border-blue-200 hover:bg-blue-50'
    }
  ];

  return <QuickActions actions={actions} />;
}

// Ações rápidas para módulo de vendas
export function VendasQuickActions({ onAction }: { onAction: (action: string) => void }) {
  const actions: QuickAction[] = [
    {
      label: 'Novo Produto',
      icon: <Package className="h-5 w-5 text-blue-500" />,
      onClick: () => onAction('novo-produto'),
      className: 'border-blue-100 hover:border-blue-200 hover:bg-blue-50'
    },
    {
      label: 'Nova Promoção',
      icon: <Bell className="h-5 w-5 text-purple-500" />,
      onClick: () => onAction('nova-promocao'),
      className: 'border-purple-100 hover:border-purple-200 hover:bg-purple-50'
    },
    {
      label: 'Ver Pedidos',
      icon: <FileText className="h-5 w-5 text-orange-500" />,
      onClick: () => onAction('ver-pedidos'),
      className: 'border-orange-100 hover:border-orange-200 hover:bg-orange-50'
    }
  ];

  return <QuickActions actions={actions} />;
}

// Ações rápidas para laboratório
export function LaboratoryQuickActions({ onAction }: { onAction: (action: string) => void }) {
  const actions: QuickAction[] = [
    {
      label: 'Nova Amostra',
      icon: <Plus className="h-5 w-5 text-green-500" />,
      onClick: () => onAction('nova-amostra'),
      className: 'border-green-100 hover:border-green-200 hover:bg-green-50'
    },
    {
      label: 'Pesquisar',
      icon: <Search className="h-5 w-5 text-blue-500" />,
      onClick: () => onAction('pesquisar-amostras'),
      className: 'border-blue-100 hover:border-blue-200 hover:bg-blue-50'
    },
    {
      label: 'Agendar Teste',
      icon: <Calendar className="h-5 w-5 text-purple-500" />,
      onClick: () => onAction('agendar-teste'),
      className: 'border-purple-100 hover:border-purple-200 hover:bg-purple-50'
    },
    {
      label: 'Pendentes',
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      onClick: () => onAction('amostras-pendentes'),
      className: 'border-orange-100 hover:border-orange-200 hover:bg-orange-50'
    }
  ];

  return <QuickActions actions={actions} columns={4} />;
}

// Ações rápidas para médicos
export function DoctorQuickActions({ onAction }: { onAction: (action: string) => void }) {
  const actions: QuickAction[] = [
    {
      label: 'Nova Consulta',
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      onClick: () => onAction('nova-consulta'),
      className: 'border-blue-100 hover:border-blue-200 hover:bg-blue-50'
    },
    {
      label: 'Novo Paciente',
      icon: <Users className="h-5 w-5 text-green-500" />,
      onClick: () => onAction('novo-paciente'),
      className: 'border-green-100 hover:border-green-200 hover:bg-green-50'
    },
    {
      label: 'Nova Prescrição',
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      onClick: () => onAction('nova-prescricao'),
      className: 'border-purple-100 hover:border-purple-200 hover:bg-purple-50'
    }
  ];

  return <QuickActions actions={actions} />;
}

// Ações rápidas para ComplyPay
export function ComplyPayQuickActions({ onAction }: { onAction: (action: string) => void }) {
  const actions: QuickAction[] = [
    {
      label: 'Nova Fatura',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      onClick: () => onAction('nova-fatura'),
      className: 'border-blue-100 hover:border-blue-200 hover:bg-blue-50'
    },
    {
      label: 'Nova Assinatura',
      icon: <CreditCard className="h-5 w-5 text-green-500" />,
      onClick: () => onAction('nova-assinatura'),
      className: 'border-green-100 hover:border-green-200 hover:bg-green-50'
    },
    {
      label: 'Relatórios',
      icon: <BarChart className="h-5 w-5 text-purple-500" />,
      onClick: () => onAction('relatorios'),
      className: 'border-purple-100 hover:border-purple-200 hover:bg-purple-50'
    }
  ];

  return <QuickActions actions={actions} />;
}

// Ações rápidas para administrador da organização
export function OrgAdminQuickActions({ onAction }: { onAction: (action: string) => void }) {
  const actions: QuickAction[] = [
    {
      label: 'Novo Usuário',
      icon: <Users className="h-5 w-5 text-blue-500" />,
      onClick: () => onAction('novo-usuario'),
      className: 'border-blue-100 hover:border-blue-200 hover:bg-blue-50'
    },
    {
      label: 'Configurações',
      icon: <Settings className="h-5 w-5 text-gray-500" />,
      onClick: () => onAction('configuracoes'),
      className: 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
    },
    {
      label: 'Relatórios',
      icon: <BarChart className="h-5 w-5 text-purple-500" />,
      onClick: () => onAction('relatorios'),
      className: 'border-purple-100 hover:border-purple-200 hover:bg-purple-50'
    }
  ];

  return <QuickActions actions={actions} />;
}

// Ações rápidas para pacientes
export function PatientQuickActions({ onAction }: { onAction: (action: string) => void }) {
  const actions: QuickAction[] = [
    {
      label: 'Agendar Consulta',
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      onClick: () => onAction('agendar-consulta'),
      className: 'border-blue-100 hover:border-blue-200 hover:bg-blue-50'
    },
    {
      label: 'Mensagens',
      icon: <MessageSquare className="h-5 w-5 text-green-500" />,
      onClick: () => onAction('mensagens'),
      className: 'border-green-100 hover:border-green-200 hover:bg-green-50'
    },
    {
      label: 'Histórico Médico',
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      onClick: () => onAction('historico-medico'),
      className: 'border-purple-100 hover:border-purple-200 hover:bg-purple-50'
    }
  ];

  return <QuickActions actions={actions} />;
}